module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (!interaction.isChatInputCommand()) return;

        const command = client.commands.get(interaction.commandName);
        if (!command) {
            console.warn(`[Command] Unknown command invoked: ${interaction.commandName}`);
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(`[Command Error] Error executing /${interaction.commandName}:`, error);

            const errorMessage = {
                content: '⚠️ An error occurred while executing this command in the name of RAVANAS.',
                ephemeral: true
            };

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(errorMessage).catch(() => null);
            } else {
                await interaction.reply(errorMessage).catch(() => null);
            }
        }
    }
};
