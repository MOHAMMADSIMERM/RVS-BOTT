require('dotenv').config();
const { client, startBot } = require('./bot/client');
const { startWebServer } = require('./web/server');

const PORT = process.env.PORT || 3000;

console.log(`
===========================================================
  👑  R A V A N A S   D I S C O R D   S O V E R E I G N  👑
      Multi-Purpose Ecosystem • Anime, RPG & Web Console
===========================================================
`);

// 1. Launch Web Server & Dashboard
const server = startWebServer(client, PORT);

// 2. Launch Discord Bot Gateway
startBot();

// Graceful Shutdown
process.on('SIGINT', () => {
    console.log('\n[RAVANAS] Shutting down gracefully...');
    if (client && client.destroy) {
        client.destroy();
    }
    server.close(() => {
        console.log('[RAVANAS] Web server stopped. Goodbye!');
        process.exit(0);
    });
});
