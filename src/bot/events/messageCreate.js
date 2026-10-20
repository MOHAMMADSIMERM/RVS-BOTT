const { EmbedBuilder } = require('discord.js');
const db = require('../services/db');

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        if (!message.guild || message.author.bot) return;

        const guildConfig = db.getGuild(message.guild.id);
        if (!guildConfig.levelingEnabled) return;

        // Random XP between 15 and 25 per message (with 60-second cooldown handled in db)
        const xpAmount = Math.floor(Math.random() * 11) + 15;
        const result = db.addXp(message.author.id, xpAmount);

        if (result.leveledUp) {
            const levelEmbed = new EmbedBuilder()
                .setTitle('🎉 Level Up Achievement!')
                .setColor('#FFD166')
                .setDescription(`Congratulations <@${message.author.id}>! You have ascended to **Level ${result.newLevel}** in **${message.guild.name}**!`)
                .setThumbnail(message.author.displayAvatarURL())
                .setFooter({ text: 'RAVANAS Progression System' })
                .setTimestamp();

            message.channel.send({ embeds: [levelEmbed] }).catch(() => null);
        }
    }
};
