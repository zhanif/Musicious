require('dotenv').config()
const { Client, Collection, MessageActionRow, MessageButton } = require('discord.js')
const { DisTube } = require('distube')
const { SpotifyPlugin } = require('@distube/spotify')
const { SoundCloudPlugin } = require('@distube/soundcloud')
const { keepAlive } = require('./server')
const fs = require('fs')
const { writeLog } = require('./logger')

const client = new Client({
    intents: 32767
})
client.commands = new Collection()
client.aliases = new Collection()
client.prefix = process.env.PREFIX
client.token = process.env.TOKEN
client.dev_id = process.env.DEV_ID
client.dev_guild = process.env.DEV_GUILD
client.dev_channel = process.env.DEV_CHANNEL
client.distube = new DisTube(client, {
    leaveOnStop: false,
    leaveOnEmpty: true,
    emptyCooldown: 180, // 3 minutes of inactivity
    emitNewSongOnly: true,
    youtubeDL: false,
    updateYouTubeDL: false,
    youtubeCookie: process.env.YTCOOKIE,
    plugins: [new SpotifyPlugin(), new SoundCloudPlugin()]
})
client.cacheServer = new Map()

loadEvents = () => {
    console.log(`Info: Loading event files ...`)
    const eventFiles = fs.readdirSync('./events').filter(f => f.endsWith('.js'))
    for (const eventFile of eventFiles)
    {
        const event = require(`./events/${eventFile}`)
        if (event.once) client.once(event.name, event.run.bind(undefined, client))
        else client.on(event.name, event.run.bind(undefined, client))
        console.log(`Info: Event ready: ${event.name}`)
    }
}
loadCommands = () => {
    console.log(`Info: Loading command files ...`)
    const commandFiles = fs.readdirSync(`./commands`).filter(f => f.endsWith('.js'))
    for (const commandFile of commandFiles)
    {
        const command = require(`./commands/${commandFile}`)
        client.commands.set(command.name, command)
        if (command.aliases) command.aliases.forEach(alias => client.aliases.set(alias, command.name))
        console.log(`Info: Command ready: ${commandFile}`)
    }
}
loadEvents()
loadCommands()

client.flushCache = async (queue, serverId) => {
    try {
        if (!queue) {
            queue = {
                id: serverId
            }
        }
        let channelid = client.cacheServer.get(queue.id)[0]
        let msgid = client.cacheServer.get(queue.id)[1]
        let findMsg = await client.guilds.cache.get(queue.id).channels.fetch(channelid)
        findMsg.messages.fetch(msgid).then(m => {
            m.edit({content: m.content, components: []})
            client.cacheServer.delete(queue.id)
        })
        .catch(err => {})
    } catch (err) {
        // console.log(err)
    }
}

