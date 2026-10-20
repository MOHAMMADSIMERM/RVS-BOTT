const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../services/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gamble')
        .setDescription('Roll a 100-sided die against RAVANAS')
        .addIntegerOption(opt =>
            opt.setName('bet')
                .setDescription('Amount of coins to bet')
                .setRequired(true)
                .setMinValue(25)
        ),

    async execute(interaction) {
        const bet = interaction.options.getInteger('bet');
        const userId = interaction.user.id;
        const profile = db.getUser(userId);

        if (profile.balance < bet) {
            return interaction.reply({
                content: `❌ You do not have enough coins! Balance: **${profile.balance}** coins.`,
                ephemeral: true
            });
        }

        const userRoll = Math.floor(Math.random() * 100) + 1;
        const botRoll = Math.floor(Math.random() * 100) + 1;

        let won = false;
        let tie = false;

        if (userRoll > botRoll) {
            won = true;
            profile.balance += bet;
        } else if (userRoll === botRoll) {
            tie = true;
        } else {
            profile.balance -= bet;
        }
        db.updateUser(userId, profile);

        const embed = new EmbedBuilder()
            .setTitle(tie ? '🤝 An Even Clash!' : won ? '🏆 Victory Over RAVANAS!' : '💀 Defeated By The Sovereign!')
            .setColor(tie ? '#4CC9F0' : won ? '#06D6A0' : '#E63946')
            .setDescription(`Both combatants threw their enchanted d100 dice into the arena!`)
            .addFields(
                { name: `🎲 Your Roll`, value: `**${userRoll}**`, inline: true },
                { name: `👹 RAVANAS Roll`, value: `**${botRoll}**`, inline: true },
                { name: 'Outcome', value: tie ? 'Stalemate (Bet refunded)' : won ? `**+${bet} coins**` : `**-${bet} coins**`, inline: true },
                { name: 'New Balance', value: `\`${profile.balance.toLocaleString()}\` coins`, inline: false }
            )
            .setFooter({ text: 'High rolls rule the underworld' })
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
};
