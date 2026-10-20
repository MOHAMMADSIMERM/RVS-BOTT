const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const db = require('../../services/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a member from the server with RAVANAS authority')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The member to ban')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the ban')
                .setRequired(false)
        )
        .addIntegerOption(option =>
            option.setName('delete_days')
                .setDescription('Days of message history to delete (0 to 7)')
                .setMinValue(0)
                .setMaxValue(7)
                .setRequired(false)
        ),

    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const deleteDays = interaction.options.getInteger('delete_days') || 0;

        if (target.id === interaction.user.id) {
            return interaction.reply({ content: '❌ You cannot ban yourself!', ephemeral: true });
        }

        if (target.id === interaction.client.user.id) {
            return interaction.reply({ content: '❌ You cannot ban RAVANAS!', ephemeral: true });
        }

        const member = await interaction.guild.members.fetch(target.id).catch(() => null);
        if (member) {
            if (!member.bannable) {
                return interaction.reply({
                    content: '❌ RAVANAS cannot ban this member. Their role is higher than or equal to my role.',
                    ephemeral: true
                });
            }

            if (member.roles.highest.position >= interaction.member.roles.highest.position && interaction.user.id !== interaction.guild.ownerId) {
                return interaction.reply({
                    content: '❌ You cannot ban someone with a role higher than or equal to yours.',
                    ephemeral: true
                });
            }
        }

        try {
            await interaction.guild.members.ban(target.id, {
                deleteMessageSeconds: deleteDays * 86400,
                reason: `${reason} | Banned by ${interaction.user.tag}`
            });

            db.logModAction({
                guildId: interaction.guild.id,
                targetId: target.id,
                moderatorId: interaction.user.id,
                action: 'BAN',
                reason,
                extra: { deleteDays }
            });

            const embed = new EmbedBuilder()
                .setTitle('⚖️ Member Banished | RAVANAS Law')
                .setColor('#E63946')
                .setThumbnail(target.displayAvatarURL())
                .addFields(
                    { name: 'Target', value: `${target.tag} (\`${target.id}\`)`, inline: true },
                    { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
                    { name: 'Reason', value: reason, inline: false },
                    { name: 'History Purged', value: `${deleteDays} day(s)`, inline: true }
                )
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
        } catch (err) {
            console.error('[Ban] Error:', err);
            return interaction.reply({ content: `❌ Failed to ban: ${err.message}`, ephemeral: true });
        }
    }
};
