// Make connection
var socket = io.connect('http://localhost:3000');

var playerNameArray = [];
socket.emit('sendPlayerArray',function(){
});
socket.on('playerArray', function(array){
    playerNameArray=array;
    console.log(playerNameArray);
});

//=================START CHAT=================//
// Query DOM
var message = document.getElementById('message'),
    handle = document.getElementById('handle'),
    buttonSendMessage = document.getElementById('send'),
    output = document.getElementById('output'),
    feedback = document.getElementById('feedback'),
    currentDrawsman = document.getElementById('currentDrawsman'),
    currentPlayerList = document.getElementById('currentPlayerList');

//PopUp Fenster
var	PlayBtn = document.getElementById('play'),
    popup = document.getElementById('popup'),
    playerName = document.getElementById('playerName'),
    gameHidden = document.getElementById('gameArea');

    PlayBtn.addEventListener('click', function(){
        closeWindow();
        
    });
    
    openWindow();

socket.on('connect', function () { 
    // Emit events
    buttonSendMessage.addEventListener('click', function(){
        socket.emit('chat', {
            message: message.value,
            handle: handle.value
        });
        message.value = "";
    });

    message.addEventListener('keypress', function(){
        socket.emit('typing', handle.value);
        
    });

    // Listen for events (client wartet auf methodenaufrufe vom Server)
    /*
    *random client was choosen from the server 
    *this player is the current draftsman
    *the other client can not draw on the whiteboard
    */
    socket.on('draw', function(randomPlayerName){
        if(randomPlayerName==playerName.value){
            playerDraw();
        }
    });

    socket.on('chat', function(data){
        feedback.innerHTML = '';
        output.innerHTML += '<p><strong>' + data.handle + ': </strong>' + data.message + '</p>';
    });

    socket.on('typing', function(data){
        feedback.innerHTML = '<p><em>' + data + ' is typing a message...</em></p>';
    });
    socket.on('drawsman', function(drawsman){
        currentDrawsman.innerHTML = '<h3>Aktuelle Zeichner: </h3>' +'<h2>'+drawsman+'</h2><br>';
    });
    //show the current players on the web site
    socket.on('playerList', function(player){
        currentPlayerList.innerHTML = '<h3>Aktuelle Spieler: </h3>' +'<h2>'+player+'</h2><br>';
    });
});

socket.on('disconnectThatSoc', function(){
    socket.disconnect();
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
            if(playerNameArray.includes(playerName.value)){
                playerName.value=""; 
                playerName.placeholder='Spielername schon vergeben';
            }else{
                socket.emit('NewPlayer', playerName.value);
                handle.value=playerName.value;
                gameHidden.className = 'game';
                popup.className = 'overlayHidden';
            } 
        }
    }
}

//=================FINISH CHAT=================//


//=================START WITHEBOARD=================//

'use strict';

var socket = io();
var canvas = document.getElementsByClassName('whiteboard')[0];
var colors = document.getElementsByClassName('color');
var context = canvas.getContext('2d');
var current = {
    color: 'black'
};
var drawing = false;
function playerDraw(){
    canvas.addEventListener('mousedown', onMouseDown, false);
    canvas.addEventListener('mouseup', onMouseUp, false);
    canvas.addEventListener('mouseout', onMouseUp, false);
    canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);  
   
}

for (var i = 0; i < colors.length; i++){
    colors[i].addEventListener('click', onColorUpdate, false);
}

socket.on('drawing', onDrawingEvent);
window.addEventListener('resize', onResize, false);
onResize();


function drawLine(x0, y0, x1, y1, color, emit){
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.strokeStyle = color;
    context.lineWidth = 2;
    context.stroke();
    context.closePath();
    if (!emit) { return; }
    var w = canvas.width;
    var h = canvas.height;

    socket.emit('drawing', {
        x0: x0 / w,
        y0: y0 / h,
        x1: x1 / w,
        y1: y1 / h,
        color: color
    });
}
function onMouseDown(e){
    drawing = true;
    current.x = e.clientX;
    current.y = e.clientY;
}

function onMouseUp(e){
    if (!drawing) { return; }
    drawing = false;
    drawLine(current.x, current.y, e.clientX, e.clientY, current.color, true);
}
function onMouseMove(e){
    if (!drawing) { return; }
    drawLine(current.x, current.y, e.clientX, e.clientY, current.color, true);
    current.x = e.clientX;
    current.y = e.clientY;
}      
function onColorUpdate(e){
    current.color = e.target.className.split(' ')[1];
}
// limit the number of events per second
function throttle(callback, delay) {
    var previousCall = new Date().getTime();
    return function() {
            var time = new Date().getTime();
            if ((time - previousCall) >= delay) {
                previousCall = time;
                callback.apply(null, arguments);
            }
    };
}
function onDrawingEvent(data){
    var w = canvas.width;
    var h = canvas.height;
    drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
}
// make the canvas fill its parent
function onResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}


//=================FINISH WITHEBOARD=================//