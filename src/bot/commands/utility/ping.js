const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Test bot connectivity and API latency'),

    async execute(interaction) {
        const sent = await interaction.reply({ content: '🏓 Pinging the ether...', fetchReply: true });
        const roundtrip = sent.createdTimestamp - interaction.createdTimestamp;
        const wsPing = interaction.client.ws.ping;

        const embed = new EmbedBuilder()
            .setTitle('⚡ RAVANAS Latency Diagnostics')
            .setColor('#06D6A0')
            .addFields(
                { name: '🔄 Roundtrip Latency', value: `\`${roundtrip}ms\``, inline: true },
                { name: '💓 Discord Gateway Ping', value: `\`${wsPing}ms\``, inline: true }
            )
            .setFooter({ text: 'RAVANAS is running optimally' })
            .setTimestamp();

        return interaction.editReply({ content: null, embeds: [embed] });
    }
};
