const { Client } = require("discord.js");
const { writeLog } = require("../logger");

module.exports = {
    name: 'error',
    /**
     * @param {Client} client
     */
    run: async(client, error) => {
        writeLog(error);
    }
};
