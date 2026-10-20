const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../services/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Check your current RAVANAS vault balance and net worth')
        .addUserOption(opt =>
            opt.setName('target')
                .setDescription('View another member balance (optional)')
                .setRequired(false)
        ),

    async execute(interaction) {
        const target = interaction.options.getUser('target') || interaction.user;
        const profile = db.getUser(target.id);
        const netWorth = (profile.balance || 0) + (profile.bank || 0);

        const embed = new EmbedBuilder()
            .setTitle(`💰 Vault of ${target.username}`)
            .setColor('#FFD166')
            .setThumbnail(target.displayAvatarURL())
            .addFields(
                { name: '🪙 Wallet', value: `\`${profile.balance.toLocaleString()}\` coins`, inline: true },
                { name: '🏦 Royal Bank', value: `\`${profile.bank.toLocaleString()}\` coins`, inline: true },
                { name: '💎 Net Worth', value: `\`${netWorth.toLocaleString()}\` coins`, inline: true },
                { name: '🔥 Daily Streak', value: `\`${profile.dailyStreak || 0}\` days`, inline: true },
                { name: '⭐ Level', value: `\`Level ${profile.level || 1}\``, inline: true }
            )
            .setFooter({ text: 'RAVANAS Economy System', iconURL: interaction.client.user?.displayAvatarURL() })
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
};
