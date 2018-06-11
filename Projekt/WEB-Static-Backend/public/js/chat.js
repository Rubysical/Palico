// Make connection
var socket = io.connect('http://localhost:3000');

// Query DOM
var message = document.getElementById('message'),
      handle = document.getElementById('handle'),
      btn = document.getElementById('send'),
      output = document.getElementById('output'),
      feedback = document.getElementById('feedback');

//PopUp Fenster
var	PlayBtn = document.getElementById('play'),
    popup = document.getElementById('popup'),
    playerName = document.getElementById('playerName'),
    gameHidden = document.getElementById('gameArea');

    PlayBtn.addEventListener('click', closeWindow);
    openWindow();


// Emit events
btn.addEventListener('click', function(){
    socket.emit('chat', {
        message: message.value,
        handle: handle.value
    });
    message.value = "";
});

message.addEventListener('keypress', function(){
    socket.emit('typing', handle.value);
})

// Listen for events
socket.on('chat', function(data){
    feedback.innerHTML = '';
    output.innerHTML += '<p><strong>' + data.handle + ': </strong>' + data.message + '</p>';
});

socket.on('typing', function(data){
    feedback.innerHTML = '<p><em>' + data + ' is typing a message...</em></p>';
});


//PopUp-Fenster

function openWindow() {
    popup.className = 'overlay';
}

var validCharacters = /[A-Za-z0-9]/;
function closeWindow() {
    if(playerName.value === ""){
        playerName.placeholder='Bitte zuerst Name eingeben';
    }else{
        if (validCharacters.test(playerName.value) !== true){
            playerName.value="";
            playerName.placeholder='Ungültige eingabe. Mit Buchstaben oder Zahlen anfangen!';
        }else{
            handle.value=playerName.value;
            gameHidden.className = 'game';
            popup.className = 'overlayHidden';
        }
    }
}