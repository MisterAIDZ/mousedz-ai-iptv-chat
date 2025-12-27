const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static(path.join(__dirname,'public')));

io.on('connection', socket=>{
    socket.on('join', username=>{socket.username=username;});
    socket.on('message', data=>{io.emit('message', data);});
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, ()=>console.log(`Server running on port ${PORT}`));
