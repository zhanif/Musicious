const { Client, Message, PermissionsBitField } = require("discord.js")
const cooldown = require("../schemas/cooldown")
const Cooldown = require('../schemas/cooldown')

module.exports = {
    name: 'messageCreate',
    /**
     * @param {Client} client
     * @param {Message} message
     */
    run: async(client, message) => {        
        try
        {
            if (!message.author.client || !message.guild || message.author == client.user) return
            if (!message.content.startsWith(client.prefix)) return

            // checking the avaibility of the command
            let [cmd, ...args] = message.content.slice(client.prefix.length).trim().split(/ +/g)
            let command = client.commands.get(cmd.toLowerCase()) || client.commands.get(client.aliases.get(cmd.toLowerCase()))
            if (!command) return
            
            if (command.cooldown) {
                let check = await Cooldown.findOne({id: message.author.id, time: {$gt: new Date().getTime() - command.cooldown}})
                if (check) {
                    if (!check.alert) await Cooldown.findOneAndUpdate({id_user: message.author.id}, {alert: true}, {upsert:true})
                    return message.channel.send(`⌛・A bit slower, you're in cooldown...`)
                }
                console.log(`[INFO] cooldown is applied for user ${message.author.tag} [${message.author.id}]`)
                await Cooldown.findOneAndUpdate({id_user: message.author.id}, {id_user: message.author.id, time: new Date().getTime()}, {upsert:true})
            }

            if (command.reqVoice && !message.member.voice.channel) return message.channel.send(`⛔・You must join the voice channel first!`)
            if (command.reqVoice && message.guild.members.me.voice.channel && message.guild.members.me.voice.channel != message.member.voice.channel) return message.channel.send(`⛔・You must join the same voice channel first!`)
            if (command.min_args > args.length) return message.channel.send(`⛔・Too few arguments, (expected \`${command.min_args}\` but got \`${args.length}\`)`)

            if (command.permission.user.length > 0 || command.permission.bot.length > 0)
            {
                const checkUser = new Promise((resolve, reject) => {
                    let error = []
                    let userPerm = message.member.permissions
                    let cmdPerm = command.permission.user
                    for (const p of cmdPerm) {
                        if (!userPerm.has(p)) error.push(p)
                        console.log("P: " + p)
                    }
                    if (error.length > 0) reject({type: "user", data: error})
                    else resolve("user")
                })
    
                const checkBot = new Promise((resolve, reject) => {
                    let error = []
                    let botPerm = message.guild.members.me.permissions
                    let cmdPerm = command.permission.bot
                    for (const p of cmdPerm) {
                        if (!botPerm.has(p)) error.push(p)
                    }
                    if (error.length > 0) reject({type: "bot", data: error})
                    else resolve("bot")
                })

                Promise.all([checkUser, checkBot]).catch(err => {
                    if (err) {
                        if (err.type == 'bot') {
                            return message.channel.send(`⛔・I don't have the following permission${err.data.length > 1? 's' : ''}: \`${new PermissionsBitField(err.data).toArray().join(', ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(', ', '\`, \`')}\``)
                        }
                        else if (err.type == 'client') {
                            return message.channel.send(`⛔・You don't have the following permission${err.data.length > 1? 's' : ''}: \`${new PermissionsBitField(err.data).toArray().join(', ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(', ', '\`, \`')}\``)
                        }
                    }
                })
            }
            if (command.dev_only && message.author.id != client.dev_id) return
            if (command.dev_only) client.writeLog(`Developer command ${command.name} has been used by ${message.author.tag} [${message.author.id}] in ${message.guild.name.toUpperCase()} > ${message.channel.name} [${message.guildId}|${message.channelId}]`)

            return command.run(client, message, args)
        }
        catch (err)
        {
            client.writeLog(err)
        }
    }
}
