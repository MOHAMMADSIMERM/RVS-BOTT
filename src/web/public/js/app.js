// RAVANAS Web Console Client Logic
let currentGuilds = [];
let currentLeaderboardType = 'xp';

// DOM Elements
const navItems = document.querySelectorAll('.nav-item');
const tabContents = document.querySelectorAll('.tab-content');
const toastContainer = document.getElementById('toast-container');

// Tab Navigation
navItems.forEach(item => {
    item.addEventListener('click', () => {
        const targetTab = item.getAttribute('data-tab');
        switchTab(targetTab);
    });
});

function switchTab(tabId) {
    navItems.forEach(i => i.classList.toggle('active', i.getAttribute('data-tab') === tabId));
    tabContents.forEach(c => c.classList.toggle('active', c.id === `tab-${tabId}`));

    // Update Header Text
    const titles = {
        overview: { t: 'Overview & Diagnostics', d: 'Real-time status, health metrics, and gateway connectivity.' },
        announcements: { t: 'Announcement Studio', d: 'Compose rich, multi-channel Discord broadcasts with live visual preview.' },
        moderation: { t: 'Executive Moderation', d: 'Issue discipline, kick, ban, timeout, and audit disciplinary logs.' },
        settings: { t: 'Server Automation & Settings', d: 'Configure welcome cards, auto-roles, logs, and leveling.' },
        commands: { t: 'Commands Codex', d: 'Complete catalog of slash commands available in RAVANAS.' },
        leaderboard: { t: 'Hall of Fame', d: 'Global and server-wide rankings for XP progression and wealth.' },
        setup: { t: 'Credentials & Command Sync', d: 'Configure your Discord bot token and deploy slash commands.' }
    };
    if (titles[tabId]) {
        document.getElementById('header-title').innerText = titles[tabId].t;
        document.getElementById('header-desc').innerText = titles[tabId].d;
    }
}

// Toast Notifications
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${type === 'success' ? '✅' : '❌'}</span> <span>${message}</span>`;
    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 4500);
}

// 1. Fetch Status
async function loadStatus() {
    try {
        const res = await fetch('/api/status');
        const data = await res.json();

        const isOnline = data.status === 'online';
        document.getElementById('stat-status').innerText = isOnline ? 'ONLINE' : 'OFFLINE';
        document.getElementById('stat-status').style.color = isOnline ? 'var(--accent-green)' : 'var(--primary)';
        document.getElementById('stat-status-sub').innerText = isOnline ? 'Connected to Discord Gateway' : 'Awaiting Token or Connection';

        document.getElementById('stat-ping').innerText = `${data.ping} ms`;
        document.getElementById('stat-guilds').innerText = data.guildCount;
        document.getElementById('stat-users').innerText = Number(data.userCount).toLocaleString();
        document.getElementById('stat-uptime').innerText = data.uptime;
        document.getElementById('stat-memory').innerText = `${data.memoryMb} MB`;

        // Sidebar status
        document.getElementById('sidebar-bot-name').innerText = data.botTag;
        document.getElementById('sidebar-avatar').src = data.botAvatar;
        document.getElementById('sidebar-status-dot').className = `status-dot ${isOnline ? 'online' : ''}`;
        document.getElementById('sidebar-status-text').innerText = isOnline ? 'Online' : 'Offline';

        // Preview avatar
        document.getElementById('preview-bot-avatar').src = data.botAvatar;
        document.getElementById('preview-bot-name').innerText = data.botTag.split('#')[0];

        // Invite URL
        if (data.clientId) {
            const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${data.clientId}&scope=bot%20applications.commands&permissions=8`;
            document.getElementById('btn-invite').href = inviteUrl;
            document.getElementById('input-client-id').value = data.clientId;
        }
    } catch (err) {
        console.error('Failed to load status:', err);
    }
}

