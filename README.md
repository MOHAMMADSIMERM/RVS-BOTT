# 👑 RAVANAS • Supreme Discord Sovereign & Web Management System

An almighty, multi-purpose Discord bot & real-time Web Console inspired by **Koya Bot**. RAVANAS delivers full server governance, rich anime/social interactions, leveling & RPG economy, moderation audit logging, and a dedicated **Web Announcement Studio** with real-time Discord embed preview.

---

## 🌟 Key Features

### 📢 1. Announcement Studio (Both Discord Commands & Web Console)
- **Live Discord Preview**: Design announcements in your browser at `http://localhost:3000` and see a real-time pixel-perfect simulation of how the embed will look in Discord!
- **Channel Selector & Mentions**: Target specific text channels and toggle `@everyone`, `@here`, or silent pings.
- **Rich Embed Options**: Title, markdown content, custom colors (Hex or presets like *RAVANAS Crimson*, *Imperial Gold*, *Cyber Blue*), banner images, and thumbnails.
- **Command Access**: Run `/announce` directly inside Discord.

### 🛡️ 2. Administrative & Moderation Suite
- Full administrative control:
  - `/ban` & `/unban`: Ban or pardon users with reason and message history purge options.
  - `/kick`: Expel members with hierarchy safety checks.
  - `/timeout`: Mute/timeout members for specified minutes or lift timeouts.
  - `/warn`: Formal warning system (`/warn add`, `/warn list`, `/warn clear`).
  - `/purge`: Bulk delete 1–100 messages with optional user filter.
  - `/slowmode`: Configure channel rate limits.
  - `/lock`: Lock or unlock channels.
  - `/role`: Assign or remove roles from members.
- **Web Moderation**: Execute kicks, bans, timeouts, and warnings straight from the browser!
- **Audit Logging**: All disciplinary actions are recorded and viewable in the live Web Audit Log.

### 🌸 3. Koya-Style Anime & Social Interactions
- Expressive anime GIFs and randomized responses:
  - `/interact action:hug` — Warm embrace
  - `/interact action:pat` — Gentle headpat
  - `/interact action:kiss` — Affectionate kiss
  - `/interact action:slap` — Thunderous slap
  - `/interact action:punch` — Devastating punch
  - `/interact action:poke` — Boop cheek
  - `/interact action:cuddle` — Cozy cuddle
  - `/interact action:dance` — Festive dance

### 🪙 4. Economy & Casino Mini-Games
- `/daily`: Daily coin collection with consecutive streak multipliers.
- `/work`: Undertake jobs in the realm to earn honest wages.
- `/balance`: Check your wallet, royal bank, and net worth.
- `/coinflip`: Wager coins on heads or tails.
- `/slots`: 3-reel slot machine with jackpot multipliers (Crowns 10x, Diamonds 7x, Skulls 5x).
- `/gamble`: Roll a 100-sided die against RAVANAS.
- `/rob`: Stealthily pickpocket coins from another user (with fine risk!).

### ⭐ 5. Leveling & Progression
- Automated XP gain on chatting (with spam cooldown protection).
- Level-up announcements with celebratory embeds.
- `/rank`: Beautiful rank card with level progress bar and ranking.
- `/leaderboard`: View top champions by XP or Wealth.

### ⚙️ 6. Guild Configuration
- `/setwelcome`: Custom welcome embed with `{user}`, `{server}`, `{members}` tags.
- `/setgoodbye`: Departure farewell messages.
- `/setlogs`: Dedicated moderation audit log channel.
- `/autorole`: Automatic role assignment for newcomers.

---

## 🚀 Quick Start Guide

