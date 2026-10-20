const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../services/db');

const JOBS = [
    { title: 'Royal Blacksmith', desc: 'forged a demonic broadsword for RAVANAS guards', min: 120, max: 280 },
    { title: 'Tavern Bard', desc: 'sang epic ballads celebrating the kingdom of Lanka', min: 100, max: 250 },
    { title: 'Arcane Scribe', desc: 'translated ancient forbidden scrolls for the grand library', min: 150, max: 320 },
    { title: 'Dragon Keeper', desc: 'fed the fortress wyverns without getting incinerated', min: 180, max: 400 },
    { title: 'Bounty Hunter', desc: 'captured a notorious rogue in the dark alleyways', min: 200, max: 450 },
    { title: 'Alchemist Apprentice', desc: 'brewed glowing stamina potions that sold like wildfire', min: 130, max: 300 }
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('work')
        .setDescription('Undertake a task in the realm to earn honest coin'),

    async execute(interaction) {
        const userId = interaction.user.id;
        const profile = db.getUser(userId);
        const now = Date.now();
        const cooldown = 30 * 60 * 1000; // 30 minutes

        const timeSince = now - (profile.lastWork || 0);
        if (timeSince < cooldown) {
            const remaining = cooldown - timeSince;
            const minutes = Math.floor(remaining / (60 * 1000));
            const seconds = Math.floor((remaining % (60 * 1000)) / 1000);
            return interaction.reply({
                content: `💤 You are exhausted from your last shift! Rest for another **${minutes}m ${seconds}s**.`,
                ephemeral: true
            });
        }

        const job = JOBS[Math.floor(Math.random() * JOBS.length)];
        const earned = Math.floor(Math.random() * (job.max - job.min + 1)) + job.min;

        profile.balance += earned;
        profile.lastWork = now;
        db.updateUser(userId, profile);

        const embed = new EmbedBuilder()
            .setTitle(`🔨 Shift Complete: ${job.title}`)
            .setColor('#118AB2')
            .setDescription(`You ${job.desc} and received your hard-earned wages!`)
            .addFields(
                { name: '🪙 Payment', value: `**+${earned}** coins`, inline: true },
                { name: '💳 New Balance', value: `\`${profile.balance.toLocaleString()}\` coins`, inline: true }
            )
            .setFooter({ text: 'RAVANAS Realm of Commerce' })
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
};
