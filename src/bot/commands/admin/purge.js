const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../services/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Purge a specified number of recent messages from the channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addIntegerOption(opt =>
            opt.setName('amount')
                .setDescription('Number of messages to delete (1-100)')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)
        )
        .addUserOption(opt =>
            opt.setName('filter_user')
                .setDescription('Only delete messages sent by this specific user (optional)')
                .setRequired(false)
        ),

    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');
        const filterUser = interaction.options.getUser('filter_user');

        await interaction.deferReply({ ephemeral: true });

        try {
            const channel = interaction.channel;
            const messages = await channel.messages.fetch({ limit: amount });

            let toDelete = messages;
            if (filterUser) {
                toDelete = messages.filter(m => m.author.id === filterUser.id);
            }

            // Messages older than 14 days cannot be bulk deleted by Discord API
            const deleted = await channel.bulkDelete(toDelete, true);

            db.logModAction({
                guildId: interaction.guild.id,
                targetId: filterUser ? filterUser.id : 'CHANNEL',
                moderatorId: interaction.user.id,
                action: 'PURGE',
                reason: `Purged ${deleted.size} messages in #${channel.name}`
            });

            return interaction.editReply({
                content: `🗑️ Successfully purged **${deleted.size}** message(s)${filterUser ? ` from **${filterUser.tag}**` : ''}.`
            });
        } catch (err) {
            console.error('[Purge] Error:', err);
            return interaction.editReply({
                content: `❌ Failed to purge messages: ${err.message}`
            });
        }
    }
};
