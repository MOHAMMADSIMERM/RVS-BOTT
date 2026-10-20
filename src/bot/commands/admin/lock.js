const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const db = require('../../services/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lock')
        .setDescription('Lock or unlock a channel for regular members')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addStringOption(opt =>
            opt.setName('action')
                .setDescription('Whether to lock or unlock the channel')
                .setRequired(true)
                .addChoices(
                    { name: '🔒 Lock Channel', value: 'lock' },
                    { name: '🔓 Unlock Channel', value: 'unlock' }
                )
        )
        .addChannelOption(opt =>
            opt.setName('channel')
                .setDescription('Channel to apply lock on (defaults to current channel)')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(false)
        )
        .addStringOption(opt =>
            opt.setName('reason')
                .setDescription('Reason for locking/unlocking')
                .setRequired(false)
        ),

    async execute(interaction) {
        const action = interaction.options.getString('action');
        const channel = interaction.options.getChannel('channel') || interaction.channel;
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const everyoneRole = interaction.guild.roles.everyone;

        try {
            if (action === 'lock') {
                await channel.permissionOverwrites.edit(everyoneRole, {
                    SendMessages: false,
                    AddReactions: false
                }, { reason: `Locked by ${interaction.user.tag}: ${reason}` });

                db.logModAction({
                    guildId: interaction.guild.id,
                    targetId: channel.id,
                    moderatorId: interaction.user.id,
                    action: 'LOCK_CHANNEL',
                    reason
                });

                return interaction.reply({
                    content: `🔒 **Channel Locked** | <#${channel.id}> has been locked by ${interaction.user.tag}.\n*Reason: ${reason}*`
                });
            } else {
                await channel.permissionOverwrites.edit(everyoneRole, {
                    SendMessages: null,
                    AddReactions: null
                }, { reason: `Unlocked by ${interaction.user.tag}: ${reason}` });

                db.logModAction({
                    guildId: interaction.guild.id,
                    targetId: channel.id,
                    moderatorId: interaction.user.id,
                    action: 'UNLOCK_CHANNEL',
                    reason
                });

                return interaction.reply({
                    content: `🔓 **Channel Unlocked** | <#${channel.id}> has been restored by ${interaction.user.tag}.`
                });
            }
        } catch (err) {
            console.error('[Lock] Error:', err);
            return interaction.reply({ content: `❌ Failed to modify channel lock: ${err.message}`, ephemeral: true });
        }
    }
};
