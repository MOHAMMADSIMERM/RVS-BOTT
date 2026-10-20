const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const db = require('../../bot/services/db');
const { sendAnnouncement } = require('../../bot/services/announcement');
const { deploySlashCommands, commands } = require('../../bot/deploy-commands');

module.exports = function (client) {
    // 1. Status & Metrics
    router.get('/status', (req, res) => {
        const isReady = client && client.isReady();
        const uptimeSeconds = process.uptime();
        const days = Math.floor(uptimeSeconds / 86400);
        const hours = Math.floor((uptimeSeconds % 86400) / 3600);
        const minutes = Math.floor((uptimeSeconds % 3600) / 60);

        res.json({
            status: isReady ? 'online' : 'waiting_for_token',
            botTag: isReady ? client.user.tag : 'RAVANAS (Offline)',
            botAvatar: isReady ? client.user.displayAvatarURL() : 'https://cdn.discordapp.com/embed/avatars/0.png',
            ping: isReady ? client.ws.ping : 0,
            uptime: `${days}d ${hours}h ${minutes}m`,
            guildCount: isReady ? client.guilds.cache.size : 0,
            userCount: isReady ? client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0) : 0,
            memoryMb: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1),
            clientId: process.env.CLIENT_ID || '',
            hasToken: !!process.env.DISCORD_TOKEN && process.env.DISCORD_TOKEN !== 'YOUR_DISCORD_BOT_TOKEN_HERE'
        });
    });

    // 2. Connected Guilds & Channels
    router.get('/guilds', (req, res) => {
        if (!client || !client.isReady()) {
            return res.json([]);
        }

        const guilds = client.guilds.cache.map(g => ({
            id: g.id,
            name: g.name,
            icon: g.iconURL({ dynamic: true }) || 'https://cdn.discordapp.com/embed/avatars/0.png',
            memberCount: g.memberCount,
            ownerId: g.ownerId,
            channels: g.channels.cache
                .filter(c => c.isTextBased())
                .map(c => ({ id: c.id, name: c.name, type: c.type })),
            roles: g.roles.cache
                .filter(r => r.name !== '@everyone')
                .map(r => ({ id: r.id, name: r.name, color: r.hexColor }))
        }));

        res.json(guilds);
    });

    // 3. Guild Configuration
    router.get('/guilds/:guildId/config', (req, res) => {
        const config = db.getGuild(req.params.guildId);
        res.json(config);
    });

    router.post('/guilds/:guildId/config', (req, res) => {
        const updated = db.updateGuild(req.params.guildId, req.body);
        res.json({ success: true, config: updated });
    });

    // 4. Send Announcement (Web Announcement Studio)
    router.post('/announce', async (req, res) => {
        if (!client || !client.isReady()) {
            return res.status(400).json({ success: false, error: 'RAVANAS bot is currently offline. Connect Discord bot token first.' });
        }

        const {
            guildId,
            channelId,
            title,
            content,
            color,
            imageUrl,
            thumbnailUrl,
            mention,
            authorName,
            footerText
        } = req.body;

        const result = await sendAnnouncement(client, {
            guildId,
            channelId,
            title,
            content,
            color,
            imageUrl,
            thumbnailUrl,
            mention,
            authorName: authorName || 'RAVANAS Web Broadcast',
            footerText,
            moderatorId: 'WEB_DASHBOARD'
        });

        if (result.success) {
            return res.json(result);
        } else {
            return res.status(400).json(result);
        }
    });

    // 5. Moderation Action from Web (Ban, Kick, Timeout, Warn, Unban)
    router.post('/mod/action', async (req, res) => {
        if (!client || !client.isReady()) {
            return res.status(400).json({ success: false, error: 'Bot is offline.' });
        }

        const { guildId, action, targetId, reason = 'Executed via RAVANAS Web Console', extra = {} } = req.body;

        try {
            const guild = await client.guilds.fetch(guildId).catch(() => null);
            if (!guild) return res.status(404).json({ success: false, error: 'Server not found.' });

            if (action === 'BAN') {
                await guild.members.ban(targetId, {
                    deleteMessageSeconds: (extra.deleteDays || 0) * 86400,
                    reason: `${reason} | Web Dashboard Action`
                });
                db.logModAction({ guildId, targetId, moderatorId: 'WEB_ADMIN', action: 'BAN', reason });
                return res.json({ success: true, message: `Successfully banned user ${targetId}.` });
            }

            if (action === 'KICK') {
                const member = await guild.members.fetch(targetId).catch(() => null);
                if (!member) return res.status(404).json({ success: false, error: 'Member not found in guild.' });
                await member.kick(`${reason} | Web Dashboard Action`);
                db.logModAction({ guildId, targetId, moderatorId: 'WEB_ADMIN', action: 'KICK', reason });
                return res.json({ success: true, message: `Successfully kicked member ${member.user.tag}.` });
            }

            if (action === 'TIMEOUT') {
                const member = await guild.members.fetch(targetId).catch(() => null);
                if (!member) return res.status(404).json({ success: false, error: 'Member not found in guild.' });
                const minutes = parseInt(extra.minutes || 10, 10);
                await member.timeout(minutes * 60 * 1000, `${reason} | Web Dashboard Action`);
                db.logModAction({ guildId, targetId, moderatorId: 'WEB_ADMIN', action: 'TIMEOUT', reason, extra: { minutes } });
                return res.json({ success: true, message: `Timed out ${member.user.tag} for ${minutes} minute(s).` });
            }

            if (action === 'WARN') {
                const warning = db.addWarning(guildId, targetId, 'WEB_ADMIN', reason);
                return res.json({ success: true, message: `Warning registered. Warning ID: ${warning.id}`, warning });
            }

            if (action === 'UNBAN') {
                await guild.bans.remove(targetId, `${reason} | Web Dashboard Action`);
                db.logModAction({ guildId, targetId, moderatorId: 'WEB_ADMIN', action: 'UNBAN', reason });
                return res.json({ success: true, message: `Unbanned user ${targetId}.` });
            }

            return res.status(400).json({ success: false, error: 'Unknown moderation action.' });
        } catch (err) {
            console.error('[Web Mod] Error:', err);
            return res.status(500).json({ success: false, error: err.message });
        }
    });

    // 6. Mod Logs & History
    router.get('/mod/logs', (req, res) => {
        const guildId = req.query.guildId;
        const logs = db.getModLogs(guildId, 100);
        res.json(logs);
    });

    // 7. Announcement History
    router.get('/announcements', (req, res) => {
        const guildId = req.query.guildId;
        const list = db.getAnnouncements(guildId, 50);
        res.json(list);
    });

    // 8. Leaderboards
    router.get('/leaderboard', (req, res) => {
        const type = req.query.type || 'xp';
        const list = db.getLeaderboard(type, 25);
        res.json(list);
    });

    // 9. Command List Catalog
    router.get('/commands', (req, res) => {
        res.json(commands);
    });

    // 10. Deploy Slash Commands Button
    router.post('/deploy-commands', async (req, res) => {
        const { guildId } = req.body;
        const result = await deploySlashCommands(process.env.DISCORD_TOKEN, process.env.CLIENT_ID, guildId || null);
        if (result.success) {
            return res.json({ success: true, message: `Deployed ${result.count} commands successfully!` });
        } else {
            return res.status(500).json({ success: false, error: result.error });
        }
    });

    // 11. Save Credentials
    router.post('/settings/credentials', async (req, res) => {
        const { token, clientId } = req.body;
        if (!token && !clientId) {
            return res.status(400).json({ success: false, error: 'No values provided.' });
        }

        try {
            const envPath = path.join(__dirname, '../../../.env');
            let content = '';
            if (fs.existsSync(envPath)) {
                content = fs.readFileSync(envPath, 'utf-8');
            }

            if (token) {
                if (content.includes('DISCORD_TOKEN=')) {
                    content = content.replace(/DISCORD_TOKEN=.*(\r?\n|$)/, `DISCORD_TOKEN=${token}\n`);
                } else {
                    content += `\nDISCORD_TOKEN=${token}\n`;
                }
                process.env.DISCORD_TOKEN = token;
            }

            if (clientId) {
                if (content.includes('CLIENT_ID=')) {
                    content = content.replace(/CLIENT_ID=.*(\r?\n|$)/, `CLIENT_ID=${clientId}\n`);
                } else {
                    content += `\nCLIENT_ID=${clientId}\n`;
                }
                process.env.CLIENT_ID = clientId;
            }

            fs.writeFileSync(envPath, content, 'utf-8');

            // Try to login if bot is not logged in
            if (token && client && !client.isReady()) {
                client.login(token).catch(err => {
                    console.error('[Web] Login attempt error:', err.message);
                });
            }

            res.json({ success: true, message: 'Bot credentials updated successfully!' });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    });

    return router;
};
