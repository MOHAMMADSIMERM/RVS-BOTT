const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../services/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Claim your daily RAVANAS gold reward and maintain your streak'),

    async execute(interaction) {
        const userId = interaction.user.id;
        const profile = db.getUser(userId);
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        const gracePeriod = 48 * 60 * 60 * 1000;

        const timeSince = now - (profile.lastDaily || 0);

        if (timeSince < oneDay) {
            const remaining = oneDay - timeSince;
            const hours = Math.floor(remaining / (60 * 60 * 1000));
            const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
            return interaction.reply({
                content: `⏳ You have already claimed your daily tribute! Return in **${hours}h ${minutes}m**.`,
                ephemeral: true
            });
        }

        // Streak calculation
        let streak = profile.dailyStreak || 0;
        if (timeSince > gracePeriod) {
            streak = 1; // reset streak
        } else {
            streak += 1;
        }

        const baseReward = 500;
        const streakBonus = (streak - 1) * 50;
        const totalReward = baseReward + streakBonus;

        profile.balance += totalReward;
        profile.dailyStreak = streak;
        profile.lastDaily = now;
        db.updateUser(userId, profile);

        const embed = new EmbedBuilder()
            .setTitle('✨ Daily Royal Tribute Claimed!')
            .setColor('#06D6A0')
            .setDescription(`**${interaction.user.username}**, RAVANAS bestows his daily favor upon you!`)
            .addFields(
                { name: '🪙 Base Reward', value: `+${baseReward} coins`, inline: true },
                { name: '🔥 Streak Bonus', value: `+${streakBonus} coins`, inline: true },
                { name: '💰 Total Claimed', value: `**+${totalReward} coins**`, inline: true },
                { name: '🔥 Current Streak', value: `**${streak}** consecutive day(s)`, inline: true },
                { name: '💳 New Balance', value: `\`${profile.balance.toLocaleString()}\` coins`, inline: true }
            )
            .setFooter({ text: 'Come back tomorrow to keep your streak alive!' })
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
};
