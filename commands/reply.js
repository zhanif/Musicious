const { Client, Message, MessageEmbed } = require("discord.js");

module.exports = {
    name: 'reply',
    description: 'Reply to the report message',
    permission: {
        user: [],
        bot: []
    },
    dev_only: true,
    min_args: 2,
    args: ['<id>', '<message>'],
    reqVoice: false,
    aliases: [],
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {String[]} args
     */
    run: async(client, message, args) => {
        try
        {
            let msgid = args.shift();
            let mesg = args.join(' ');
            let msg = await client.guilds.cache.get(client.dev_guild).channels.cache.get(client.dev_channel).messages.fetch(msgid);
            let embedId = msg.embeds[0];
            const embed = new MessageEmbed()
            .setDescription(embedId.description)
            .setAuthor(embedId.author)
            .setFooter(embedId.footer)
            .setColor(3338095)
            .addField(`Response`, mesg)
            .setImage(`https://i.stack.imgur.com/Fzh0w.png`);
            await client.guilds.cache.get(client.dev_guild).channels.cache.get(client.dev_channel).messages.cache.get(msgid).edit({embeds: [embed]})
            await message.react('☑️');
            // let authorId = embed.author.name.split('(#')[1];
            // authorId = authorId.substring(0, authorId.length - 1);
            // let repTarget = await client.users.fetch(authorId);
            // repTarget.send(`📬・Your report has been responded!\n\`\`\`${mesg}\n\`\`\``);
        }
        catch (err)
        {
            console.log(`Error: ${err}`);            
        }
    }
};
