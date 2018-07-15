// Make connection
var socket = io.connect('http://localhost:3000');

var playerNameArray = [];
var playerPointsArray = [];
var randomWord='';

socket.emit('sendPlayerArray',function(){
});

socket.on('playerNameArray', function(array){
    playerNameArray=array;
    console.log(playerNameArray);
});
socket.on('playerPointsArray', function(array){
    playerPointsArray=array;
    console.log(playerPointsArray);
});

//=================START PopUp Fenster=================//
var	PlayBtn = document.getElementById('play'),
    popup = document.getElementById('popup'),
    playerName = document.getElementById('playerName'),
    gameHidden = document.getElementById('gameArea');

    PlayBtn.addEventListener('click', function(){
        closeWindow();
        
    });
    openWindow();

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
//=================FINISH PopUp Fenster=================//


//=================START GAME=================//
// Query DOM
var message = document.getElementById('message'),
    handle = document.getElementById('handle'),
    buttonSendMessage = document.getElementById('send'),
    output = document.getElementById('output'),
    feedback = document.getElementById('feedback'),
    timer = document.getElementById('timer');
    minTwoPlayer = document.getElementById('minTwoPlayer'),
    currentDrawsman = document.getElementById('currentDrawsman'),
    currentPlayerList = document.getElementById('currentPlayerList');

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
            getWord();
            setTimeout(function(){socket.emit('randomWord', randomWord);}, 500);
            playerDraw();
            setTimeout(function(){message.placeholder='Zu zeichnen: ' + randomWord;},300);
        }else{
            playerNotDraw();
            setTimeout(function(){message.placeholder='Bitte hier das Wort eintippen';},300);
        }
        
    });  
   
    socket.on('minTwoPlayer',function(){
        minTwoPlayer.innerHTML='<p>Mindestens 2 Spieler müssen Online sein</p>'
        minTwoPlayer.className=''
        timer.className='overlayHidden';
        currentDrawsman.className='overlayHidden';
        currentPlayerList.className='overlayHidden';
        timer.className = 'overlayHidden';
        
    });

    socket.on('winner',function(winner,arrayName){
        output.innerHTML += '<p><strong>Winner is: ' + winner + ': </strong></p>';
        var name;
        var points;
        var jsonArray={};

        for(var i=0;i<playerNameArray.length; i++){
            name = playerNameArray[i];                
            points= playerPointsArray[i];
            jsonArray[name] = points;
            var json = JSON.stringify(jsonArray);
        }
            console.log(json);
            $.ajax({
                type: 'POST',
                contentType: "application/json; charset=utf-8",
                url: 'http://localhost:3000/highscore',
                data: json
            });
            
        
    });

    socket.on('chat', function(data){
        feedback.innerHTML = '';
        output.innerHTML += '<p><strong>' + data.handle + ': </strong>' + data.message + '</p>';
    }); 

    socket.on('typing', function(data){
        feedback.innerHTML = '<p><em>' + data + ' is typing a message...</em></p>';
    });

    socket.on('drawsman', function(drawsman){
        minTwoPlayer.className='overlayHidden'
        currentDrawsman.className='';
        currentDrawsman.innerHTML = '<h3>Aktuelle Zeichner: </h3>' +'<h2>'+drawsman+'</h2><br>';
    });

    //show the current players on the web site
    socket.on('playerList', function(player,points){
        currentPlayerList.className='';
        currentPlayerList.innerHTML = '<h3>Aktuelle Spieler: </h3><br>';
        for(var i=0;i<player.length;i++){
            currentPlayerList.innerHTML += '<h2>'+player[i]+': '+points[i]+'</h2><br>';  
        }
    });  

    socket.on('clearChat',function(){
        output.innerHTML='';
    });

    socket.on('countdown',function(time){
        countdown(time);
    });

    socket.on('timeLeft',function(timeLeft){
        timer.className='';

        timer.innerHTML = timeLeft + ' seconds remaining';

    });
});

//=================FINISH GAME=================//

//=================START Random word=================//
function getWord(){
    $.ajax({
        type: 'GET',
        url: 'http://localhost:3000/words',
        success: function(data) {
            length = data.length;
            randomNumber = Math.floor((Math.random() * length));
            randomWord=data[randomNumber];
        }
    });
}

//=================END Random word=================//


//=================START Push Highscore=================//


//=================END Push Highscore=================//


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
function playerNotDraw(){
    canvas.removeEventListener('mousedown', onMouseDown, false);
    canvas.removeEventListener('mouseup', onMouseUp, false);
    canvas.removeEventListener('mouseout', onMouseUp, false);
    canvas.removeEventListener('mousemove', throttle(onMouseMove, 10), false);  
}

for (var i = 0; i < colors.length; i++){
    colors[i].addEventListener('click', onColorUpdate, false);
}

socket.on('drawing', onDrawingEvent);
window.addEventListener('resize', onResize, false);
onResize();

socket.on('clearCanvas',function(){
     context.clearRect(0,0,canvas.width,canvas.height);   
});

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
