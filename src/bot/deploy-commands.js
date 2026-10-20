const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const commands = [];
const commandsPath = path.join(__dirname, 'commands');

function scanCommands(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            scanCommands(fullPath);
        } else if (file.endsWith('.js')) {
            try {
                const command = require(fullPath);
                if (command.data) {
                    commands.push(command.data.toJSON());
                }
            } catch (err) {
                console.error(`[Deploy] Error reading ${file}:`, err.message);
            }
        }
    }
}

scanCommands(commandsPath);

async function deploySlashCommands(token, clientId, guildId = null) {
    const botToken = token || process.env.DISCORD_TOKEN;
    const botClientId = clientId || process.env.CLIENT_ID;

    if (!botToken || !botClientId) {
        console.error('❌ Cannot deploy commands: DISCORD_TOKEN or CLIENT_ID is missing.');
        return { success: false, error: 'DISCORD_TOKEN or CLIENT_ID is missing.' };
    }

    const rest = new REST({ version: '10' }).setToken(botToken);

    try {
        console.log(`[Deploy] Started refreshing ${commands.length} application (/) commands.`);

        let data;
        if (guildId) {
            // Guild-specific (instant update for testing)
            data = await rest.put(
                Routes.applicationGuildCommands(botClientId, guildId),
                { body: commands }
            );
            console.log(`[Deploy] Successfully reloaded ${data.length} commands for guild ${guildId}.`);
        } else {
            // Global commands
            data = await rest.put(
                Routes.applicationCommands(botClientId),
                { body: commands }
            );
            console.log(`[Deploy] Successfully reloaded ${data.length} global application commands.`);
        }

        return { success: true, count: data.length };
    } catch (error) {
        console.error('[Deploy] Failed to register slash commands:', error);
        return { success: false, error: error.message };
    }
}

if (require.main === module) {
    deploySlashCommands();
}

module.exports = { deploySlashCommands, commands };
