const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../services/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Display the top champions of the realm by XP or Wealth')
        .addStringOption(opt =>
            opt.setName('type')
                .setDescription('Leaderboard category')
                .setRequired(false)
                .addChoices(
                    { name: '⭐ Level & Experience', value: 'xp' },
                    { name: '🪙 Wealth & Economy', value: 'economy' }
                )
        ),

    async execute(interaction) {
        const type = interaction.options.getString('type') || 'xp';
        const top = db.getLeaderboard(type, 10);

        if (top.length === 0) {
            return interaction.reply({
                content: '📜 No champions have risen to the leaderboard yet. Start chatting or working!',
                ephemeral: true
            });
        }

        const isXp = type === 'xp';
        const embed = new EmbedBuilder()
            .setTitle(isXp ? '🏆 Hall of Legends: Experience Leaderboard' : '💰 Imperial Treasury: Wealth Leaderboard')
            .setColor(isXp ? '#7209B7' : '#FFD166')
            .setDescription(`Top 10 players across the domain:`)
            .setFooter({ text: 'RAVANAS Leaderboard System', iconURL: interaction.client.user?.displayAvatarURL() })
            .setTimestamp();

        const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

        let description = '';
        for (let i = 0; i < top.length; i++) {
            const user = top[i];
            const medal = medals[i] || `#${i + 1}`;
            if (isXp) {
                description += `${medal} <@${user.userId}> — **Level ${user.level}** (\`${user.xp.toLocaleString()} XP\`)\n`;
            } else {
                description += `${medal} <@${user.userId}> — **${user.totalWealth.toLocaleString()} coins** (Wallet: ${user.balance.toLocaleString()} | Bank: ${user.bank.toLocaleString()})\n`;
            }
        }

        embed.setDescription(description || 'Empty records');
        return interaction.reply({ embeds: [embed] });
    }
};
