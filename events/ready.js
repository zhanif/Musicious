const { Client, ActivityType } = require("discord.js")
const Cooldown = require('../schemas/cooldown')

module.exports = {
    name: 'ready',
    once: true,
    /**
     * @param {Client} client 
     */
    run: async(client) => {
        try
        {
            let guildCount = client.guilds.cache.size
            await client.user.setStatus('online')
            await client.user.setActivity({
                name: `${client.prefix}help | ${guildCount} servers`,
                type: ActivityType.Watching
            })
            await Cooldown.deleteMany({time: {$lt: new Date().getTime() - 60_000}})
            console.log(`[INFO] ${client.user.tag} is online!`)
        }
        catch (err)
        {
            client.writeLog(err)
        }
    }
}
