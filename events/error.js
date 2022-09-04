const { Client } = require("discord.js")

module.exports = {
    name: 'error',
    /**
     * @param {Client} client
     */
    run: async(client, error) => {
        client.writeLog(error)
    }
}
