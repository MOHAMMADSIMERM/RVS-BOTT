const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../services/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('role')
        .setDescription('Assign or revoke a role from a member')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addStringOption(opt =>
            opt.setName('action')
                .setDescription('Give or take role')
                .setRequired(true)
                .addChoices(
                    { name: '➕ Give Role', value: 'add' },
                    { name: '➖ Remove Role', value: 'remove' }
                )
        )
        .addUserOption(opt => opt.setName('target').setDescription('Target member').setRequired(true))
        .addRoleOption(opt => opt.setName('role').setDescription('Role to modify').setRequired(true)),

    async execute(interaction) {
        const action = interaction.options.getString('action');
        const target = interaction.options.getUser('target');
        const role = interaction.options.getRole('role');

        const member = await interaction.guild.members.fetch(target.id).catch(() => null);
        if (!member) {
            return interaction.reply({ content: '❌ Member is not in this server.', ephemeral: true });
        }

        // Check bot role hierarchy
        const botMember = interaction.guild.members.me;
        if (role.position >= botMember.roles.highest.position) {
            return interaction.reply({
                content: `❌ RAVANAS cannot manage the **${role.name}** role because it is higher than or equal to my highest role.`,
                ephemeral: true
            });
        }

        // Check user role hierarchy
        if (role.position >= interaction.member.roles.highest.position && interaction.user.id !== interaction.guild.ownerId) {
            return interaction.reply({
                content: `❌ You cannot manage a role higher than or equal to your own highest role.`,
                ephemeral: true
            });
        }

        try {
            if (action === 'add') {
                if (member.roles.cache.has(role.id)) {
                    return interaction.reply({ content: `⚠️ **${target.tag}** already has the **${role.name}** role.`, ephemeral: true });
                }
                await member.roles.add(role, `Assigned by ${interaction.user.tag}`);
                db.logModAction({
                    guildId: interaction.guild.id,
                    targetId: target.id,
                    moderatorId: interaction.user.id,
                    action: 'ROLE_ADD',
                    reason: `Added role @${role.name}`
                });

                return interaction.reply({ content: `✅ Granted **${role.name}** role to **${target.tag}**.` });
            } else {
                if (!member.roles.cache.has(role.id)) {
                    return interaction.reply({ content: `⚠️ **${target.tag}** does not have the **${role.name}** role.`, ephemeral: true });
                }
                await member.roles.remove(role, `Removed by ${interaction.user.tag}`);
                db.logModAction({
                    guildId: interaction.guild.id,
                    targetId: target.id,
                    moderatorId: interaction.user.id,
                    action: 'ROLE_REMOVE',
                    reason: `Removed role @${role.name}`
                });

                return interaction.reply({ content: `✅ Removed **${role.name}** role from **${target.tag}**.` });
            }
        } catch (err) {
            console.error('[Role] Error:', err);
            return interaction.reply({ content: `❌ Failed to update role: ${err.message}`, ephemeral: true });
        }
    }
};
