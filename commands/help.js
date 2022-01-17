const { Client, Message } = require("discord.js");
const { writeLog } = require("../logger");

module.exports = {
    name: 'help',
    description: 'Show all commands',
    permission: {
        user: [],
        bot: []
    },
    dev_only: false,
    min_args: 0,
    args: ['[command]'],
    reqVoice: false,
    aliases: ['h'],
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {String[]} args
     */
    run: async(client, message, args) => {
        try
        {
            let cmdList = [];
            let cmdName = [];
            client.commands.forEach(c => {
                if (!c.dev_only)
                {
                    cmdList.push({name: c.name, description: c.description, aliases: c.aliases, args: c.args});
                    cmdName.push(c.name);
                }
            });

            if (args.length == 0) return message.channel.send(`📜・Command List:\n\`\`\`md\n# Type ${client.prefix}help <command> to see the command info!\n${cmdName.join(', ')}\n\`\`\``);
            cmdList.forEach(c => {
                if (c.name == args.join(' ').toLowerCase())
                {
                    if (c.aliases.length > 0) c.aliases.forEach(a => a = `.${a}`);
                    return message.channel.send(`🔍・Information about \`${client.prefix}${c.name}\`\n\`\`\`md\n# ${c.description}\n* Usage: ${client.prefix}${c.name} ${c.args.join(' ')}\n* Aliases: ${(c.aliases.length == 0)? '-' : c.aliases.join(', ')}\n\`\`\``);
                }
            });
        }
        catch (err)
        {
            writeLog(err);
        }
    }
};