client.distube
    .on('playSong', async (queue, song) => {
        try
        {
            client.flushCache(queue, queue.id)
            let idx = [0, 0, 0, 0, 0]

            const row = makeButtons(idx)
            let content = `🎶・\`${song.name}\` - ${song.formattedDuration}`
            let emsg = await queue.textChannel.send({content: content, components: [row]})
            const collector = queue.textChannel.createMessageComponentCollector({
                componentType: 'BUTTON'
            })

            client.cacheServer.set(queue.id, [emsg.channelId, emsg.id])

            collector.on('collect', async collected => {
                if (
                    collected.customId == 'play'
                    || collected.customId == 'pause'
                    || collected.customId == 'repeat_off'
                    || collected.customId == 'repeat_one'
                    || collected.customId == 'repeat'
                    || collected.customId == 'stop'
                ) {
                    await collected.deferUpdate()
                    if (collected.customId == 'play')
                    {
                        idx[2] = 1
                        queue.pause()
                    }
                    else if (collected.customId == 'pause')
                    {
                        idx[2] = 0
                        queue.resume()
                    }
                    else if (collected.customId == 'repeat_off') {
                        idx[1] = 1
                        queue.setRepeatMode(1)
                    }
                    else if (collected.customId == 'repeat') {
                        idx[1] = 2
                        queue.setRepeatMode(2)
                    }
                    else if (collected.customId == 'repeat_one') {
                        idx[1] = 0
                        queue.setRepeatMode(0)
                    }
                    else if (collected.customId == 'stop')
                    {
                        idx[3] = 1
                        queue.stop()
                    }
                    let rechannelid = client.cacheServer.get(queue.id)[0]
                    let remsgid = client.cacheServer.get(queue.id)[1]
                    let refindMsg = await client.guilds.cache.get(queue.id).channels.fetch(rechannelid)
                    refindMsg.messages.fetch(remsgid).then(m => {
                        m.edit({content: content, components: [makeButtons(idx)]})
                    })
                }
                else if (collected.customId == 'prev')
                {
                    await collected.deferReply({ephemeral: true})
                    if (!queue) return collected.editReply(`The queue is empty!`)
                    if (queue.previousSongs.length == 0) return collected.editReply(`No previous song found!`)
                    await collector.stop()
                    await queue.previous()
                }
                else if (collected.customId == 'next')
                {
                    if (!queue) return collected.editReply(`The queue is empty!`)
                    if (queue.songs.length - 1 <= 0) return collected.editReply(`No next song found!`)
                    await collector.stop()
                    await queue.skip()
                }
                else if (collected.customId == 'leave')
                {
                    await client.distube.voices.leave(emsg.guild)
                    await collector.stop()
                }
                
            })

            collector.on('end', async collected => {
                await emsg.edit({content: emsg.content, components: []}).catch(err => {})
            })
        }
        catch (err)
        {
            writeLog(err)
        }
    })
    .on('addList', (queue, playlist) => {
        queue.textChannel.send({content: `🔥・Playlist \`${playlist.name}\` has been loaded`}).catch(() => {})
    })
    .on('searchNoResult', (message, query) => {
        message.channel.send({content: `🔎・No result found`}).catch(() => {})
    })
    .on('error', (channel, err) => {
        channel.send('\`\`\`diff\n- Error:\n' + err.message.replace('`', '') + '\n\`\`\`').catch(() => {})
        writeLog(err)
    })

function makeButtons(idx) {
    let btn_prev = [{value: 'prev', emoji: '⏮', style: 'SECONDARY'}]
    let btn_repeat = [{value:'repeat_off', emoji: '🔁', style:'SECONDARY'}, {value: 'repeat', emoji: '🔁', style:'SUCCESS'}, {value: 'repeat_one', emoji: '🔂', style:'SUCCESS'}]
    let btn_play = [{value: 'play', emoji: '⏸', style:'SECONDARY'}, {value: 'pause', emoji: '▶', style:'PRIMARY'}]
    let btn_stop = [{value: 'stop', emoji: '⏹', style:'SECONDARY'}, {value: 'leave', emoji: '👋', style:'DANGER'}]
    let btn_next = [{value: 'next', emoji: '⏭', style: 'SECONDARY'}]

    let isDisable = false
    if (idx[3] == 1) isDisable = true

    return new MessageActionRow()
    .addComponents(
        new MessageButton()
        .setStyle(btn_prev[idx[0]].style)
        .setCustomId(btn_prev[idx[0]].value)
        .setEmoji(btn_prev[idx[0]].emoji)
        .setDisabled(isDisable),
        new MessageButton()
        .setStyle(btn_repeat[idx[1]].style)
        .setCustomId(btn_repeat[idx[1]].value)
        .setEmoji(btn_repeat[idx[1]].emoji),
        new MessageButton()
        .setStyle(btn_play[idx[2]].style)
        .setCustomId(btn_play[idx[2]].value)
        .setEmoji(btn_play[idx[2]].emoji)
        .setDisabled(isDisable),
        new MessageButton()
        .setStyle(btn_stop[idx[3]].style)
        .setCustomId(btn_stop[idx[3]].value)
        .setEmoji(btn_stop[idx[3]].emoji),
        new MessageButton()
        .setStyle(btn_next[idx[4]].style)
        .setCustomId(btn_next[idx[4]].value)
        .setEmoji(btn_next[idx[4]].emoji)
        .setDisabled(isDisable)
    )
}

client.login(client.token)
keepAlive()