require('dotenv').config()

const dfs = require('dropbox-fs')({
    apiKey: process.env.DROPBOX_TOKEN
})

const DEBUG = false

var utility = module.exports = {
    getOutputTime: () => {
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
        
        let month = strtime[0] + strtime[1]
        let day = strtime[3] + strtime[4]
        let year = strtime[6] + strtime[7] + strtime[8] + strtime[9]
        let hours = strtime[12] + strtime[13]
        let minutes = strtime[15] + strtime[16]
        let seconds = strtime[18] + strtime[19]
        return `[${month}/${day}/${year} ${hours}:${minutes}:${seconds}] `
    },
    writeLog: (toWrite) => {
        if (DEBUG) return console.log(toWrite)
        else
        {
            const logTime = utility.getOutputTime()
            let content = ''
            dfs.readFile(`/Musicious/log.txt`, { encoding: 'utf8'}, (err, res) => {
                if (err) content = `${logTime} ${toWrite}`
                else content = `${res}\n${logTime} ${toWrite}`
                dfs.writeFile(`/Musicious/log.txt`, content, {encoding: 'utf8'}, (err, stat) => {
                    if (err) console.log(`Error: ${err}`)
                })
            })
        }
    },
}
