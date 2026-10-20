const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../../data/db.json');

class Database {
    constructor() {
        this.data = {
            guilds: {},
            users: {},
            modlogs: [],
            announcements: [],
            settings: {
                botName: 'RAVANAS',
                adminSecret: 'ravanas-secret-key',
                defaultPrefix: '!'
            }
        };
        this.saveTimeout = null;
        this.init();
    }

    init() {
        try {
            const dir = path.dirname(DB_PATH);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            if (fs.existsSync(DB_PATH)) {
                const raw = fs.readFileSync(DB_PATH, 'utf-8');
                this.data = { ...this.data, ...JSON.parse(raw) };
            } else {
                this.saveSync();
            }
        } catch (err) {
            console.error('[DB] Failed to load db.json, using defaults:', err.message);
        }
    }

    saveSync() {
        try {
            fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
        } catch (err) {
            console.error('[DB] Error saving synchronously:', err.message);
        }
    }

    save() {
        if (this.saveTimeout) clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => {
            fs.writeFile(DB_PATH, JSON.stringify(this.data, null, 2), 'utf-8', (err) => {
                if (err) console.error('[DB] Error saving asynchronously:', err.message);
            });
        }, 500);
    }

    // Guild Configuration
    getGuild(guildId) {
        if (!this.data.guilds[guildId]) {
            this.data.guilds[guildId] = {
                prefix: '!',
                welcomeChannel: '',
                welcomeMessage: 'Welcome {user} to **{server}**! Enjoy your stay.',
                welcomeEnabled: false,
                goodbyeChannel: '',
                goodbyeMessage: '{user} has left **{server}**. Farewell!',
                goodbyeEnabled: false,
                logChannel: '',
                autoRole: '',
                levelingEnabled: true,
                announcementChannel: '',
                mutedRole: ''
            };
            this.save();
        }
        return this.data.guilds[guildId];
    }

    updateGuild(guildId, updates) {
        const guild = this.getGuild(guildId);
        this.data.guilds[guildId] = { ...guild, ...updates };
        this.save();
        return this.data.guilds[guildId];
    }

    // User Data (Leveling, Economy, Profile)
    getUser(userId) {
        if (!this.data.users[userId]) {
            this.data.users[userId] = {
                xp: 0,
                level: 1,
                lastXpTime: 0,
                balance: 250,
                bank: 0,
                dailyStreak: 0,
                lastDaily: 0,
                lastWork: 0,
                lastRob: 0,
                warnings: [],
                bio: 'A follower of RAVANAS.'
            };
            this.save();
        }
        return this.data.users[userId];
    }

    updateUser(userId, updates) {
        const user = this.getUser(userId);
        this.data.users[userId] = { ...user, ...updates };
        this.save();
        return this.data.users[userId];
    }

    // Leveling Logic (similar to Koya/Mee6)
    // Formula: XP required for level N = 100 * N * 1.5
    getXpForLevel(level) {
        return Math.floor(100 * level * 1.5);
    }

    addXp(userId, amount) {
        const user = this.getUser(userId);
        const now = Date.now();

        // 60-second cooldown on XP gain
        if (now - (user.lastXpTime || 0) < 60000) {
            return { leveledUp: false, user };
        }

        user.xp += amount;
        user.lastXpTime = now;

        let required = this.getXpForLevel(user.level);
        let leveledUp = false;

        while (user.xp >= required) {
            user.xp -= required;
            user.level += 1;
            leveledUp = true;
            required = this.getXpForLevel(user.level);
        }

        this.save();
        return { leveledUp, newLevel: user.level, currentXp: user.xp, requiredXp: required, user };
    }

    // Warnings
    addWarning(guildId, userId, moderatorId, reason) {
        const user = this.getUser(userId);
        const warning = {
            id: 'WRN-' + Date.now().toString(36).toUpperCase(),
            guildId,
            moderatorId,
            reason: reason || 'No reason provided',
            timestamp: new Date().toISOString()
        };
        user.warnings = user.warnings || [];
        user.warnings.push(warning);
        this.save();

        this.logModAction({
            guildId,
            targetId: userId,
            moderatorId,
            action: 'WARN',
            reason: reason || 'No reason provided',
            extra: { warningId: warning.id }
        });

        return warning;
    }

    getWarnings(guildId, userId) {
        const user = this.getUser(userId);
        if (!user.warnings) return [];
        return user.warnings.filter(w => w.guildId === guildId);
    }

    clearWarnings(guildId, userId) {
        const user = this.getUser(userId);
        if (!user.warnings) return 0;
        const countBefore = user.warnings.length;
        user.warnings = user.warnings.filter(w => w.guildId !== guildId);
        this.save();
        return countBefore - user.warnings.length;
    }

    // Mod Logs
    logModAction(actionData) {
        const entry = {
            id: 'LOG-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 5),
            timestamp: new Date().toISOString(),
            ...actionData
        };
        this.data.modlogs.unshift(entry);
        // keep max 500 entries
        if (this.data.modlogs.length > 500) {
            this.data.modlogs = this.data.modlogs.slice(0, 500);
        }
        this.save();
        return entry;
    }

    getModLogs(guildId, limit = 50) {
        const logs = guildId
            ? this.data.modlogs.filter(l => l.guildId === guildId)
            : this.data.modlogs;
        return logs.slice(0, limit);
    }

    // Announcements
    logAnnouncement(announcementData) {
        const entry = {
            id: 'ANC-' + Date.now().toString(36).toUpperCase(),
            timestamp: new Date().toISOString(),
            ...announcementData
        };
        this.data.announcements.unshift(entry);
        if (this.data.announcements.length > 200) {
            this.data.announcements = this.data.announcements.slice(0, 200);
        }
        this.save();
        return entry;
    }

    getAnnouncements(guildId, limit = 20) {
        const list = guildId
            ? this.data.announcements.filter(a => a.guildId === guildId)
            : this.data.announcements;
        return list.slice(0, limit);
    }

    // Global / Guild Leaderboard
    getLeaderboard(type = 'xp', limit = 10) {
        const userIds = Object.keys(this.data.users);
        const list = userIds.map(id => ({
            userId: id,
            ...this.data.users[id],
            totalWealth: (this.data.users[id].balance || 0) + (this.data.users[id].bank || 0)
        }));

        if (type === 'xp') {
            list.sort((a, b) => (b.level * 100000 + b.xp) - (a.level * 100000 + a.xp));
        } else if (type === 'economy') {
            list.sort((a, b) => b.totalWealth - a.totalWealth);
        }

        return list.slice(0, limit);
    }
}

module.exports = new Database();
