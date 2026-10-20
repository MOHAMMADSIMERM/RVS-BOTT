const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../services/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('Wager your coins on a fateful flip of the enchanted gold coin')
        .addStringOption(opt =>
            opt.setName('choice')
                .setDescription('Heads or Tails')
                .setRequired(true)
                .addChoices(
                    { name: '🪙 Heads', value: 'heads' },
                    { name: '🪙 Tails', value: 'tails' }
                )
        )
        .addIntegerOption(opt =>
            opt.setName('bet')
                .setDescription('Amount of coins to bet (minimum 10)')
                .setRequired(true)
                .setMinValue(10)
        ),

    async execute(interaction) {
        const choice = interaction.options.getString('choice');
        const bet = interaction.options.getInteger('bet');
        const userId = interaction.user.id;
        const profile = db.getUser(userId);

        if (profile.balance < bet) {
            return interaction.reply({
                content: `❌ You do not have enough coins! Your wallet contains **${profile.balance}** coins.`,
                ephemeral: true
            });
        }

        const outcomes = ['heads', 'tails'];
        const result = outcomes[Math.floor(Math.random() * outcomes.length)];
        const won = (result === choice);

        if (won) {
            profile.balance += bet;
        } else {
            profile.balance -= bet;
        }
        db.updateUser(userId, profile);

        const embed = new EmbedBuilder()
            .setTitle(won ? '🎉 Fortune Smiles Upon You!' : '💀 The Coin Has Fallen Against You!')
            .setColor(won ? '#06D6A0' : '#E63946')
            .setDescription(`The gold coin spun high into the air and landed on **${result.toUpperCase()}**!`)
            .addFields(
                { name: 'Your Prediction', value: choice.toUpperCase(), inline: true },
                { name: 'Result', value: result.toUpperCase(), inline: true },
                { name: won ? 'Profit' : 'Loss', value: won ? `**+${bet}** coins` : `**-${bet}** coins`, inline: true },
                { name: 'Wallet Balance', value: `\`${profile.balance.toLocaleString()}\` coins`, inline: true }
            )
            .setFooter({ text: 'RAVANAS House of Chance' })
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
};
