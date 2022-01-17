const { Client, Message } = require("discord.js");

module.exports = {
    name: 'previous',
    description: 'Play the previous song if there is a previous song in the queue',
    permission: {
        user: [],
        bot: []
    },
    dev_only: false,
    min_args: 0,
    args: [],
    reqVoice: true,
    aliases: ['prev', 'back'],
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
            if (queue.previousSongs.length == 0) return message.channel.send(`No previous song found!`);
            await queue.previous();
            message.react('⏪');
        }
        catch (err)
        {
            console.log(`Error: ${err}`);
        }
    }
};
