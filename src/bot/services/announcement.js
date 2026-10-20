const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('./db');

const COLOR_PRESETS = {
    crimson: '#E63946',
    gold: '#FFD166',
    royal: '#7209B7',
    emerald: '#06D6A0',
    cyber: '#118AB2',
    dark: '#1D3557'
};

/**
 * Send an announcement to a specified Discord channel
 * @param {import('discord.js').Client} client 
 * @param {Object} options
 * @param {string} options.guildId
 * @param {string} options.channelId
 * @param {string} options.title
 * @param {string} options.content
 * @param {string} [options.color]
 * @param {string} [options.imageUrl]
 * @param {string} [options.thumbnailUrl]
 * @param {string} [options.mention] - 'none', 'everyone', 'here', or a roleId
 * @param {string} [options.authorName]
 * @param {string} [options.authorIcon]
 * @param {string} [options.footerText]
 * @param {string} [options.moderatorId]
 * @returns {Promise<{success: boolean, messageId?: string, channelName?: string, error?: string}>}
 */
async function sendAnnouncement(client, options) {
    const {
        guildId,
        channelId,
        title,
        content,
        color = '#E63946',
        imageUrl,
        thumbnailUrl,
        mention = 'none',
        authorName = 'RAVANAS Sovereign Announcement',
        authorIcon,
        footerText,
        moderatorId = 'SYSTEM'
    } = options;

    if (!guildId || !channelId || !title || !content) {
        return { success: false, error: 'Missing required fields: guildId, channelId, title, or content.' };
    }

    try {
        const guild = await client.guilds.fetch(guildId).catch(() => null);
        if (!guild) {
            return { success: false, error: `Discord server with ID ${guildId} not found or bot lacks access.` };
        }

        const channel = await guild.channels.fetch(channelId).catch(() => null);
        if (!channel || !channel.isTextBased()) {
            return { success: false, error: `Channel with ID ${channelId} not found or is not a text channel.` };
        }

        // Validate bot permissions in channel
        const permissions = channel.permissionsFor(guild.members.me);
        if (!permissions.has(PermissionFlagsBits.SendMessages) || !permissions.has(PermissionFlagsBits.EmbedLinks)) {
            return { success: false, error: `Bot lacks SendMessages or EmbedLinks permission in #${channel.name}.` };
        }

        // Resolve Color
        let embedColor = COLOR_PRESETS[color.toLowerCase()] || color;
        if (!/^#[0-9A-Fa-f]{6}$/.test(embedColor)) {
            embedColor = '#E63946'; // fallback to RAVANAS crimson
        }

        // Build Embed
        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(content)
            .setColor(embedColor)
            .setTimestamp();

        if (authorName) {
            embed.setAuthor({
                name: authorName,
                iconURL: authorIcon || client.user?.displayAvatarURL()
            });
        }

        if (imageUrl && /^https?:\/\/.+/.test(imageUrl)) {
            embed.setImage(imageUrl);
        }

        if (thumbnailUrl && /^https?:\/\/.+/.test(thumbnailUrl)) {
            embed.setThumbnail(thumbnailUrl);
        }

        embed.setFooter({
            text: footerText || `Announced by ${client.user?.username || 'RAVANAS'} • Official Broadcast`,
            iconURL: client.user?.displayAvatarURL()
        });

        // Determine Mention String
        let mentionString = '';
        if (mention === 'everyone') {
            mentionString = '@everyone';
        } else if (mention === 'here') {
            mentionString = '@here';
        } else if (mention && mention !== 'none') {
            mentionString = `<@&${mention}>`;
        }

        const messagePayload = {
            embeds: [embed]
        };

        if (mentionString) {
            messagePayload.content = mentionString;
        }

        const sentMessage = await channel.send(messagePayload);

        // Record in Database
        db.logAnnouncement({
            guildId,
            guildName: guild.name,
            channelId,
            channelName: channel.name,
            messageId: sentMessage.id,
            title,
            content,
            color: embedColor,
            mention,
            moderatorId,
            authorName
        });

        return {
            success: true,
            messageId: sentMessage.id,
            channelName: channel.name,
            guildName: guild.name
        };
    } catch (err) {
        console.error('[Announcement] Error sending announcement:', err);
        return { success: false, error: err.message || 'Failed to send announcement to Discord.' };
    }
}

module.exports = {
    sendAnnouncement,
    COLOR_PRESETS
};
