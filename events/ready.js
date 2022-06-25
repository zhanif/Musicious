const { Client } = require("discord.js")
const { writeLog } = require("../logger")

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
                name: `${client.prefix}help | ${guildCount} server${guildCount > 1? 's' : ''}`,
                type: 'LISTENING'
            })
            console.log(`Info: ${client.user.tag} is online!`)
        }
        catch (err)
        {
            writeLog(err)
        }
    }
}
