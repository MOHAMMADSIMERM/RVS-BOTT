const { EmbedBuilder } = require('discord.js');
const db = require('../services/db');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member, client) {
        const guildConfig = db.getGuild(member.guild.id);

        // Auto-Role
        if (guildConfig.autoRole) {
            const role = member.guild.roles.cache.get(guildConfig.autoRole);
            if (role) {
                member.roles.add(role).catch(err => {
                    console.error(`[AutoRole] Failed to assign role ${role.name}:`, err.message);
                });
            }
        }

        // Welcome Message
        if (guildConfig.welcomeEnabled && guildConfig.welcomeChannel) {
            const channel = member.guild.channels.cache.get(guildConfig.welcomeChannel);
            if (channel && channel.isTextBased()) {
                const text = (guildConfig.welcomeMessage || 'Welcome {user} to **{server}**!')
                    .replace(/{user}/g, `<@${member.id}>`)
                    .replace(/{server}/g, member.guild.name)
                    .replace(/{members}/g, member.guild.memberCount);

                const embed = new EmbedBuilder()
                    .setTitle(`👋 New Subject Arrived | Welcome!`)
                    .setDescription(text)
                    .setColor('#06D6A0')
                    .setThumbnail(member.user.displayAvatarURL())
                    .setFooter({ text: `Member #${member.guild.memberCount} • RAVANAS Realm` })
                    .setTimestamp();

                channel.send({ embeds: [embed] }).catch(() => null);
            }
        }
    }
};
