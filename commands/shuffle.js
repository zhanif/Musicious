const { Client, Message } = require("discord.js");
const { writeLog } = require("../logger");

module.exports = {
    name: 'shuffle',
    description: 'Shuffle the queue songs',
    permission: {
        user: [],
        bot: []
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
            client.distube.shuffle(message);
            await message.react('🔀');
        }
        catch (err)
        {
            writeLog(err);
        }
    }
};
