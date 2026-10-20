const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { sendAnnouncement } = require('../../services/announcement');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('announce')
        .setDescription('Broadcast an official RAVANAS announcement with rich embed formatting')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild | PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The text channel to send the announcement to')
                .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('title')
                .setDescription('Title of the announcement')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Announcement message content (Markdown supported, use \\n for new lines)')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('mention')
                .setDescription('Who to notify with this announcement')
                .setRequired(false)
                .addChoices(
                    { name: 'None', value: 'none' },
                    { name: '@everyone', value: 'everyone' },
                    { name: '@here', value: 'here' }
                )
        )
        .addStringOption(option =>
            option.setName('color')
                .setDescription('Accent color for the embed')
                .setRequired(false)
                .addChoices(
                    { name: 'Crimson Red (RAVANAS Signature)', value: 'crimson' },
                    { name: 'Imperial Gold', value: 'gold' },
                    { name: 'Cyber Blue', value: 'cyber' },
                    { name: 'Emerald Green', value: 'emerald' },
                    { name: 'Royal Purple', value: 'royal' }
                )
        )
        .addStringOption(option =>
            option.setName('image_url')
                .setDescription('Large banner image URL (optional)')
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('thumbnail_url')
                .setDescription('Small thumbnail image URL (optional)')
                .setRequired(false)
        ),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const channel = interaction.options.getChannel('channel');
        const title = interaction.options.getString('title');
        const rawContent = interaction.options.getString('message');
        const content = rawContent.replace(/\\n/g, '\n');
        const mention = interaction.options.getString('mention') || 'none';
        const color = interaction.options.getString('color') || 'crimson';
        const imageUrl = interaction.options.getString('image_url');
        const thumbnailUrl = interaction.options.getString('thumbnail_url');

        const result = await sendAnnouncement(interaction.client, {
            guildId: interaction.guild.id,
            channelId: channel.id,
            title,
            content,
            color,
            imageUrl,
            thumbnailUrl,
            mention,
            authorName: `Announcement by ${interaction.user.tag}`,
            authorIcon: interaction.user.displayAvatarURL(),
            moderatorId: interaction.user.id
        });

        if (result.success) {
            return interaction.editReply({
                content: `✨ **Announcement successfully broadcasted** to <#${channel.id}>!\nMessage ID: \`${result.messageId}\``
            });
        } else {
            return interaction.editReply({
                content: `❌ **Failed to send announcement**: ${result.error}`
            });
        }
    }
};
