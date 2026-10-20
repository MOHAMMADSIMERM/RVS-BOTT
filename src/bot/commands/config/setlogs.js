const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const db = require('../../services/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setlogs')
        .setDescription('Configure moderation and administrative audit logging channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addChannelOption(opt =>
            opt.setName('channel')
                .setDescription('The text channel for moderation logs')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        ),

    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');

        db.updateGuild(interaction.guild.id, { logChannel: channel.id });

        return interaction.reply({
            content: `🛡️ **Audit Logging Configured!** All moderation events will be documented in <#${channel.id}>.`
        });
    }
};
