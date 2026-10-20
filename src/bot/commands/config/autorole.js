const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../services/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('autorole')
        .setDescription('Configure an automatic role to assign when new members join')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addRoleOption(opt =>
            opt.setName('role')
                .setDescription('The role to automatically grant (leave empty to disable)')
                .setRequired(false)
        ),

    async execute(interaction) {
        const role = interaction.options.getRole('role');

        if (!role) {
            db.updateGuild(interaction.guild.id, { autoRole: '' });
            return interaction.reply({
                content: '🚫 **Auto-Role Disabled.** New members will not receive an automatic role upon joining.'
            });
        }

        // Verify bot can assign this role
        const botMember = interaction.guild.members.me;
        if (role.position >= botMember.roles.highest.position) {
            return interaction.reply({
                content: `❌ RAVANAS cannot assign **${role.name}** because it is positioned higher than or equal to my highest role.`,
                ephemeral: true
            });
        }

        db.updateGuild(interaction.guild.id, { autoRole: role.id });

        return interaction.reply({
            content: `✨ **Auto-Role Configured!** All newcomers will automatically be knighted with the **${role.name}** role.`
        });
    }
};
