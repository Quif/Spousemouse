var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    port = process.env.PORT || 3000
io.on('connection', (socket) => {
    console.log('connected')
    io.emit('online', 'Someone else connected!')
})
io.on('mouseMovement', function(data){
    console.log("poo")
    io.emit('sentMovement', data)
    io.emit('movementAlert', 'Someone just sent a new mouse movement!')
});
io.on('disconnect', (evt) => {
    console.log('disconnected')
})
server.listen(port, () => console.log(`server listening on port: ${port}`))