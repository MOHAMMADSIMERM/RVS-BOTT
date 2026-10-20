const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js');
const fs = require('fs');
const path = require('path');
const db = require('./services/db');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildMessageReactions
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.User]
});

client.commands = new Collection();
client.db = db;

// Recursively load all commands
function loadCommands(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            loadCommands(fullPath);
        } else if (file.endsWith('.js')) {
            try {
                const command = require(fullPath);
                if (command.data && command.execute) {
                    client.commands.set(command.data.name, command);
                    console.log(`[Loader] Loaded slash command: /${command.data.name}`);
                }
            } catch (err) {
                console.error(`[Loader] Error loading command ${file}:`, err.message);
            }
        }
    }
}

// Load events
function loadEvents(dir) {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
    for (const file of files) {
        try {
            const event = require(path.join(dir, file));
            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args, client));
            } else {
                client.on(event.name, (...args) => event.execute(...args, client));
            }
            console.log(`[Loader] Registered event: ${event.name}`);
        } catch (err) {
            console.error(`[Loader] Error registering event ${file}:`, err.message);
        }
    }
}

const commandsPath = path.join(__dirname, 'commands');
const eventsPath = path.join(__dirname, 'events');

loadCommands(commandsPath);
loadEvents(eventsPath);

async function startBot(token) {
    const botToken = token || process.env.DISCORD_TOKEN;
    if (!botToken || botToken === 'YOUR_DISCORD_BOT_TOKEN_HERE') {
        console.warn('\n⚠️ [RAVANAS BOT] DISCORD_TOKEN is not configured yet in .env.');
        console.warn('👉 The Web Dashboard is fully active on http://localhost:3000!');
        console.warn('👉 Add your token to .env or in the Dashboard to connect RAVANAS to Discord.\n');
        return false;
    }

    try {
        await client.login(botToken);
        return true;
    } catch (err) {
        console.error('[RAVANAS BOT] Failed to login to Discord:', err.message);
        return false;
    }
}

module.exports = {
    client,
    startBot
};
