const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const db = require('../../services/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Temporarily timeout/mute a member in the server')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The member to mute/timeout')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('duration')
                .setDescription('Duration in minutes (e.g. 5, 60, 1440 for 24h, 0 to remove timeout)')
                .setRequired(true)
                .setMinValue(0)
                .setMaxValue(40320) // max 28 days
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the timeout')
                .setRequired(false)
        ),

    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const minutes = interaction.options.getInteger('duration');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (target.id === interaction.user.id) {
            return interaction.reply({ content: '❌ You cannot timeout yourself!', ephemeral: true });
        }

        const member = await interaction.guild.members.fetch(target.id).catch(() => null);
        if (!member) {
            return interaction.reply({ content: '❌ Member is not in this server.', ephemeral: true });
        }

        if (!member.moderatable) {
            return interaction.reply({ content: '❌ RAVANAS cannot timeout this member due to role hierarchy.', ephemeral: true });
        }

        try {
            if (minutes === 0) {
                await member.timeout(null, `Timeout removed by ${interaction.user.tag}`);
                db.logModAction({
                    guildId: interaction.guild.id,
                    targetId: target.id,
                    moderatorId: interaction.user.id,
                    action: 'UNTIMEOUT',
                    reason
                });

                return interaction.reply({
                    content: `🔊 Timeout has been removed for **${target.tag}** by ${interaction.user.tag}.`
                });
            }

            const ms = minutes * 60 * 1000;
            await member.timeout(ms, `${reason} | Timed out by ${interaction.user.tag}`);

            db.logModAction({
                guildId: interaction.guild.id,
                targetId: target.id,
                moderatorId: interaction.user.id,
                action: 'TIMEOUT',
                reason,
                extra: { minutes }
            });

            const embed = new EmbedBuilder()
                .setTitle('⏳ Member Timed Out | RAVANAS Silence')
                .setColor('#2A9D8F')
                .setThumbnail(target.displayAvatarURL())
                .addFields(
                    { name: 'Target', value: `${target.tag} (\`${target.id}\`)`, inline: true },
                    { name: 'Duration', value: `${minutes} minute(s)`, inline: true },
                    { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
                    { name: 'Reason', value: reason, inline: false }
                )
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
        } catch (err) {
            console.error('[Timeout] Error:', err);
            return interaction.reply({ content: `❌ Failed to timeout member: ${err.message}`, ephemeral: true });
        }
    }
};
