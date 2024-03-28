var socket = io();
var username;
var yourName;
const container = document.querySelector('.container');
const login = document.querySelector('.login');
const loginForm = document.querySelector('#login-form');
const logoutForm = document.querySelector('#logout-form');
const createRoomForm = document.querySelector("#create-room")
const chatUsers = document.querySelector('.list')
const chatForm = document.querySelector('.send-area');

let roomName
chatUsers.addEventListener('click', (e)=>{
    if(e.target && e.target.classList.contains('user')){
        var users = document.querySelectorAll('.user')
        users.forEach(u =>{
            u.classList.remove('active')
        })
        e.target.classList.add('active')
        var name = e.target.textContent;
        console.log(name);
        socket.emit('clickToChat', name);
    }
})
socket.on('moveToChat', data=>{
    createChatBox(data);
})
loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const inputValue = e.target.username.value;
    console.log(inputValue);
    username = inputValue;
    socket.emit('userInfo', inputValue)
});

logoutForm.addEventListener('submit', function (e) {
    e.preventDefault();
    socket.emit('logout');
    container.style.display = 'none'
    login.style.display = 'block'
})

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = e.target.elements.msg.value;
    if (msg != '') {
        socket.emit('chatMessage',{username: yourName ,msg: msg});
    }
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
})

createRoomForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const roomName = e.target.roomName.value;
    if(roomName)
    {
        socket.emit('createRoom', roomName);
    }
    e.target.roomName.value =''
})

socket.on('sendMessage', data => {
    outputMessage(data);
    scrollToBottom()
})
socket.on('loginFail', () => {
    alert("Login failed")
})

socket.on("loginSuccess", data => {
    yourName = data;
    addYou(data);
    container.style.display = 'flex'
    login.style.display = 'none'
})
socket.on('users', (users) => {
    console.log(socket.username);
    console.log(userList);
    console.log(1);
    renderUserList(users)
})
socket.on('listRoom',roomList=>{
    console.log(roomList);
    renderRoomList(roomList)
})
function createChatBox(userName) {
    var chatArea = document.querySelector('.chat-area');
    var titleChat = document.querySelector('.title-chat');
    var msgArea = document.querySelector('.msg-area');
    titleChat.textContent = userName;
    msgArea.innerHTML = '';
}

function scrollToBottom() {
    var chatArea = document.querySelector('.msg-area');
    chatArea.scrollTop = chatArea.scrollHeight;
}

function outputMessage(message) {

    var chatArea = document.querySelector('.msg-area')
    var side = (yourName === message.username) ? 'you' : 'away';
    var messageEle;
    if (side == 'away') {
        messageEle =
            `<ul class="user-chat away">
        <h3 class="user-name">${message.username}</h3>
        <li class="message">
        ${message.msg}
        </li>
    </ul>`
    } else {
        messageEle =
            `<ul class="user-chat you">
            <h3 class="user-name">${message.username}</h3>
        <li class="message">
        ${message.msg}
        </li>
    </ul>`
    }
    chatArea.innerHTML += messageEle;
}

function addYou(user) {
    var you = document.querySelector('.you')
    you.innerHTML = `👩🏻‍💻 ${user} `
}
var userList = document.querySelector('.user-list');
const userActive = document.querySelectorAll('.user');
console.log(userActive);

function renderUserList(userList) {
    let userListElement = document.querySelector('.online');
    userListElement.innerHTML = ""

    userList.forEach(user => {
        var userOnline = `<li class="user">${user}</li>`;
        userListElement.innerHTML += userOnline;
    });
}
function renderRoomList(roomList) {
    let roomListElement = document.querySelector('.room');
    roomListElement.innerHTML = ""

    roomList.forEach(room => {
        var roomOnline = `<li class="user">${room}</li>`;
        roomListElement.innerHTML += roomOnline;
    });
}