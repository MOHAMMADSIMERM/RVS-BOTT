const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const db = require('../../services/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a member from the server')
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The member to kick')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for kicking')
                .setRequired(false)
        ),

    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        if (target.id === interaction.user.id) {
            return interaction.reply({ content: '❌ You cannot kick yourself!', ephemeral: true });
        }

        const member = await interaction.guild.members.fetch(target.id).catch(() => null);
        if (!member) {
            return interaction.reply({ content: '❌ Member is not in this server.', ephemeral: true });
        }

        if (!member.kickable) {
            return interaction.reply({ content: '❌ RAVANAS cannot kick this member due to role hierarchy.', ephemeral: true });
        }

        if (member.roles.highest.position >= interaction.member.roles.highest.position && interaction.user.id !== interaction.guild.ownerId) {
            return interaction.reply({ content: '❌ You cannot kick someone with a role equal to or higher than yours.', ephemeral: true });
        }

        try {
            await member.kick(`${reason} | Kicked by ${interaction.user.tag}`);

            db.logModAction({
                guildId: interaction.guild.id,
                targetId: target.id,
                moderatorId: interaction.user.id,
                action: 'KICK',
                reason
            });

            const embed = new EmbedBuilder()
                .setTitle('👢 Member Expelled | RAVANAS Order')
                .setColor('#FF9F1C')
                .setThumbnail(target.displayAvatarURL())
                .addFields(
                    { name: 'Target', value: `${target.tag} (\`${target.id}\`)`, inline: true },
                    { name: 'Moderator', value: `${interaction.user.tag}`, inline: true },
                    { name: 'Reason', value: reason, inline: false }
                )
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
        } catch (err) {
            console.error('[Kick] Error:', err);
            return interaction.reply({ content: `❌ Failed to kick: ${err.message}`, ephemeral: true });
        }
    }
};
