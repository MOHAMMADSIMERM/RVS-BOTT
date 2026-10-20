const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/api');

function createWebServer(client) {
    const app = express();

    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Serve static files for dashboard UI
    const publicPath = path.join(__dirname, 'public');
    app.use(express.static(publicPath));

    // API endpoints
    app.use('/api', apiRoutes(client));

    // Fallback to index.html for single-page app (compatible with Express 4 & 5)
    app.use((req, res) => {
        res.sendFile(path.join(publicPath, 'index.html'));
    });

    return app;
}

function startWebServer(client, port = 3000) {
    const app = createWebServer(client);
    const serverPort = process.env.PORT || port;

    const server = app.listen(serverPort, () => {
        console.log(`\n======================================================`);
        console.log(`👑 RAVANAS Sovereign Web Console & Dashboard`);
        console.log(`🌐 Live at: http://localhost:${serverPort}`);
        console.log(`======================================================\n`);
    });

    return server;
}

module.exports = {
    createWebServer,
    startWebServer
};
