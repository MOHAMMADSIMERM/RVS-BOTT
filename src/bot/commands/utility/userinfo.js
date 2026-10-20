const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../services/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('View detailed member identity, joined date, roles, and status')
        .addUserOption(opt =>
            opt.setName('target')
                .setDescription('The member to inspect (optional)')
                .setRequired(false)
        ),

    async execute(interaction) {
        const target = interaction.options.getUser('target') || interaction.user;
        const member = await interaction.guild.members.fetch(target.id).catch(() => null);
        const profile = db.getUser(target.id);
        const warns = db.getWarnings(interaction.guild.id, target.id);

        const roles = member
            ? member.roles.cache
                .filter(r => r.id !== interaction.guild.id)
                .sort((a, b) => b.position - a.position)
                .map(r => `<@&${r.id}>`)
                .slice(0, 10)
                .join(', ') || 'No custom roles'
            : 'Not in guild';

        const embed = new EmbedBuilder()
            .setTitle(`👤 Subject Profile: ${target.tag}`)
            .setColor('#4CC9F0')
            .setThumbnail(target.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: '🆔 User ID', value: `\`${target.id}\``, inline: true },
                { name: '🤖 Account Type', value: target.bot ? 'Bot' : 'Human', inline: true },
                { name: '📅 Created Discord', value: `<t:${Math.floor(target.createdTimestamp / 1000)}:R>`, inline: true },
                { name: '🏰 Joined Server', value: member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : 'N/A', inline: true },
                { name: '⭐ Level', value: `\`Level ${profile.level}\``, inline: true },
                { name: '🪙 Wealth', value: `\`${(profile.balance + profile.bank).toLocaleString()} coins\``, inline: true },
                { name: '⚠️ Server Warnings', value: `\`${warns.length}\``, inline: true },
                { name: '🎭 Top Roles', value: roles, inline: false }
            )
            .setFooter({ text: 'RAVANAS Intelligence Database' })
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
};
