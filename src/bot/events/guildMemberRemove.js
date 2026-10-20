const { EmbedBuilder } = require('discord.js');
const db = require('../services/db');

module.exports = {
    name: 'guildMemberRemove',
    async execute(member, client) {
        const guildConfig = db.getGuild(member.guild.id);

        if (guildConfig.goodbyeEnabled && guildConfig.goodbyeChannel) {
            const channel = member.guild.channels.cache.get(guildConfig.goodbyeChannel);
            if (channel && channel.isTextBased()) {
                const text = (guildConfig.goodbyeMessage || '{user} has left **{server}**. Farewell!')
                    .replace(/{user}/g, `**${member.user.tag}**`)
                    .replace(/{server}/g, member.guild.name)
                    .replace(/{members}/g, member.guild.memberCount);

                const embed = new EmbedBuilder()
                    .setTitle(`🚪 Subject Departed`)
                    .setDescription(text)
                    .setColor('#E63946')
                    .setThumbnail(member.user.displayAvatarURL())
                    .setFooter({ text: `Remaining subjects: ${member.guild.memberCount}` })
                    .setTimestamp();

                channel.send({ embeds: [embed] }).catch(() => null);
            }
        }
    }
};
