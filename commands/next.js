const { Client, Message } = require("discord.js")
const { writeLog } = require("../logger")

module.exports = {
    name: 'next',
    description: 'Play the next song if there is a next song in the queue',
    permission: {
        user: [],
        bot: []
    },
    dev_only: false,
    min_args: 0,
    args: [],
    reqVoice: true,
    aliases: ['skip'],
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
            if (queue.songs.length - 1 <= 0) return message.channel.send(`No next song found!`)
            await queue.skip()
            message.react('⏩')
        }
        catch (err)
        {
            writeLog(err)
        }
    }
}
