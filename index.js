const http = require('http').createServer();
const io = require('socket.io')(http);
const port = 3000
io.on('connection', (socket) => {
    log('connected')
})
io.on('disconnect', (evt) => {
    log('disconnected')
})
http.listen(port, () => console.log(`server listening on port: ${port}`))