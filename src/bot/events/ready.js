const { ActivityType } = require('discord.js');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`[RAVANAS] Logged in as ${client.user.tag}!`);
        console.log(`[RAVANAS] Serving ${client.guilds.cache.size} guild(s) and ${client.users.cache.size} cached user(s).`);

        // Set rich bot activity
        const activities = [
            { name: '/help • RAVANAS Realm', type: ActivityType.Watching },
            { name: 'over Lanka & the mortal realm', type: ActivityType.Watching },
            { name: 'localhost:3000 Web Console', type: ActivityType.Listening },
            { name: '/announce • Sovereign Orders', type: ActivityType.Playing }
        ];

        let index = 0;
        client.user.setPresence({
            activities: [activities[0]],
            status: 'online'
        });

        setInterval(() => {
            index = (index + 1) % activities.length;
            client.user.setPresence({
                activities: [activities[index]],
                status: 'online'
            });
        }, 30000);
    }
};
