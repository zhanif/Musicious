require('dotenv').config()
const { Client, Collection } = require('discord.js')
const fs = require('fs')
const dropbox = require('dropbox-fs')({
    apiKey: process.env.DROPBOX_TOKEN
})

module.exports = class Bot extends Client {
    
    isDebug = process.env.DEBUG
    prefix = process.env.BOT_PREFIX
    aliases = new Collection()
    commands = new Collection()
    events = new Collection()

    constructor() {
        super({
            intents: 32767
        })
    }

    async loadEvents() {
        this.print(`Loading events...`)
        const eventFiles = fs.readdirSync(`./events`).filter(f => f.endsWith('.js'))
        for (const eventFile of eventFiles)
        {
            const event = require(`./events/${eventFile}`)
            if (event.once) this.once(event.name, event.run.bind(undefined, this))
            else this.on(event.name, event.run.bind(undefined, this))
            this.print(`Event ready: ${event.name}`)
        }
    }

    async loadCommands() {
        this.print(`Loading commands...`)
        const commandFiles = fs.readdirSync(`./commands`).filter(f => f.endsWith('.js'))
        for (const commandFile of commandFiles)
        {
            const command = require(`./commands/${commandFile}`)
            this.commands.set(command.name, command)
            if (command.aliases) command.aliases.forEach(alias => this.aliases.set(alias, command.name))
            this.print(`Command ready: ${commandFile}`)
        }
    }

    getLogTime() {
        let options = {
            timeZone: 'Asia/Jakarta',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: 'numeric',
        }
        const formatter = new Intl.DateTimeFormat([], options)
        const strtime = formatter.format(new Date())
        return `[${strtime[3] + strtime[4]}/${strtime[0] + strtime[1]}/${strtime[6] + strtime[7] + strtime[8] + strtime[9]} ${strtime[12] + strtime[13]}:${strtime[15] + strtime[16]}:${strtime[18] + strtime[19]}]`
    }

    async print(message, status = 'INFO') {
        if (status == 'ERROR') status = `\u001b[1;31m${status}\u001b[0m`
        else if (status == 'INFO') status = `\u001b[1;34m${status}\u001b[0m`
        console.log(`[${status}] ${message}`)
    }

    /**
     * @param {String} message 
     */
    async writeLog(message) {
        let logTime = this.getLogTime()
        if (this.isDebug) {
            console.log(`${logTime} ${message}`);
        }
        else {
            dropbox.readFile('/Musicious/log.txt', {encoding: 'utf-8'}, (error, result) => {
                let content = `${result} ${logTime}`
                if (error) content = `${logTime} ${message}`
                dropbox.writeFile('/Musicious/log.txt', content, {encoding: 'utf8'}, (error2, status) => {
                    if (error2) this.print(error2, 'ERROR')
                })
            })
        }
    }
}