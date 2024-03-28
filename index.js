const {
    on
} = require('events');
const express = require('express');
const http = require('http');
const {
    disconnect
} = require('process');
const socketio = require('socket.io');
const fs = require('fs-extra');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
var userList = [];
var messageHistory = [];
app.use(express.static("public"));
app.set('views', './view');
const port = 3000;
// try {
//     messageHistory = fs.readJsonSync('./message.json');
//     // userList = fs.readJsonSync('./userList.json');
// } catch (error) {
//     console.error('Error while reading JSON file:', error);
// }
io.on('connection', (socket) => {
    socket.on('userInfo', data => {
        if (userList.indexOf(data) >= 0) {
            socket.emit('loginFail');
        } else {
            console.log("Socket userInfo", data);
            userList.push(data);
            socket.username = data;
            socket.emit("loginSuccess", data)
            io.emit('users', userList)
        }
    })
    socket.on('chatMessage', data => {

        var message = {
            room: socket.room,
            username: socket.username,
            msg: data.msg
        }
        if (socket.username && socket.room) {
            console.log("LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL",message)
            messageHistory.push(message);
            if(socket.username == data.username)
            {
                
            }
        }
        console.log(messageHistory);
        io.to(socket.room).emit('sendMessage', message)
    })
    socket.on('createRoom', data => {
        socket.join(data);
        socket.room = data;
        console.log(socket.adapter.rooms);
        var roomList = [];
        for (room of socket.adapter.rooms) {
            roomList.push(room[0])
        }
        console.log('Socket createRoom', data);
        console.log(roomList);
        io.emit('listRoom', roomList);
    })

    socket.on('clickToChat', data => {
        // socket.leave(socket.room);
        console.log("Socket clickToChat", data, socket.room);
        socket.join(data);
        socket.room = data;
        socket.emit('moveToChat', data);
        // io.to(data).emit('sendMessage', messageHistory)

    });

    socket.on('logout', () => {
        userList.splice(
            userList.indexOf(socket.username), 1
        );
        socket.broadcast.emit('users', userList);
        if(socket.username == data.username)
        {
            // fs.writeJsonSync('./message.json',messageHistory)
        }
    })

});

app.get('/', (req, res) => {
    const {
        username
    } = req.query;
    res.sendFile(__dirname + '/views/index.html')
})

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
})