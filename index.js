require('dotenv').config();
const { Client, Collection } = require('discord.js');
const { DisTube } = require('distube');
const { SpotifyPlugin } = require('@distube/spotify');
const { SoundCloudPlugin } = require('@distube/soundcloud');
const { keepAlive } = require('./server');
const fs = require('fs');
const { writeLog } = require('./logger');

const client = new Client({
    intents: 32767
});
client.commands = new Collection();
client.aliases = new Collection();
client.prefix = process.env.PREFIX;
client.token = process.env.TOKEN;
client.dev_id = process.env.DEV_ID;
client.dev_guild = process.env.DEV_GUILD;
client.dev_channel = process.env.DEV_CHANNEL;
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

loadEvents = () => {
    console.log(`Info: Loading event files ...`);
    const eventFiles = fs.readdirSync('./events').filter(f => f.endsWith('.js'));
    for (const eventFile of eventFiles)
    {
        const event = require(`./events/${eventFile}`);
        if (event.once) client.once(event.name, event.run.bind(undefined, client));
        else client.on(event.name, event.run.bind(undefined, client));
        console.log(`Info: Event ready: ${event.name}`);
    }
};
loadCommands = () => {
    console.log(`Info: Loading command files ...`);
    const commandFiles = fs.readdirSync(`./commands`).filter(f => f.endsWith('.js'));
    for (const commandFile of commandFiles)
    {
        const command = require(`./commands/${commandFile}`);
        client.commands.set(command.name, command);
        if (command.aliases) command.aliases.forEach(alias => client.aliases.set(alias, command.name));
        console.log(`Info: Command ready: ${commandFile}`);
    }
};
loadEvents();
loadCommands();

client.distube
    .on('playSong', (queue, song) => {
        queue.textChannel.send(`🎶・\`${song.name}\` - ${song.formattedDuration}`);
    })
    .on('addList', (queue, playlist) => {
        queue.textChannel.send(`🔥・ Playlist has been loaded!`);
    })
    .on('searchNoResult', (message, query) => {
        message.channel.send(`🔎・ No result found!`);
    })
    .on('error', (channel, err) => {
        channel.send('\`\`\`diff\n- Error:\n' + err.message.replace('`', '') + '\n\`\`\`');
        writeLog(err);
    })

client.login(client.token);
keepAlive();
