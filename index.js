const {
    on
} = require('events');
const express = require('express');
const http = require('http');
const {
    disconnect
} = require('process');
const socketio = require('socket.io');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/chatApp')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

const messageSchema = new mongoose.Schema({
    room: String,
    username: String,
    message: String,
    timestamp: { type: Date, default: Date.now }
});
const roomSchema = new mongoose.Schema({
    room: String
});
const Rooms = mongoose.model('rooms', roomSchema);
const Messages = mongoose.model('messages', messageSchema);


const app = express();
const server = http.createServer(app);
const io = socketio(server);

var userList = [];


app.use(express.static("public"));
app.set('views', './view');
const port = 3000;


io.on('connection', async (socket) => {
    socket.on('userInfo', async data => {
        if (userList.indexOf(data) >= 0) {
            socket.emit('loginFail');
        } else {
            console.log("Socket userInfo", data);
            userList.push(data);
            const roomCreated = await Rooms.find();
            var infoData = {
                users: userList,
                roomList: roomCreated
            }
            socket.username = data;
            socket.emit("loginSuccess", data)
            io.emit('users', infoData)
        }
    })
    socket.on('chatMessage', async data => {
        console.log(data.msg);
        var message = {
            room: socket.room,
            username: socket.username,
            message: data.msg
        }
        if (socket.username && socket.room) {
            if (socket.username == data.username) {
                const newMessage = new Messages(message);
                await newMessage.save();
            }
        }
        io.to(socket.room).emit('sendMessage', message)
    })
    socket.on('createRoom', async data => {
        const newRoom = new Rooms({room: data});
        await newRoom.save();
        console.log('Socket createRoom: ', data);
        const roomCreated = await Rooms.find(); 
        io.emit('listRoom', roomCreated);
    })
    socket.on('clickToChatUser', async data =>{
        var nameArr = [data.a, data.b].sort();
        var roomId = nameArr[0]+nameArr[1];
        console.log(roomId);
        socket.join(roomId);
        socket.room = roomId;
        const messagesInRoom = await Messages.find({ room: roomId });
        console.log(messagesInRoom);
        var oldMessages = {
            roomName: data.b,
            // type: user,
            messages: messagesInRoom
        }
        socket.emit('moveToChat', oldMessages);
    })
    socket.on('clickToChatRoom', async data => {
        // socket.leave(socket.room);
        console.log("Socket clickToChat", data, socket.room);
        socket.join(data);
        socket.room = data;
        const messagesInRoom = await Messages.find({ room: data });
        console.log(messagesInRoom);
        var oldMessages = {
            roomName: data,
            // type: room,
            messages: messagesInRoom
        }
        socket.emit('moveToChat', oldMessages);
        // io.to(data).emit('sendMessage', messageHistory)

    });

    socket.on('logout', () => {
        userList.splice(
            userList.indexOf(socket.username), 1
        );
        socket.broadcast.emit('users', userList);

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