const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const db = require('../../services/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setgoodbye')
        .setDescription('Configure departure farewell messages when members leave')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addBooleanOption(opt =>
            opt.setName('enabled')
                .setDescription('Enable or disable farewell notifications')
                .setRequired(true)
        )
        .addChannelOption(opt =>
            opt.setName('channel')
                .setDescription('Channel where farewells will be posted')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(false)
        )
        .addStringOption(opt =>
            opt.setName('message')
                .setDescription('Custom message (Variables: {user}, {server})')
                .setRequired(false)
        ),

    async execute(interaction) {
        const enabled = interaction.options.getBoolean('enabled');
        const channel = interaction.options.getChannel('channel');
        const customMessage = interaction.options.getString('message');

        const updates = { goodbyeEnabled: enabled };
        if (channel) updates.goodbyeChannel = channel.id;
        if (customMessage) updates.goodbyeMessage = customMessage;

        db.updateGuild(interaction.guild.id, updates);

        return interaction.reply({
            content: `✅ **Farewell Notification System Updated!**\n• Status: **${enabled ? '🟢 Enabled' : '🔴 Disabled'}**\n• Channel: ${channel ? `<#${channel.id}>` : '(unchanged)'}\n• Message: \`${customMessage || '(unchanged)'}\``
        });
    }
};
