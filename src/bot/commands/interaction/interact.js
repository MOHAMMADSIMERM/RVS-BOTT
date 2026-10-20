const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const INTERACTIONS = {
    hug: {
        title: '🤗 Warm Embrace',
        color: '#FF6B6B',
        selfText: '{sender} gives themselves a comforting hug.',
        otherText: '{sender} hugs {target} so warmly! 💕',
        gifs: [
            'https://media.giphy.com/media/od5H3PmEG5EVq/giphy.gif',
            'https://media.giphy.com/media/lrr9rHuoJOE0w/giphy.gif',
            'https://media.giphy.com/media/u9BxQbM5bxvwY/giphy.gif',
            'https://media.giphy.com/media/wnsgren9NtITS/giphy.gif'
        ]
    },
    pat: {
        title: '🐾 Gentle Headpat',
        color: '#4ECDC4',
        selfText: '{sender} pats their own head... good job!',
        otherText: '{sender} gently pats {target} on the head. So sweet! ✨',
        gifs: [
            'https://media.giphy.com/media/L2z7dnOduqEow/giphy.gif',
            'https://media.giphy.com/media/5tmRHwTlHAA9WkV3NT/giphy.gif',
            'https://media.giphy.com/media/ARSp9T7wwxNcs/giphy.gif'
        ]
    },
    kiss: {
        title: '💋 Loving Kiss',
        color: '#F72585',
        selfText: '{sender} kisses the mirror. Self-love is important! 💖',
        otherText: '{sender} plants a tender kiss on {target}! 💘',
        gifs: [
            'https://media.giphy.com/media/G3va31oEEnIkM/giphy.gif',
            'https://media.giphy.com/media/bm2O3nXTcKJeU/giphy.gif',
            'https://media.giphy.com/media/zkppEMFvRX5FC/giphy.gif'
        ]
    },
    slap: {
        title: '💥 Resounding Slap',
        color: '#E63946',
        selfText: '{sender} slaps themselves awake!',
        otherText: '{sender} delivers a thunderous slap to {target}! Ouch! ⚡',
        gifs: [
            'https://media.giphy.com/media/Gf3AUz3eBNbTW/giphy.gif',
            'https://media.giphy.com/media/jLeyZWgtwWP2U/giphy.gif',
            'https://media.giphy.com/media/Zau0yrl15jDdelta8a/giphy.gif'
        ]
    },
    punch: {
        title: '👊 Serious Punch',
        color: '#E76F51',
        selfText: '{sender} shadowboxes fiercely!',
        otherText: '{sender} strikes {target} with a devastating KO punch! 💥',
        gifs: [
            'https://media.giphy.com/media/arbHBDAq95uDcxx9Su/giphy.gif',
            'https://media.giphy.com/media/GoJq4mQZ0062xKdWzo/giphy.gif'
        ]
    },
    poke: {
        title: '👉 Boop & Poke',
        color: '#FFE66D',
        selfText: '{sender} pokes their own cheek in confusion.',
        otherText: '{sender} pokes {target}! Hey, wake up! 😋',
        gifs: [
            'https://media.giphy.com/media/pkY4ra5dhljDW/giphy.gif',
            'https://media.giphy.com/media/pW78wAZwdd7Py/giphy.gif'
        ]
    },
    cuddle: {
        title: '🧸 Cozy Cuddle',
        color: '#B5179E',
        selfText: '{sender} curls up in a blanket burrito.',
        otherText: '{sender} cuddles closely with {target}. So warm and comfy! 🌟',
        gifs: [
            'https://media.giphy.com/media/l2QDM9Jnim1YV5ujC/giphy.gif',
            'https://media.giphy.com/media/PHZ7vmgmg0V5S/giphy.gif'
        ]
    },
    dance: {
        title: '💃 Festive Dance',
        color: '#7209B7',
        selfText: '{sender} busts a crazy groove on the dance floor! 🕺',
        otherText: '{sender} pulls {target} into a passionate dance under the moonlight! 🎶',
        gifs: [
            'https://media.giphy.com/media/blSTtZehjAZ8I/giphy.gif',
            'https://media.giphy.com/media/mKMGLhoD8L4yc/giphy.gif'
        ]
    }
};

module.exports = {
    INTERACTIONS,
    data: new SlashCommandBuilder()
        .setName('interact')
        .setDescription('Koya-style anime social interactions with members')
        .addStringOption(opt =>
            opt.setName('action')
                .setDescription('The interaction action to perform')
                .setRequired(true)
                .addChoices(
                    { name: '🤗 Hug', value: 'hug' },
                    { name: '🐾 Headpat', value: 'pat' },
                    { name: '💋 Kiss', value: 'kiss' },
                    { name: '💥 Slap', value: 'slap' },
                    { name: '👊 Punch', value: 'punch' },
                    { name: '👉 Poke', value: 'poke' },
                    { name: '🧸 Cuddle', value: 'cuddle' },
                    { name: '💃 Dance', value: 'dance' }
                )
        )
        .addUserOption(opt =>
            opt.setName('target')
                .setDescription('The member to interact with (optional)')
                .setRequired(false)
        ),

    async execute(interaction) {
        const actionKey = interaction.options.getString('action');
        const target = interaction.options.getUser('target');
        const action = INTERACTIONS[actionKey];

        if (!action) {
            return interaction.reply({ content: '❌ Unknown interaction action.', ephemeral: true });
        }

        const isSelf = !target || target.id === interaction.user.id;
        const text = isSelf
            ? action.selfText.replace('{sender}', `**${interaction.user.username}**`)
            : action.otherText
                .replace('{sender}', `**${interaction.user.username}**`)
                .replace('{target}', `**${target.username}**`);

        const randomGif = action.gifs[Math.floor(Math.random() * action.gifs.length)];

        const embed = new EmbedBuilder()
            .setTitle(action.title)
            .setDescription(text)
            .setColor(action.color)
            .setImage(randomGif)
            .setFooter({
                text: `RAVANAS Interactions • Action: ${actionKey.toUpperCase()}`,
                iconURL: interaction.client.user?.displayAvatarURL()
            })
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
};
