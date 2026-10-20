const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const db = require('../../services/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Revoke a ban for a user by their Discord User ID')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addStringOption(option =>
            option.setName('user_id')
                .setDescription('The Discord ID of the user to unban')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for lifting the ban')
                .setRequired(false)
        ),

    async execute(interaction) {
        const userId = interaction.options.getString('user_id').trim();
        const reason = interaction.options.getString('reason') || 'Ban revoked by administrator';

        try {
            const banInfo = await interaction.guild.bans.fetch(userId).catch(() => null);
            if (!banInfo) {
                return interaction.reply({
                    content: `❌ User with ID \`${userId}\` is not currently banned in this server.`,
                    ephemeral: true
                });
            }

            await interaction.guild.bans.remove(userId, `${reason} | Unbanned by ${interaction.user.tag}`);

            db.logModAction({
                guildId: interaction.guild.id,
                targetId: userId,
                moderatorId: interaction.user.id,
                action: 'UNBAN',
                reason
            });

            const embed = new EmbedBuilder()
                .setTitle('🕊️ Ban Revoked | RAVANAS Clemency')
                .setColor('#06D6A0')
                .addFields(
                    { name: 'User', value: `${banInfo.user.tag} (\`${userId}\`)`, inline: true },
                    { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
                    { name: 'Reason', value: reason, inline: false }
                )
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
        } catch (err) {
            console.error('[Unban] Error:', err);
            return interaction.reply({ content: `❌ Failed to unban user: ${err.message}`, ephemeral: true });
        }
    }
};
