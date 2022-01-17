const { Client, Message, MessageEmbed } = require("discord.js");

module.exports = {
    name: 'report',
    description: 'send a report to the developer',
    permission: {
        user: [],
        bot: []
    },
    dev_only: false,
    min_args: 1,
    args: ['<message>'],
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
            let legitUser = await client.guilds.cache.get(client.dev_guild).bans.fetch({user: message.member.user}).catch(() => {});
            if (legitUser) return message.channel.send(`You're not permitted to send the report!`);

            const opt = {
                hourCycle: 'h23', hour: '2-digit', minute: '2-digit', second: '2-digit',
            };
            const formatDate = new Intl.DateTimeFormat('en-US', {
                timeZone: `Asia/Jakarta`, ...opt
            });
            const date = new Date();
            const dateNew = formatDate.format(date);

            const embed = new MessageEmbed()
            .setDescription(args.join(' '))
            .setAuthor({name: `${message.author.tag} (#${message.author.id})`, iconURL: message.author.avatarURL()})
            .setFooter({text: `${dateNew}・🏰 ${message.guild.name}・#${message.channel.name}`})
            .setColor(16722731)
            .setImage(`https://i.stack.imgur.com/Fzh0w.png`)
            client.guilds.cache.get(client.dev_guild).channels.cache.get(client.dev_channel).send({embeds: [embed]}).then(() =>{
                message.channel.send(`📫・Your report has been sent, visit: https://discord.gg/UDSSGat9Kj to view your report!`);
            });
        }
        catch (err)
        {
            console.log(`Error: ${err}`);            
        }
    }
};