const { Client, Message } = require("discord.js");
const { writeLog } = require("../logger");

module.exports = {
    name: 'messageCreate',
    /**
     * @param {Client} client
     * @param {Message} message
     */
    run: async(client, message) => {        
        try
        {
            if (!message.author.client || !message.guild || message.author == client.user) return;
            if (!message.content.startsWith(client.prefix)) return;

            // checking the avaibility of the command
            let [cmd, ...args] = message.content.slice(client.prefix.length).trim().split(/ +/g)
            let command = client.commands.get(cmd.toLowerCase()) || client.commands.get(client.aliases.get(cmd.toLowerCase()));
            if (!command) return;
            if (command.reqVoice && !message.member.voice.channel) return message.channel.send(`You must join the voice channel first!`);
            if (command.reqVoice && message.guild.me.voice.channel != message.member.voice.channel) return message.channel.send(`You must join the same voice channel first!`);
            if (command.min_args > args.length) return message.channel.send(`Incomplete arguments, please try again!`);
            if (
                command.permission.user.length == 0 ||
                command.permission.bot.length == 0 ||
                message.member.hasPermission(command.permission.user) ||
                message.guild.me.hasPermission(command.permission.bot) ||
                message.author.id == client.dev_id
            )
            {
                if (command.dev_only && message.author.id != client.dev_id) return;
                if (command.dev_only) writeLog(`Warn: Developer command (${command.name}) has been used by ${message.author.tag} (ID: ${message.author.id})!`);
                return command.run(client, message, args);
            }
            else
            {
                // Invalid permission
                let perm = [];
                let missingInfo = `You don't have the following permission`;
                command.permission.user.forEach(p => {
                    if (!message.member.permissions.has(p)) perm.push(`\`${p}\``);
                });
                if (perm.length > 0)
                {
                    missingInfo += `${(perm.length == 1) ? '' : 's'}: ${perm.join(', ')}`;
                    return message.channel.send(missingInfo);
                }

                while (perm.length > 0) { perm.pop(); }
                missingInfo = `I don't have the following permission`;
                command.permission.bot.forEach((p) => {
                    if (!message.guild.me.permissions.has(p)) permBot.push(`\`${p}\``);
                })
                if (permBot.length > 0)
                {
                    missingInfo += `${(permBot.length == 1) ? '' : 's'}: ${permBot.join(', ')}`;
                    return message.channel.send(missingInfo);
                }
            }
        }
        catch (err)
        {
            writeLog(err);
        }
    }
};
