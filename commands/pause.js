const { Client, Message } = require("discord.js");
const { writeLog } = require("../logger");

module.exports = {
    name: 'pause',
    description: 'Temporarily stop playing the song',
    permission: {
        user: [],
        bot: ['CONNECT', 'SPEAK']
    },
    dev_only: false,
    min_args: 0,
    args: [],
    reqVoice: true,
    aliases: [],
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
            queue.pause();
            message.react('⏸');
        }
        catch (err)
        {
            writeLog(err);
        }
    }
};
