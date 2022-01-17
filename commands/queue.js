const { Client, Message } = require("discord.js");
const { writeLog } = require("../logger");

module.exports = {
    name: 'queue',
    description: 'Show all the song list in the queue',
    permission: {
        user: [],
        bot: []
    },
    dev_only: false,
    min_args: 0,
    args: [],
    reqVoice: false,
    aliases: ['q'],
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {String[]} args
     */
    run: async(client, message, args) => {
        try
        {
            let queue = client.distube.getQueue(message);
            if (!queue) return message.channel.send(`The queue is empty!`);
            let qstr = [];
            queue.songs.forEach((s, i) => {
                let str = `${s.name} - ${s.formattedDuration}`;
                if (i == 0) str = `#. ${str}`;
                else str = `${i}. ${str}`;
                qstr.push(str);
            });

            let pos = 1;
            let cur = 1;
            let max = (qstr.length / 10 >> 0) + 1;
            const msg = await message.channel.send(generateMessage(qstr, pos, max, 10));
            if (pos == max) return;
            await msg.react('⬅');
            await msg.react('➡');
            const filter = (reaction, user) => {
                return reaction.emoji.name == "⬅" || reaction.emoji.name == "➡" && user.id == message.author.id;
            }
            const collector = msg.createReactionCollector(filter, {time: 15000});
            collector.on('collect', (reaction, user) => {
                if (reaction.emoji.name == "⬅" ) pos--;
                else if (reaction.emoji.name == "➡") pos++;
                if (pos > max) pos = max;
                else if (pos < 1) pos = 1;

                if (cur == pos) return;
                else
                {
                    msg.edit(generateMessage(qstr, pos, max, 10));
                    cur = pos;
                }
            })
            collector.on('end', (col) => {
                col.delete();
            })
        }
        catch (err)
        {
            writeLog(err);
        }
    }
};

/**
 * @param {Message} message
 * @param {String[]} arr 
 * @param {Number} begin 
 * @param {Number} end 
 */
function generateMessage(arr, pos, max, size)
{
    let fixed = [];
    let begin = (pos - 1) * size;
    let end = pos * size - 1;
    arr.forEach((song, i) => {
        if (i >= begin && i <= end) fixed.push(song);
    });
    return `📜・Server Queue List:\n\`\`\`md\n${fixed.join('\n')}\n\n[page](${pos}/${max})\`\`\``;
}
