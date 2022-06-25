const { Client, Message } = require("discord.js")
const { writeLog } = require("../logger")

module.exports = {
    name: 'repeat',
    description: 'Repeat playing a song or queue after it has been done',
    permission: {
        user: [],
        bot: []
    },
    dev_only: false,
    min_args: 0,
    args: ['[off|song|queue]'],
    reqVoice: true,
    aliases: ['loop', 'l'],
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
            let mode = 2
            if (args[0])
            {
                switch (args[0].toLowerCase()) {
                case 'off':
                    mode = 0
                    break
                case 's':
                case 'song':
                    mode = 1
                    break
                case 'q':
                case 'queue':
                    mode = 2
                break
                default:
                    mode = -1
                    break
                }
            }
            if (mode == -1) return message.channel.send(`Invalid repeat mode!`)
            queue.setRepeatMode(mode)
            message.react((mode == 0)? '➡️' : '🔁')
        }
        catch (err)
        {
            writeLog(err)
        }
    }
}