// 2. Fetch Guilds & Populate Selectors
async function loadGuilds() {
    try {
        const res = await fetch('/api/guilds');
        currentGuilds = await res.json();

        // Populate Announcement Guild Selector
        const ancGuildSelect = document.getElementById('anc-guild');
        const modGuildSelect = document.getElementById('mod-guild');
        const cfgGuildSelect = document.getElementById('config-guild-select');

        [ancGuildSelect, modGuildSelect, cfgGuildSelect].forEach(select => {
            select.innerHTML = '<option value="">Select a server...</option>';
        });

        const overviewGuildsList = document.getElementById('overview-guilds-list');
        overviewGuildsList.innerHTML = '';

        if (currentGuilds.length === 0) {
            overviewGuildsList.innerHTML = `
                <div style="color: var(--text-muted); font-size: 14px;">
                    RAVANAS is not currently in any Discord servers. Click <b>"Add RAVANAS to Server"</b> at the top right to invite it with Administrator permissions!
                </div>
            `;
            return;
        }

        currentGuilds.forEach(g => {
            // Options
            const opt = document.createElement('option');
            opt.value = g.id;
            opt.innerText = `${g.name} (${g.memberCount} members)`;
            ancGuildSelect.appendChild(opt.cloneNode(true));
            modGuildSelect.appendChild(opt.cloneNode(true));
            cfgGuildSelect.appendChild(opt.cloneNode(true));

            // Overview card
            const card = document.createElement('div');
            card.style.cssText = 'background: #0d1017; border: 1px solid var(--border-color); border-radius: 10px; padding: 14px; display: flex; align-items: center; gap: 12px; min-width: 240px;';
            card.innerHTML = `
                <img src="${g.icon}" style="width: 44px; height: 44px; border-radius: 50%;" alt="${g.name}">
                <div>
                    <div style="font-weight: 700; font-size: 14px;">${g.name}</div>
                    <div style="font-size: 12px; color: var(--text-secondary);">${g.memberCount} members • ${g.channels.length} channels</div>
                </div>
            `;
            overviewGuildsList.appendChild(card);
        });
    } catch (err) {
        console.error('Failed to load guilds:', err);
    }
}

// Dynamic Channel Population for Announcement
document.getElementById('anc-guild').addEventListener('change', (e) => {
    const guildId = e.target.value;
    const channelSelect = document.getElementById('anc-channel');
    channelSelect.innerHTML = '<option value="">Select a channel...</option>';

    const guild = currentGuilds.find(g => g.id === guildId);
    if (!guild) return;

    guild.channels.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.innerText = `# ${c.name}`;
        channelSelect.appendChild(opt);
    });
});

// Dynamic Preview Updates
const ancTitle = document.getElementById('anc-title');
const ancContent = document.getElementById('anc-content');
const ancAuthor = document.getElementById('anc-author');
const ancColor = document.getElementById('anc-color');
const ancImage = document.getElementById('anc-image');
const ancMention = document.getElementById('anc-mention');

function updateLivePreview() {
    document.getElementById('preview-title').innerText = ancTitle.value || 'Announcement Title';
    document.getElementById('preview-desc').innerText = ancContent.value || 'Content...';
    document.getElementById('preview-author-text').innerText = ancAuthor.value || 'RAVANAS Broadcast';

    const color = ancColor.value || '#e63946';
    document.getElementById('preview-embed').style.borderLeftColor = color;

    // Mention
    const mentionContainer = document.getElementById('preview-mention-container');
    if (ancMention.value === 'everyone') {
        mentionContainer.innerHTML = '<span class="discord-mention-tag">@everyone</span>';
    } else if (ancMention.value === 'here') {
        mentionContainer.innerHTML = '<span class="discord-mention-tag">@here</span>';
    } else {
        mentionContainer.innerHTML = '';
    }

    // Image
    const previewImg = document.getElementById('preview-image');
    if (ancImage.value && ancImage.value.startsWith('http')) {
        previewImg.src = ancImage.value;
        previewImg.style.display = 'block';
    } else {
        previewImg.style.display = 'none';
    }
}

[ancTitle, ancContent, ancAuthor, ancColor, ancImage, ancMention].forEach(el => {
    el.addEventListener('input', updateLivePreview);
    el.addEventListener('change', updateLivePreview);
});

