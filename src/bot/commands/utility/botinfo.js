const { SlashCommandBuilder, EmbedBuilder, version: djsVersion } = require('discord.js');
const os = require('os');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('botinfo')
        .setDescription('Display detailed technical and operational diagnostics of RAVANAS'),

    async execute(interaction) {
        const client = interaction.client;
        const uptimeSeconds = Math.floor(process.uptime());
        const days = Math.floor(uptimeSeconds / 86400);
        const hours = Math.floor((uptimeSeconds % 86400) / 3600);
        const minutes = Math.floor((uptimeSeconds % 3600) / 60);
        const seconds = uptimeSeconds % 60;

        const uptimeStr = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        const memUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const totalGuilds = client.guilds.cache.size;
        const totalUsers = client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0);

        const embed = new EmbedBuilder()
            .setTitle('👑 RAVANAS • Sovereign AI System')
            .setColor('#E63946')
            .setThumbnail(client.user.displayAvatarURL())
            .setDescription('An almighty multi-purpose Discord bot & web ecosystem inspired by Koya. Featuring complete server governance, anime interactions, leveling, RPG economy, and real-time web command controls.')
            .addFields(
                { name: '🤖 Bot Name', value: client.user.username, inline: true },
                { name: '⚡ Gateway Ping', value: `${client.ws.ping}ms`, inline: true },
                { name: '⏱️ Uptime', value: uptimeStr, inline: true },
                { name: '🏰 Servers', value: `${totalGuilds}`, inline: true },
                { name: '👥 Total Subjects', value: `${totalUsers.toLocaleString()}`, inline: true },
                { name: '💾 RAM Usage', value: `${memUsed} MB`, inline: true },
                { name: '📦 Node.js', value: process.version, inline: true },
                { name: '🛠️ Discord.js', value: `v${djsVersion}`, inline: true },
                { name: '🌐 Web Dashboard', value: `Running on Port 3000`, inline: true }
            )
            .setFooter({ text: 'RAVANAS • Supreme Discord Sovereign', iconURL: client.user.displayAvatarURL() })
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
};
