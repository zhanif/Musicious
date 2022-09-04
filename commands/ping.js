const { Client, Message } = require("discord.js")
module.exports = {
    name: 'ping',
    description: 'Check the bot\'s latency',
    permission: {
        user: [],
        bot: []
    },
    dev_only: false,
    min_args: 0,
    args: [],
    reqVoice: false,
    aliases: [],
    /**
     * @param {Client} client 
     * @param {Message} message 
     */
    run: async(client, message) => {
        try
        {
            message.channel.send('Receiving...').then(msg => {
                let createdAt = msg.createdAt - message.createdAt
                let websocketAt = client.ws.ping
                let editedMessage =  `📶・Latency: \`${createdAt}\` ms | API: \`${websocketAt}\` ms`
                msg.edit(editedMessage)
            })
        }
        catch (err)
        {
            client.writeLog(err)
        }
    }
}
