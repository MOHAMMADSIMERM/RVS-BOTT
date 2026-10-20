const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../services/db');

function createProgressBar(current, max, totalBars = 12) {
    const percent = Math.min(Math.max(current / max, 0), 1);
    const filledBars = Math.round(totalBars * percent);
    const emptyBars = totalBars - filledBars;
    return '▓'.repeat(filledBars) + '░'.repeat(emptyBars) + ` ${Math.round(percent * 100)}%`;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('View your current level, experience points, and progression card')
        .addUserOption(opt =>
            opt.setName('target')
                .setDescription('View another member rank (optional)')
                .setRequired(false)
        ),

    async execute(interaction) {
        const target = interaction.options.getUser('target') || interaction.user;
        const profile = db.getUser(target.id);
        const requiredXp = db.getXpForLevel(profile.level);

        // Find server rank
        const allUsers = db.getLeaderboard('xp', 1000);
        const rankIndex = allUsers.findIndex(u => u.userId === target.id);
        const rankPosition = rankIndex !== -1 ? `#${rankIndex + 1}` : 'Unranked';

        const bar = createProgressBar(profile.xp, requiredXp);

        const embed = new EmbedBuilder()
            .setTitle(`🎖️ Rank Card • ${target.username}`)
            .setColor('#7209B7')
            .setThumbnail(target.displayAvatarURL())
            .addFields(
                { name: 'Server Rank', value: `\`${rankPosition}\``, inline: true },
                { name: 'Level', value: `\`Level ${profile.level}\``, inline: true },
                { name: 'Total XP', value: `\`${profile.xp.toLocaleString()} / ${requiredXp.toLocaleString()} XP\``, inline: true },
                { name: 'Level Progression', value: `\`${bar}\``, inline: false },
                { name: 'Bio', value: profile.bio || 'A loyal subject of RAVANAS', inline: false }
            )
            .setFooter({ text: 'Keep chatting to gain more experience!', iconURL: interaction.client.user?.displayAvatarURL() })
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
};
