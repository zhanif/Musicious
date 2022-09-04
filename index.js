require('dotenv').config()
const {Client, Collection, GatewayIntentBits, Options, Partials} = require('discord.js')
const fs = require('fs')
const mongoose = require('mongoose')
const dfs = require('dropbox-fs')({
    apiKey: process.env.DROPBOX_TOKEN
})

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent,
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.User,
        Partials.Reaction,
    ],
    makeCache: Options.cacheWithLimits({
        BaseGuildEmojiManager: 0,
        GuildBanManager: 0,
        GuildInviteManager: 0,
        GuildStickerManager: 0,
        GuildEmojiManager: 0,
        GuildScheduledEventManager: 0,
        PresenceManager: 0,
        StageInstanceManager: 0,
        ThreadManager: 0,
        ThreadMemberManager: 0,
    })
})

client.events = new Collection()
client.commands = new Collection()
client.aliases = new Collection()
client.prefix = process.env.BOT_PREFIX

client.writeLog = (msg) => {
    return console.log(msg)
    function getOutputTime() {
        let options = {
            timeZone: 'Asia/Jakarta',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: 'numeric',
            hourCycle: 'h23',
        }
        const formatter = new Intl.DateTimeFormat([], options)
        const strtime = formatter.format(new Date())
        
        let month = strtime[0] + strtime[1]
        let day = strtime[3] + strtime[4]
        let year = strtime[6] + strtime[7] + strtime[8] + strtime[9]
        let hours = strtime[12] + strtime[13]
        let minutes = strtime[15] + strtime[16]
        let seconds = strtime[18] + strtime[19]
        return `[${month}/${day}/${year} ${hours}:${minutes}:${seconds}] `
    }

    let time = getOutputTime()
    dfs.readFile('/Musicious/log.txt', {encoding: 'utf8'}, (err, res) => {
        let content = ''
        if (err) content = `${time} ${msg}`
        else content = `${res}\n${time} ${msg}`
        // dfs.write('/Musicious/log.txt', content, {encoding: 'utf8'}, (err, stat) => {
        //     if (err) console.log(`Error: ${err}`)
        // })
    })
}

client.loadEvents = () => {
    console.log(`[INFO] Mounting events ...`)
    const files = fs.readdirSync('./events').filter(f => f.endsWith('.js'))
    for (let file of files) {
        const event = require(`./events/${file}`)
        if (event.once) client.once(event.name, event.run.bind(undefined, client))
        else client.on(event.name, event.run.bind(undefined, client))
        console.log(`[INFO] Event ready: ${event.name}`)
    }
}
client.loadCommands = () => {
    console.log(`[INFO] Mounting commands ...`)
    const files = fs.readdirSync(`./commands`).filter(f => f.endsWith('.js'))
    files.forEach(file => {
        const command = require(`./commands/${file}`)
        client.commands.set(command.name, command)
        if (command.aliases) command.aliases.forEach(alias => client.aliases.set(alias, command.name))
        console.log(`[INFO] Command ready: ${file}`)
    })
}

client.rest.on('rateLimited', async msg => {
    client.writeLog(msg)
})

process.on('unhandledRejection', (reason, promise) => {
    client.writeLog(reason)
})
  
process.on('uncaughtException', (err, origin) => {
    client.writeLog(err)
})
  
process.on('uncaughtExceptionMonitor', (err, origin) => {
    client.writeLog(err)
})

mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_ADDRESS}/${process.env.DB_NAME}?retryWrites=true&w=majority`, {})
.then(() => {
    console.log(`[INFO] Successfully connected into the database!`)
})
.catch((err) => {
    console.log(`[ERROR] Unable to connect to the database! ${err}`)
})

client.loadEvents()
client.loadCommands()
client.login(process.env.BOT_TOKEN)