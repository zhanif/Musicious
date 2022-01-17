const { Client } = require("discord.js");

module.exports = {
    name: 'error',
    /**
     * @param {Client} client
     */
    run: async(client, error) => {
        return console.log(`Error: ${error}`);
    }
};
