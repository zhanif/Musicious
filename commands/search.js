const { Client, Message } = require("discord.js");

module.exports = {
    name: 'search',
    description: 'Search the songs',
    permission: {
        user: [],
        bot: ['CONNECT', 'SPEAK']
    },
    dev_only: false,
    min_args: 1,
    args: ['<song>'],
    reqVoice: true,
    aliases: [],
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {String[]} args
     */
    run: async(client, message, args) => {
        try
        {
            let searchRes = await client.distube.search(args.join(' '), {
                limit: 10,
                type: 'video',
                safeSearch: true,
            }).catch(() => {});
            if (!searchRes) return message.channel.send(`No result found!`);
            let resStr = [];
            searchRes.forEach((s, i) => {
                resStr.push(`${(i + 1)}. ${s.name} - ${s.formattedDuration}`);
            });

            const msg = await message.channel.send(`🔍・Search Result:\n\`\`\`md\n#. Showing ${resStr.length} songs...\n0. Cancel\n${resStr.join('\n')}\n\n[Type a number](1-${resStr.length} | 0)\n\`\`\``);
            const filter = (m) => {
                return !isNaN(Number(m.content)) && Number(m.content) >= 0 && Number(m.content) <= searchRes.length;
            }
            await msg.react('⏳');
            const collector = message.channel.createMessageCollector({filter, time: 15_000});
            collector.on('collect', m => {
                let pos = Number(m.content) - 1;
                if (pos >= 0)
                {
                    client.distube.play(message.member.voice.channel, searchRes[pos].url, {
                        member: message.member,
                        textChannel: message.channel,
                        message
                    });
                }
                m.react('☑️');
                collector.stop();
            })
            collector.on('end', m => {
                msg.reactions.removeAll();
                msg.edit(`🔍・Search Result:\n\`\`\`md\n#. Showing ${resStr.length} songs...\n${resStr.join('\n')}\n\`\`\``);
            })
        }
        catch (err)
        {
            console.log(`Error: ${err}`);
        }
    }
};
