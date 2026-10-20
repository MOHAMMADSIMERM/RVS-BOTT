const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const db = require('../../services/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setwelcome')
        .setDescription('Configure welcome greeting messages for new members')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addBooleanOption(opt =>
            opt.setName('enabled')
                .setDescription('Enable or disable welcome greetings')
                .setRequired(true)
        )
        .addChannelOption(opt =>
            opt.setName('channel')
                .setDescription('Channel where greetings will be sent')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(false)
        )
        .addStringOption(opt =>
            opt.setName('message')
                .setDescription('Custom message (Variables: {user}, {server}, {members})')
                .setRequired(false)
        ),

    async execute(interaction) {
        const enabled = interaction.options.getBoolean('enabled');
        const channel = interaction.options.getChannel('channel');
        const customMessage = interaction.options.getString('message');

        const updates = { welcomeEnabled: enabled };
        if (channel) updates.welcomeChannel = channel.id;
        if (customMessage) updates.welcomeMessage = customMessage;

        db.updateGuild(interaction.guild.id, updates);

        return interaction.reply({
            content: `✅ **Welcome Greeting System Updated!**\n• Status: **${enabled ? '🟢 Enabled' : '🔴 Disabled'}**\n• Channel: ${channel ? `<#${channel.id}>` : '(unchanged)'}\n• Message Template: \`${customMessage || '(unchanged)'}\``
        });
    }
};
