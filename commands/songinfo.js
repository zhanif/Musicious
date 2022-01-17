const { Client, Message } = require("discord.js");
const { writeLog } = require("../logger");

module.exports = {
    name: 'songinfo',
    description: 'Show the information about the playing song',
    permission: {
        user: [],
        bot: []
    },
    dev_only: false,
    min_args: 0,
    args: [],
    reqVoice: false,
    aliases: ['song', 'si'],
    /**
     * @param {Client} client 
     * @param {Message} message 
     */
    run: async(client, message) => {
        try
        {
            let queue = client.distube.getQueue(message);
            if (!queue || !queue.playing) return message.channel.send(`Nothing is played!`);
            let s = queue.songs[0];
            return message.channel.send(`🎵・Current Song:\n\`\`\`md\n# ${s.name}\n* Duration: ${s.formattedDuration}\n* ${(s.playlist)? `Playlist: ${s.playlist.name} (${s.source})\n* ` : ''}Song URL: \`${s.url}\`\n* Requested by: ${s.user.tag} (ID: ${s.user.id})\`\`\``);
        }   
        catch (err)
        {
            writeLog(err);
        }
    }
};
