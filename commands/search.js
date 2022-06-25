const { Client, Message, MessageActionRow, MessageSelectMenu, MessageEmbed, MessageButton } = require("discord.js")
const { writeLog } = require("../logger")

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
            await message.react('🔍')
            let searchRes = await client.distube.search(args.join(' '), {
                limit: 15,
                type: 'video',
                safeSearch: true,
            }).catch(() => {})
            if (!searchRes) return message.channel.send(`No result found!`)
            let resStr = []
            searchRes.forEach((s, i) => {
                resStr.push({
                    label: s.name,
                    description: `Duration: ${s.formattedDuration} - Uploaded by: ${s.uploader.name}`,
                    value: `${i + 1}`,
                    emoji: `🎵`
                })
            })

            const row = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                .setCustomId('select_song')
                .setPlaceholder(`Select the song`)
                .addOptions(resStr)
            )

            const row2 = new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setCustomId('cancel_button')
                .setLabel('Cancel')
                .setStyle('DANGER')
            )
            const embed = new MessageEmbed()
            .setColor('#202226')
            .setDescription(`⏳ You have 30 seconds to select the song`)

            const msg = await message.channel.send({
                embeds: [embed],
                components: [row, row2]
            })

            const collector1 = message.channel.createMessageComponentCollector({
                componentType: 'BUTTON',
                max: 1,
                time: 30_000
            })

            const collector2 = message.channel.createMessageComponentCollector({
                componentType: 'SELECT_MENU',
                max: 1,
                time: 30_000
            })

            collector1.on('collect', async collected => {
                if (collected.customId == 'cancel_button') {
                    const cancelEmbed = new MessageEmbed()
                    .setColor(`RED`)
                    .setDescription(`❌ You cancelled the search menu`)
                    collected.reply({
                        embeds: [cancelEmbed],
                        ephemeral: true
                    })
                    collector2.stop('success')
                }
            })

            collector2.on('collect', async collected => {
                if (collected.customId == 'select_song') {
                    let value = Number(collected.values[0]) - 1
                    client.distube.play(message.member.voice.channel, searchRes[value].url, {
                        member: message.member,
                        textChannel: message.channel,
                        message
                    })
                    const embed = new MessageEmbed()
                    .setColor('#202226')
                    .setDescription(`☑ [${searchRes[value].name}](${searchRes[value].url})`)
                    collected.reply({
                        embeds: [embed],
                        ephemeral: true
                    })
                    collector1.stop('success')
                }
            })
            
            collector1.on('end', async (m, reason) => {
                setTimeout(() => {
                    msg.delete().catch(() => {})
                }, 5000)
            })

            collector2.on('end', async (m, reason) => {
                setTimeout(() => {
                    msg.delete().catch(() => {})
                }, 5000)
            })
        }
        catch (err)
        {
            writeLog(err)
        }
    }
}
