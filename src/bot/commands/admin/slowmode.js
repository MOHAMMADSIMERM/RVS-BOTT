const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slowmode')
        .setDescription('Configure slowmode rate limit for the current channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addIntegerOption(opt =>
            opt.setName('seconds')
                .setDescription('Slowmode duration in seconds (0 to disable, up to 21600 / 6 hours)')
                .setRequired(true)
                .setMinValue(0)
                .setMaxValue(21600)
        ),

    async execute(interaction) {
        const seconds = interaction.options.getInteger('seconds');

        try {
            await interaction.channel.setRateLimitPerUser(seconds);

            if (seconds === 0) {
                return interaction.reply({ content: '⚡ **Slowmode has been disabled** in this channel.' });
            } else {
                return interaction.reply({ content: `⏳ Channel slowmode set to **${seconds}** second(s) per user.` });
            }
        } catch (err) {
            console.error('[Slowmode] Error:', err);
            return interaction.reply({ content: `❌ Failed to set slowmode: ${err.message}`, ephemeral: true });
        }
    }
};
