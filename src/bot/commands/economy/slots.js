const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../services/db');

const SYMBOLS = ['👑', '💎', '🔥', '🍒', '🔔', '💀'];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slots')
        .setDescription('Pull the lever on the RAVANAS infernal slot machine')
        .addIntegerOption(opt =>
            opt.setName('bet')
                .setDescription('Amount of coins to wager')
                .setRequired(true)
                .setMinValue(20)
        ),

    async execute(interaction) {
        const bet = interaction.options.getInteger('bet');
        const userId = interaction.user.id;
        const profile = db.getUser(userId);

        if (profile.balance < bet) {
            return interaction.reply({
                content: `❌ You do not have enough coins! Your current balance is **${profile.balance}** coins.`,
                ephemeral: true
            });
        }

        const r1 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        const r2 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        const r3 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];

        let multiplier = 0;
        let outcomeTitle = '';

        if (r1 === r2 && r2 === r3) {
            if (r1 === '👑') {
                multiplier = 10;
                outcomeTitle = '👑 ULTRA JACKPOT! RAVANAS CROWN (10x)';
            } else if (r1 === '💎') {
                multiplier = 7;
                outcomeTitle = '💎 DIAMOND FEVER! (7x)';
            } else if (r1 === '💀') {
                multiplier = 5;
                outcomeTitle = '💀 DEMONIC TRIFECTA! (5x)';
            } else {
                multiplier = 3;
                outcomeTitle = '🎉 TRIPLE MATCH! (3x)';
            }
        } else if (r1 === r2 || r2 === r3 || r1 === r3) {
            multiplier = 1.5;
            outcomeTitle = '✨ DOUBLE PAIR! (1.5x)';
        } else {
            multiplier = 0;
            outcomeTitle = '💨 NO MATCH! Better luck next spin.';
        }

        const profit = multiplier > 0 ? Math.floor(bet * multiplier) : -bet;
        profile.balance += profit;
        db.updateUser(userId, profile);

        const embed = new EmbedBuilder()
            .setTitle(outcomeTitle)
            .setColor(multiplier > 0 ? '#FFD166' : '#6C757D')
            .setDescription(`
╔═════════════════╗
║  🎰 **RAVANAS SLOTS** 🎰  ║
╠═════════════════╣
║     [ ${r1} | ${r2} | ${r3} ]     ║
╚═════════════════╝
            `)
            .addFields(
                { name: 'Bet', value: `${bet} coins`, inline: true },
                { name: 'Result', value: profit > 0 ? `**+${profit} coins**` : `**-${bet} coins**`, inline: true },
                { name: 'Wallet Balance', value: `\`${profile.balance.toLocaleString()}\` coins`, inline: true }
            )
            .setFooter({ text: 'May the reels spin in your favor!' })
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
};
