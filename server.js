const express = require('express')
const server = express()

server.all('/', (req, res) => {
    res.setHeader('Content-type', 'text/html')
    res.write('Musicious')
    res.end()
})

module.exports = {
    keepAlive: () => {
        server.listen(3000, () => {
            console.log('Info: Server is active!')
        })
    }
}