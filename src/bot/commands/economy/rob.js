const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../services/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rob')
        .setDescription('Attempt to stealthily pickpocket coins from another user (High Risk!)')
        .addUserOption(opt =>
            opt.setName('target')
                .setDescription('The member you want to target')
                .setRequired(true)
        ),

    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const userId = interaction.user.id;

        if (target.id === userId) {
            return interaction.reply({ content: '❌ You cannot rob yourself, silly!', ephemeral: true });
        }

        if (target.bot) {
            return interaction.reply({ content: '❌ Bots carry no physical coins in their pockets!', ephemeral: true });
        }

        const thiefProfile = db.getUser(userId);
        const targetProfile = db.getUser(target.id);
        const now = Date.now();
        const cooldown = 60 * 60 * 1000; // 1 hour

        const timeSince = now - (thiefProfile.lastRob || 0);
        if (timeSince < cooldown) {
            const rem = cooldown - timeSince;
            const mins = Math.floor(rem / (60 * 1000));
            return interaction.reply({
                content: `🚨 The city guards are still looking for you! Lay low for another **${mins}m**.`,
                ephemeral: true
            });
        }

        if (thiefProfile.balance < 100) {
            return interaction.reply({
                content: `❌ You need at least **100 coins** in your wallet to risk a robbery fine if caught!`,
                ephemeral: true
            });
        }

        if (targetProfile.balance < 50) {
            return interaction.reply({
                content: `❌ **${target.username}** has less than 50 coins in their wallet. They aren't worth the trouble!`,
                ephemeral: true
            });
        }

        thiefProfile.lastRob = now;

        // 45% chance of success
        const success = Math.random() < 0.45;

        if (success) {
            // Steal between 15% and 40% of target wallet
            const percent = 0.15 + (Math.random() * 0.25);
            const stolen = Math.floor(targetProfile.balance * percent);

            targetProfile.balance -= stolen;
            thiefProfile.balance += stolen;

            db.updateUser(target.id, targetProfile);
            db.updateUser(userId, thiefProfile);

            const embed = new EmbedBuilder()
                .setTitle('🗡️ Heist Successful!')
                .setColor('#06D6A0')
                .setDescription(`Under the cloak of shadows, you slipped your hands into **${target.username}**'s coin pouch!`)
                .addFields(
                    { name: 'Stolen Loot', value: `**+${stolen.toLocaleString()}** coins`, inline: true },
                    { name: 'Your Balance', value: `\`${thiefProfile.balance.toLocaleString()}\` coins`, inline: true }
                )
                .setFooter({ text: 'Watch your back, vengeance might be coming.' })
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
        } else {
            // Caught! Pay 100-300 coins fine to target
            const fine = Math.min(thiefProfile.balance, Math.floor(Math.random() * 150) + 100);
            thiefProfile.balance -= fine;
            targetProfile.balance += fine;

            db.updateUser(userId, thiefProfile);
            db.updateUser(target.id, targetProfile);

            const embed = new EmbedBuilder()
                .setTitle('🚨 BUSTED BY THE GUARDS!')
                .setColor('#E63946')
                .setDescription(`You fumbled your lockpick and tripped! **${target.username}** caught you red-handed.`)
                .addFields(
                    { name: 'Fine Paid to Target', value: `**-${fine}** coins`, inline: true },
                    { name: 'Your Balance', value: `\`${thiefProfile.balance.toLocaleString()}\` coins`, inline: true }
                )
                .setFooter({ text: 'Crime does not always pay in the kingdom of RAVANAS.' })
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
        }
    }
};
