const { Client, Message } = require("discord.js");

module.exports = {
    name: 'seek',
    description: 'Set the playing time to another position',
    permission: {
        user: [],
        bot: []
    },
    dev_only: false,
    min_args: 1,
    args: ['<time>'],
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
            let timeStr = args.join(' ').split(':');
            if (timeStr.length < 2 ||
                isNaN(Number(timeStr[0])) ||
                isNaN(Number(timeStr[1]))
            ) return message.channel.send(`Invalid seek time format!`);

            let time = Number(timeStr[0]) * 60 + Number(timeStr[1]);
            if (timeStr.length == 3) time = Number(timeStr[0]) * 3600 + Number(timeStr[1]) * 60 + Number(timeStr[2]);
            queue.seek(time);
            message.react('↔️');
        }
        catch (err)
        {
            console.log(`Error: ${err}`);            
        }
    }
};
