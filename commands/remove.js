const { Client, Message } = require("discord.js");

module.exports = {
    name: 'remove',
    description: 'Remove a song from queue if the song is exist',
    permission: {
        user: [],
        bot: []
    },
    dev_only: false,
    min_args: 1,
    args: ['<position>'],
    reqVoice: true,
    aliases: ['rem'],
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
            let pos = Number(args[0]);
            if (isNaN(pos) || pos <= 0 || pos > queue.songs.length - 1) return message.channel.send(`Invalid track position!`);
            queue.songs.splice(pos, 1);
            message.react('☑');
        }
        catch (err)
        {
            console.log(`Error: ${err}`);            
        }
    }
};
