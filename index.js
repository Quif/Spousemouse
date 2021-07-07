const express = require('express');

var port = process.env.PORT || 3000
const app = express()
const server = app.listen(port, () => console.log(`server listening on port: ${port}`))

const io = require('socket.io')(server)
io.on('connection', (socket) => {
    console.log('New connection!')
    socket.on('mouseMovement', function(data){
        socket.broadcast.emit('mouseMovement', data)
        socket.broadcast.emit('movementAlert')
        console.log("New mouse movement!")
    });
    socket.on('wave', function(){
        socket.broadcast.emit('wave')
    })
    socket.on('disconnected', (evt) => {
        console.log('disconnected')
    })
    socket.broadcast.emit('online')
})