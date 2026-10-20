const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const db = require('../../services/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Manage member disciplinary warnings')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addSubcommand(sub =>
            sub.setName('add')
                .setDescription('Issue a formal warning to a member')
                .addUserOption(opt => opt.setName('target').setDescription('Member to warn').setRequired(true))
                .addStringOption(opt => opt.setName('reason').setDescription('Reason for the warning').setRequired(true))
        )
        .addSubcommand(sub =>
            sub.setName('list')
                .setDescription('View the warning history of a member')
                .addUserOption(opt => opt.setName('target').setDescription('Member to inspect').setRequired(true))
        )
        .addSubcommand(sub =>
            sub.setName('clear')
                .setDescription('Clear all warnings for a member')
                .addUserOption(opt => opt.setName('target').setDescription('Member to clear warnings for').setRequired(true))
        ),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const target = interaction.options.getUser('target');

        if (sub === 'add') {
            const reason = interaction.options.getString('reason');

            if (target.id === interaction.user.id) {
                return interaction.reply({ content: '❌ You cannot warn yourself!', ephemeral: true });
            }

            const warning = db.addWarning(interaction.guild.id, target.id, interaction.user.id, reason);
            const totalWarns = db.getWarnings(interaction.guild.id, target.id).length;

            const embed = new EmbedBuilder()
                .setTitle('⚠️ Disciplinary Warning Issued | RAVANAS Order')
                .setColor('#F72585')
                .setThumbnail(target.displayAvatarURL())
                .addFields(
                    { name: 'Warned Member', value: `${target.tag} (\`${target.id}\`)`, inline: true },
                    { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
                    { name: 'Total Server Warnings', value: `\`${totalWarns}\``, inline: true },
                    { name: 'Reason', value: reason, inline: false },
                    { name: 'Warning ID', value: `\`${warning.id}\``, inline: true }
                )
                .setTimestamp();

            // Try to DM the member
            target.send({
                content: `⚠️ You received a formal warning in **${interaction.guild.name}** for: *${reason}*`
            }).catch(() => null);

            return interaction.reply({ embeds: [embed] });
        }

        if (sub === 'list') {
            const warns = db.getWarnings(interaction.guild.id, target.id);

            if (warns.length === 0) {
                return interaction.reply({
                    content: `✅ **${target.tag}** has a spotless record (0 warnings).`,
                    ephemeral: true
                });
            }

            const embed = new EmbedBuilder()
                .setTitle(`📋 Warning Dossier: ${target.tag}`)
                .setColor('#4CC9F0')
                .setDescription(`Total Recorded Infractions: **${warns.length}**`)
                .setThumbnail(target.displayAvatarURL());

            warns.slice(-10).forEach((w, idx) => {
                const date = new Date(w.timestamp).toLocaleDateString();
                embed.addFields({
                    name: `#${idx + 1} • ID: \`${w.id}\` (${date})`,
                    value: `**Reason:** ${w.reason}\n**Mod:** <@${w.moderatorId}>`
                });
            });

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (sub === 'clear') {
            const clearedCount = db.clearWarnings(interaction.guild.id, target.id);

            db.logModAction({
                guildId: interaction.guild.id,
                targetId: target.id,
                moderatorId: interaction.user.id,
                action: 'CLEAR_WARNS',
                reason: `Cleared ${clearedCount} warnings`
            });

            return interaction.reply({
                content: `🧹 Cleared **${clearedCount}** warnings for **${target.tag}**.`
            });
        }
    }
};
