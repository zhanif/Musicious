const { Client, Message } = require("discord.js");

module.exports = {
    name: 'stop',
    description: 'Stop playing a song or playlist. Emptying the queue',
    permission: {
        user: [],
        bot: ['CONNECT', 'SPEAK']
    },
    dev_only: false,
    min_args: 0,
    args: [],
    reqVoice: true,
    aliases: ['s'],
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
            queue.stop();
            message.react('🛑');
        }
        catch (err)
        {
            console.log(`Error: ${err}`);
        }
    }
};
