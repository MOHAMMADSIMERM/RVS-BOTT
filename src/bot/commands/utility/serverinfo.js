const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('View comprehensive information and statistics about this server'),

    async execute(interaction) {
        const guild = interaction.guild;
        const owner = await guild.fetchOwner();
        const textChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size;
        const voiceChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size;
        const rolesCount = guild.roles.cache.size;

        const embed = new EmbedBuilder()
            .setTitle(`🏰 Server Dossier: ${guild.name}`)
            .setColor('#118AB2')
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .addFields(
                { name: '👑 Server Sovereign (Owner)', value: `${owner.user.tag} (\`${owner.id}\`)`, inline: true },
                { name: '🆔 Server ID', value: `\`${guild.id}\``, inline: true },
                { name: '📅 Created On', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
                { name: '👥 Total Members', value: `\`${guild.memberCount}\``, inline: true },
                { name: '💬 Text Channels', value: `\`${textChannels}\``, inline: true },
                { name: '🔊 Voice Channels', value: `\`${voiceChannels}\``, inline: true },
                { name: '🛡️ Roles Count', value: `\`${rolesCount}\``, inline: true },
                { name: '🚀 Boost Tier', value: `Tier ${guild.premiumTier} (${guild.premiumSubscriptionCount || 0} boosts)`, inline: true }
            )
            .setFooter({ text: 'RAVANAS Server Analytics', iconURL: interaction.client.user?.displayAvatarURL() })
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
};