// Color Preset clicks
document.querySelectorAll('.color-dot').forEach(dot => {
    dot.addEventListener('click', () => {
        document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        ancColor.value = dot.getAttribute('data-color');
        updateLivePreview();
    });
});

// Announcement Form Submit
document.getElementById('announcement-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-send-announcement');
    btn.disabled = true;
    btn.innerText = 'Broadcasting...';

    const payload = {
        guildId: document.getElementById('anc-guild').value,
        channelId: document.getElementById('anc-channel').value,
        title: ancTitle.value,
        content: ancContent.value,
        authorName: ancAuthor.value,
        color: ancColor.value,
        imageUrl: ancImage.value,
        thumbnailUrl: document.getElementById('anc-thumbnail').value,
        mention: ancMention.value
    };

    try {
        const res = await fetch('/api/announce', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (data.success) {
            showToast(`Announcement successfully sent to #${data.channelName}!`);
            loadAnnouncements();
        } else {
            showToast(data.error || 'Failed to send announcement.', 'error');
        }
    } catch (err) {
        showToast('Error sending broadcast: ' + err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<span>🚀 Broadcast Announcement to Discord</span>';
    }
});

// Load Announcement History
async function loadAnnouncements() {
    try {
        const res = await fetch('/api/announcements');
        const list = await res.json();
        const container = document.getElementById('recent-announcements-list');

        if (list.length === 0) {
            container.innerHTML = '<p style="color: var(--text-muted); font-size: 13px;">No announcements logged yet.</p>';
            return;
        }

        container.innerHTML = list.slice(0, 5).map(a => `
            <div style="border-bottom: 1px solid var(--border-color); padding: 10px 0; font-size: 13px;">
                <div style="font-weight: 700; color: #fff;">${a.title}</div>
                <div style="color: var(--text-secondary); margin-top: 2px;">
                    Sent to <span style="color: var(--accent-blue);">#${a.channelName || 'channel'}</span> in <b>${a.guildName || 'server'}</b> • <small>${new Date(a.timestamp).toLocaleTimeString()}</small>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error('Failed to load announcements:', err);
    }
}

// Moderation Action Logic
const modActionSelect = document.getElementById('mod-action');
modActionSelect.addEventListener('change', () => {
    const isTimeout = modActionSelect.value === 'TIMEOUT';
    document.getElementById('mod-duration-group').style.display = isTimeout ? 'block' : 'none';
});

document.getElementById('mod-action-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
        guildId: document.getElementById('mod-guild').value,
        targetId: document.getElementById('mod-target').value.trim(),
        action: modActionSelect.value,
        reason: document.getElementById('mod-reason').value,
        extra: {
            minutes: document.getElementById('mod-duration').value
        }
    };

    try {
        const res = await fetch('/api/mod/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (data.success) {
            showToast(data.message);
            loadModLogs();
        } else {
            showToast(data.error || 'Action failed.', 'error');
        }
    } catch (err) {
        showToast('Error executing moderation: ' + err.message, 'error');
    }
});

// Load Mod Logs
async function loadModLogs() {
    try {
        const res = await fetch('/api/mod/logs');
        const logs = await res.json();
        const tbody = document.getElementById('mod-logs-tbody');

        if (logs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No recorded moderation actions yet.</td></tr>';
            return;
        }

        const actionBadges = {
            BAN: 'badge-crimson',
            KICK: 'badge-crimson',
            TIMEOUT: 'badge-blue',
            WARN: 'badge-gold',
            UNBAN: 'badge-green',
            PURGE: 'badge-blue'
        };

        tbody.innerHTML = logs.map(l => `
            <tr>
                <td>${new Date(l.timestamp).toLocaleString()}</td>
                <td><span class="badge ${actionBadges[l.action] || 'badge-blue'}">${l.action}</span></td>
                <td><code>${l.targetId}</code></td>
                <td>${l.moderatorId}</td>
                <td>${l.reason || 'N/A'}</td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Failed to load mod logs:', err);
    }
}

// Server Config Tab
const cfgGuildSelect = document.getElementById('config-guild-select');
cfgGuildSelect.addEventListener('change', async () => {
    const guildId = cfgGuildSelect.value;
    const form = document.getElementById('config-form');

    if (!guildId) {
        form.style.display = 'none';
        return;
    }

    form.style.display = 'block';
    const guild = currentGuilds.find(g => g.id === guildId);

    // Populate channel and role selects
    const welcomeChan = document.getElementById('cfg-welcome-channel');
    const goodbyeChan = document.getElementById('cfg-goodbye-channel');
    const logChan = document.getElementById('cfg-log-channel');
    const autoRoleSelect = document.getElementById('cfg-autorole');

    [welcomeChan, goodbyeChan, logChan].forEach(s => {
        s.innerHTML = '<option value="">None / Disabled</option>';
        if (guild) {
            guild.channels.forEach(c => {
                s.innerHTML += `<option value="${c.id}"># ${c.name}</option>`;
            });
        }
    });

    autoRoleSelect.innerHTML = '<option value="">None / Disabled</option>';
    if (guild) {
        guild.roles.forEach(r => {
            autoRoleSelect.innerHTML += `<option value="${r.id}">@${r.name}</option>`;
        });
    }

    // Load config
    try {
        const res = await fetch(`/api/guilds/${guildId}/config`);
        const cfg = await res.json();

        document.getElementById('cfg-welcome-enabled').checked = !!cfg.welcomeEnabled;
        welcomeChan.value = cfg.welcomeChannel || '';
        document.getElementById('cfg-welcome-msg').value = cfg.welcomeMessage || '';

        document.getElementById('cfg-goodbye-enabled').checked = !!cfg.goodbyeEnabled;
        goodbyeChan.value = cfg.goodbyeChannel || '';
        document.getElementById('cfg-goodbye-msg').value = cfg.goodbyeMessage || '';

        logChan.value = cfg.logChannel || '';
        autoRoleSelect.value = cfg.autoRole || '';
        document.getElementById('cfg-leveling-enabled').checked = cfg.levelingEnabled !== false;
    } catch (err) {
        console.error('Failed to load guild config:', err);
    }
});

document.getElementById('config-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const guildId = cfgGuildSelect.value;
    if (!guildId) return;

    const updates = {
        welcomeEnabled: document.getElementById('cfg-welcome-enabled').checked,
        welcomeChannel: document.getElementById('cfg-welcome-channel').value,
        welcomeMessage: document.getElementById('cfg-welcome-msg').value,
        goodbyeEnabled: document.getElementById('cfg-goodbye-enabled').checked,
        goodbyeChannel: document.getElementById('cfg-goodbye-channel').value,
        goodbyeMessage: document.getElementById('cfg-goodbye-msg').value,
        logChannel: document.getElementById('cfg-log-channel').value,
        autoRole: document.getElementById('cfg-autorole').value,
        levelingEnabled: document.getElementById('cfg-leveling-enabled').checked
    };

    try {
        const res = await fetch(`/api/guilds/${guildId}/config`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        const data = await res.json();
        if (data.success) {
            showToast('Server configuration saved!');
        }
    } catch (err) {
        showToast('Error saving settings: ' + err.message, 'error');
    }
});

// Load Commands Codex
async function loadCommands() {
    try {
        const res = await fetch('/api/commands');
        const commands = await res.json();
        const container = document.getElementById('commands-list-container');

        if (commands.length === 0) {
            container.innerHTML = '<p style="color: var(--text-muted);">No commands loaded.</p>';
            return;
        }

        container.innerHTML = commands.map(cmd => {
            const options = (cmd.options || []).map(o => `<code>${o.name}${o.required ? '*' : ''}</code>`).join(' ');
            return `
                <div style="background: #0d1017; border: 1px solid var(--border-color); border-radius: 10px; padding: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <span style="font-size: 15px; font-weight: 800; color: var(--gold); font-family: monospace;">/${cmd.name}</span>
                        <span class="badge badge-crimson">COMMAND</span>
                    </div>
                    <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 10px;">${cmd.description}</div>
                    ${options ? `<div style="font-size: 12px; color: var(--text-muted);">Parameters: ${options}</div>` : ''}
                </div>
            `;
        }).join('');
    } catch (err) {
        console.error('Failed to load commands:', err);
    }
}

// Leaderboards
document.getElementById('btn-lb-xp').addEventListener('click', () => {
    currentLeaderboardType = 'xp';
    loadLeaderboard();
});

document.getElementById('btn-lb-eco').addEventListener('click', () => {
    currentLeaderboardType = 'economy';
    loadLeaderboard();
});

async function loadLeaderboard() {
    try {
        const res = await fetch(`/api/leaderboard?type=${currentLeaderboardType}`);
        const list = await res.json();

        const thead = document.getElementById('lb-table-head');
        const tbody = document.getElementById('lb-tbody');

        if (currentLeaderboardType === 'xp') {
            thead.innerHTML = `
                <th>Rank</th>
                <th>User ID</th>
                <th>Level</th>
                <th>Experience (XP)</th>
            `;
        } else {
            thead.innerHTML = `
                <th>Rank</th>
                <th>User ID</th>
                <th>Net Worth</th>
                <th>Wallet / Bank</th>
            `;
        }

        if (list.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">No records found.</td></tr>';
            return;
        }

        const medals = ['🥇', '🥈', '🥉'];
        tbody.innerHTML = list.map((u, i) => {
            const medal = medals[i] || `#${i + 1}`;
            if (currentLeaderboardType === 'xp') {
                return `
                    <tr>
                        <td><b>${medal}</b></td>
                        <td><code>${u.userId}</code></td>
                        <td><span class="badge badge-blue">Level ${u.level}</span></td>
                        <td>${Number(u.xp).toLocaleString()} XP</td>
                    </tr>
                `;
            } else {
                return `
                    <tr>
                        <td><b>${medal}</b></td>
                        <td><code>${u.userId}</code></td>
                        <td><b style="color: var(--gold);">${Number(u.totalWealth).toLocaleString()} coins</b></td>
                        <td>Wallet: ${u.balance} | Bank: ${u.bank}</td>
                    </tr>
                `;
            }
        }).join('');
    } catch (err) {
        console.error('Failed to load leaderboard:', err);
    }
}

// Credentials & Token Form
document.getElementById('credentials-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = document.getElementById('input-token').value.trim();
    const clientId = document.getElementById('input-client-id').value.trim();

    try {
        const res = await fetch('/api/settings/credentials', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, clientId })
        });
        const data = await res.json();
        if (data.success) {
            showToast('Credentials saved! Attempting Discord connection...');
            setTimeout(loadStatus, 2000);
            setTimeout(loadGuilds, 3000);
        } else {
            showToast(data.error || 'Failed to save credentials.', 'error');
        }
    } catch (err) {
        showToast('Error: ' + err.message, 'error');
    }
});

// Deploy Slash Commands Button
document.getElementById('btn-deploy-commands').addEventListener('click', async () => {
    const btn = document.getElementById('btn-deploy-commands');
    btn.disabled = true;
    btn.innerText = 'Deploying slash commands to Discord API...';

    try {
        const res = await fetch('/api/deploy-commands', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });
        const data = await res.json();
        if (data.success) {
            showToast(data.message);
        } else {
            showToast(data.error || 'Deployment failed. Check token & Client ID.', 'error');
        }
    } catch (err) {
        showToast('Deployment error: ' + err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<span>🚀 Deploy Slash Commands to Discord</span>';
    }
});

document.getElementById('btn-refresh').addEventListener('click', () => {
    loadStatus();
    loadGuilds();
    loadAnnouncements();
    loadModLogs();
    showToast('Dashboard data refreshed!');
});

// Initial boot
loadStatus();
loadGuilds();
loadAnnouncements();
loadModLogs();
loadCommands();
loadLeaderboard();
updateLivePreview();
setInterval(loadStatus, 15000);
