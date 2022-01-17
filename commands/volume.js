const { Client, Message } = require("discord.js");

module.exports = {
    name: 'volume',
    description: 'Set the playing song\'s volume',
    permission: {
        user: [],
        bot: []
    },
    dev_only: false,
    min_args: 1,
    args: ['<volume>'],
    reqVoice: true,
    aliases: ['vol', 'v'],
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {String[]} args
     */
    run: async(client, message, args) => {
        try
        {
            let queue = client.distube.getQueue(message);
            if (!queue) return message.channel.send(`The queue is empty!`);
            let volume = 50;
            if (args[0]) volume = Number(args[0]);
            if (isNaN(volume)) return message.channel.send(`Please specify the volume (0-100)!`);
            message.react((volume > queue.volume)? '🔊' : '🔉');
            queue.setVolume(volume);
        }
        catch (err)
        {
            console.log(`Error: ${err}`);
        }
    }
};
