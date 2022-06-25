const { Client, Message } = require("discord.js")
const { writeLog } = require("../logger")

module.exports = {
    name: 'jump',
    description: 'Jump to the song position in queue. The next one is 1, 2 ...',
    permission: {
        user: [],
        bot: []
    },
    dev_only: false,
    min_args: 1,
    args: ['<position>'],
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
            let queue = client.distube.getQueue(message)
            if (!queue) return message.channel.send(`The queue is empty!`)
            let reqPos = Number(args[0])
            if (isNaN(reqPos) || reqPos <= 0 || reqPos >= queue.songs.length - 1) return message.channel.send(`Invalid track position!`)
            queue.jump(reqPos)
        }
        catch (err)
        {
            writeLog(err)
        }
    }
}
