const { Client, Message } = require("discord.js");
const { writeLog } = require("../logger");

module.exports = {
    name: 'shutdown',
    description: 'Turn off the bot',
    permission: {
        user: [],
        bot: []
    },
    dev_only: true,
    min_args: 0,
    args: [],
    reqVoice: false,
    aliases: ['shut'],
    /**
     * @param {Client} client 
     * @param {Message} message 
     */
    run: async(client, message) => {
        try
        {
            await message.react('☑️');
            process.exit(0);
        }
        catch (err)
        {
            writeLog(err);
        }
    }
};