### Step 1: Create Your Bot on Discord Developer Portal
1. Navigate to the [Discord Developer Portal](https://discord.com/developers/applications).
2. Click **New Application**, name it **RAVANAS**, and click **Create**.
3. Go to the **Bot** tab on the left:
   - Click **Reset Token** and copy your **Bot Token**.
   - Under **Privileged Gateway Intents**, turn ON:
     - ✅ **Presence Intent**
     - ✅ **Server Members Intent**
     - ✅ **Message Content Intent**
   - Click **Save Changes**.
4. Go to **General Information** on the left:
   - Copy your **Application ID** (this is your `CLIENT_ID`).

### Step 2: Configure Credentials
You can configure credentials in two ways:

#### Option A: Via the Web Dashboard (Easiest)
1. Start the bot and open `http://localhost:3000`.
2. Click on **Setup & Credentials** tab in the sidebar.
3. Paste your **Bot Token** and **Client ID**, then click **Save & Connect**.

#### Option B: Via `.env` File
Open `.env` in the `ravanas-bot` directory and set:
```env
DISCORD_TOKEN=your_actual_bot_token_here
CLIENT_ID=your_actual_application_id_here
PORT=3000
```

### Step 3: Invite RAVANAS with Administrator Permissions
Click the **"➕ Add RAVANAS to Server"** button at the top right of the Web Dashboard, or open this URL in your browser (replace `YOUR_CLIENT_ID`):
```
https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&scope=bot%20applications.commands&permissions=8
```
Select your server and authorize it.

### Step 4: Register Slash Commands
In the Web Dashboard under **Setup & Credentials**, click **"Deploy Slash Commands to Discord"**, or run:
```powershell
node src/bot/deploy-commands.js
```
All 29 slash commands will be synced with Discord!

### Step 5: Start the Bot
Run the provided 1-click launcher on Windows:
```cmd
start.bat
```
or via command line:
```powershell
node src/index.js
```

---

## 🌐 Web Dashboard Tour (`http://localhost:3000`)

| Tab | Description |
|---|---|
| **Overview** | Real-time bot metrics (Ping, RAM, Uptime, Connected Servers, Total Members). |
| **Announcement Studio** | Select server/channel, craft rich embed announcements, live Discord preview, and 1-click broadcast. |
| **Moderation & Logs** | Kick, ban, timeout, warn users, and inspect recent audit logs. |
| **Server Settings** | Configure welcome/goodbye channels, custom messages, mod log channel, and auto-roles. |
| **Commands Catalog** | Full directory of all slash commands, descriptions, and syntax. |
| **Leaderboards** | Hall of Fame displaying top players by XP and total wealth. |
| **Setup & Credentials** | Update bot token and deploy slash commands. |

---

## 📜 Full Slash Commands Directory

| Command | Category | Description | Permissions Required |
|---|---|---|---|
| `/announce` | Admin | Broadcast an official rich embed announcement to any text channel | Manage Guild / Admin |
| `/ban` | Admin | Ban a member with reason and history purge options | Ban Members |
| `/unban` | Admin | Revoke a ban by user ID | Ban Members |
| `/kick` | Admin | Kick a member from the server | Kick Members |
| `/timeout` | Admin | Mute/timeout a member for X minutes (or lift timeout) | Moderate Members |
| `/warn` | Admin | Issue, list, or clear member disciplinary warnings | Moderate Members |
| `/purge` | Admin | Bulk delete 1–100 messages with optional user filter | Manage Messages |
| `/slowmode` | Admin | Configure channel slowmode rate limit | Manage Channels |
| `/lock` | Admin | Lock down or restore a channel | Manage Channels |
| `/role` | Admin | Assign or remove a role from a member | Manage Roles |
| `/setwelcome` | Config | Configure welcome card, channel, and custom message | Manage Guild |
| `/setgoodbye` | Config | Configure departure farewell notifications | Manage Guild |
| `/setlogs` | Config | Configure audit log channel | Manage Guild |
| `/autorole` | Config | Set automatic role assigned to newcomers | Manage Guild |
| `/interact` | Social | Koya-style interactions (hug, pat, kiss, slap, punch, poke, cuddle, dance) | Everyone |
| `/balance` | Economy | Check wallet, bank balance, and net worth | Everyone |
| `/daily` | Economy | Claim daily gold reward with streak multipliers | Everyone |
| `/work` | Economy | Work jobs to earn coins | Everyone |
| `/coinflip` | Economy | Bet coins on heads or tails | Everyone |
| `/slots` | Economy | Casino slot machine with jackpot multipliers | Everyone |
| `/gamble` | Economy | Roll a 100-sided die against RAVANAS | Everyone |
| `/rob` | Economy | Attempt to pickpocket another user with fine risk | Everyone |
| `/rank` | Leveling | View current level, XP, and progress bar | Everyone |
| `/leaderboard` | Leveling | Display top server members by XP or Wealth | Everyone |
| `/botinfo` | Utility | Detailed system diagnostics, ping, and memory usage | Everyone |
| `/serverinfo` | Utility | Detailed server metrics, owner, roles, and channels | Everyone |
| `/userinfo` | Utility | Member joined date, roles, badges, and warnings | Everyone |
| `/ping` | Utility | Check WebSocket and REST latency | Everyone |
| `/help` | Utility | Command handbook and Web Console link | Everyone |

---

## 📁 Project Architecture
```
ravanas-bot/
├── .env                  # Bot credentials & configuration
├── package.json          # Dependencies (discord.js v14, express, cors, dotenv)
├── start.bat             # 1-Click Windows Launcher
├── README.md             # Complete Documentation
├── data/
│   └── db.json           # JSON Database (guilds, economy, xp, warnings, modlogs)
└── src/
    ├── index.js          # Main Entry Point (Discord client + Web server)
    ├── bot/
    │   ├── client.js     # Discord Client & event/command registration
    │   ├── deploy-commands.js # Discord REST API slash command deployment
    │   ├── commands/     # 29 Slash Commands organized by domain
    │   │   ├── admin/    # announce, ban, kick, lock, purge, role, slowmode, timeout, unban, warn
    │   │   ├── config/   # autorole, setgoodbye, setlogs, setwelcome
    │   │   ├── economy/  # balance, coinflip, daily, gamble, rob, slots, work
    │   │   ├── interaction/ # interact (hug, pat, kiss, slap, punch, poke, cuddle, dance)
    │   │   ├── leveling/ # leaderboard, rank
    │   │   └── utility/  # botinfo, help, ping, serverinfo, userinfo
    │   ├── events/       # ready, interactionCreate, messageCreate (XP), guildMemberAdd, guildMemberRemove
    │   └── services/
    │       ├── db.js     # Persistence layer (guilds, users, warnings, logs, economy)
    │       └── announcement.js # Core announcement broadcast engine
    └── web/
        ├── server.js     # Express server & static dashboard host
        ├── routes/
        │   └── api.js    # REST API endpoints (/api/status, /api/guilds, /api/announce, /api/mod, etc.)
        └── public/       # Modern responsive Web Dashboard
            ├── index.html
            ├── css/styles.css
            └── js/app.js
```

---
*Created for the RAVANAS Sovereign Realm. Built with Node.js & Discord.js v14.*
