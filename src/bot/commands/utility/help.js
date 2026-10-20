const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Explore all RAVANAS capabilities, commands, and dashboard guides'),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('📖 RAVANAS Sovereign Command Handbook')
            .setColor('#E63946')
            .setDescription(`
Welcome, traveler. **RAVANAS** is your all-in-one Discord sovereign and web management ecosystem.

**🌐 Web Dashboard URL:** \`http://localhost:3000\`
*Manage announcements, view live audit logs, execute moderation actions, and configure server settings directly from the browser!*

Select a category below or explore the modules:
            `)
            .addFields(
                {
                    name: '🛡️ Administration & Moderation',
                    value: '`/announce`, `/ban`, `/unban`, `/kick`, `/timeout`, `/warn`, `/purge`, `/slowmode`, `/lock`, `/role`'
                },
                {
                    name: '🌸 Koya Anime Interactions',
                    value: '`/interact action:[hug|pat|kiss|slap|punch|poke|cuddle|dance]`'
                },
                {
                    name: '🪙 Economy & Gambling',
                    value: '`/balance`, `/daily`, `/work`, `/coinflip`, `/slots`, `/gamble`, `/rob`'
                },
                {
                    name: '⭐ Leveling & Progression',
                    value: '`/rank`, `/leaderboard`'
                },
                {
                    name: '⚙️ Server Configuration',
                    value: '`/setwelcome`, `/setgoodbye`, `/setlogs`, `/autorole`'
                },
                {
                    name: '📊 Utility & Diagnostics',
                    value: '`/botinfo`, `/serverinfo`, `/userinfo`, `/ping`, `/help`'
                }
            )
            .setFooter({ text: 'RAVANAS • Power, Order, and Immersion', iconURL: interaction.client.user?.displayAvatarURL() })
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
};
