const { Client, Message } = require("discord.js");
const { writeLog } = require("../logger");

module.exports = {
    name: 'leave',
    description: 'Leave the voice channel',
    permission: {
        user: [],
        bot: []
    },
    dev_only: false,
    min_args: 0,
    args: [],
    reqVoice: true,
    aliases: ['disconnect', 'dc'],
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {String[]} args
     */
    run: async(client, message, args) => {
        try
        {
            if (!message.guild.me.voice.channel) return message.channel.send(`The bot doesn't join any voice channel!`);
            client.distube.voices.leave(message.guild);
            message.react('👋');
        }
        catch (err)
        {
            writeLog(err);
        }
    }
};
