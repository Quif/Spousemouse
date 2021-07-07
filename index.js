const http = require('http').createServer();
const io = require('socket.io')(http);
const port = process.env.PORT || 3000
io.on('connection', (socket) => {
    console.log('connected')
    io.emit('online', 'Someone else connected!')
    io.emit('port', process.env.PORT || 3000)
})
io.on('mouseMovement', function(data){
    console.log("poo")
    io.emit('sentMovement', data)
    io.emit('movementAlert', 'Someone just sent a new mouse movement!')
});
io.on('disconnect', (evt) => {
    console.log('disconnected')
})
http.listen(port, () => console.log(`server listening on port: ${port}`))