const { Client, Message } = require("discord.js")
const { writeLog } = require("../logger")

module.exports = {
    name: 'play',
    description: 'Play a song or playlist from url. If the bot is currently playing a song, the result is added to the queue.',
    permission: {
        user: [],
        bot: ['CONNECT', 'SPEAK', 'VIEW_CHANNEL']
    },
    dev_only: false,
    min_args: 1,
    args: ['<song>'],
    reqVoice: true,
    aliases: ['p'],
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {String[]} args
     */
    run: async(client, message, args) => {
        try
        {
            let query = args.join(' ')
            // let totalQueue = client.distube.getQueue(message).songs.length
            client.distube.play(message.member.voice.channel, query, {
                member: message.member,
                textChannel: message.channel,
                message
            })
            await message.react('🔍')
        }
        catch (err)
        {
            writeLog(err)
        }
    }
}
