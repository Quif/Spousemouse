const express = require('express');

var port = process.env.PORT || 3000
const app = express()
const server = app.listen(port, () => console.log(`server listening on port: ${port}`))

const io = require('socket.io')(server)
io.on('connection', (socket) => {
    console.log('New connection!')
    socket.on('mouseMovement', function(data){
        io.emit('mouseMovement', data)
        io.emit('movementAlert')
        console.log("New mouse movement!")
    });
    socket.on('wave', function(){
        io.emit('wave')
    })
    socket.on('disconnected', (evt) => {
        console.log('disconnected')
    })
    io.emit('online')
})