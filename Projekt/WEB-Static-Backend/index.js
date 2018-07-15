const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const fs = require('fs');
var countdownBool = false;
var countdownBool2 = false;
var msg;

// SOCKET
var socket = require('socket.io');
var server = app.listen(3000, function(){
    console.log('Listening on port ' + port);
});
//SOCKET ENDE


const port = process.env.PORT || '3000';
app.set('port', port);

app.use(cors());
app.use(bodyParser.json());

// Serve static files
const staticPath = path.join(__dirname, 'public');
app.use(express.static(staticPath));


var PlayersName = [];
var PlayersID=[];
var PlayersPoints=[];
var online=0;
var currentDrawsman='';
var randomWord='';
// Socket setup & pass server
var io = socket(server);


io.on('connection', (socket) => {

    console.log('made socket connection', socket.id);
    
    //Creat a new Player
    socket.on('NewPlayer', function(data) {
        online++;
        console.log('Online players : ' + online);
        console.log('New player connected : ' + data);
        PlayersName[PlayersName.length] = data;   
        PlayersID[PlayersID.length] = socket.id;
        PlayersPoints[PlayersPoints.length]=0;
        
       //min. 2 players as text on the website
       // io.sockets.emit('playerList', Players);
        console.log(PlayersName);
        console.log(PlayersID);
        console.log(PlayersPoints);

        startFirstGame();
    });

    var time=10;
    var i=0;

    //choose a random drawsman from the Players array
    function chooseDrawsman(){
        timeLeft = time;
        i = 0;
        io.sockets.emit('clearCanvas');
        io.sockets.emit('clearChat');
        //time = 10; //time in secends for one round
        currentDrawsman= PlayersName.sample();
        io.sockets.emit('draw', currentDrawsman);
       
        countdownBool = true;
        roundInterval();
        console.log(countdownBool);
        
       
       setTimeout(function(){
        startGame();
    },(time*1000)+(time*100));
        
    }
    //start the game and choose a random player who can draw 
    function startFirstGame(){
        if(online<2){
            io.sockets.emit('minTwoPlayer');
            countdownBool2 = true;
        }else{
            if(online==2){
                chooseDrawsman();
                countdownBool2 = false;
                //roundInterval();
            }
            console.log('start game');
            outputForPlayer();
        }
    }

    function outputForPlayer(){
        sortArray();
        io.sockets.emit('playerList', PlayersName,PlayersPoints);
        io.sockets.emit('drawsman', currentDrawsman);
    }

    function sortArray(){
        for(var i=0; i<PlayersName.length;i++){
            if(PlayersPoints[i]<PlayersPoints[i+1]){
                swap(i,i+1);
            }
        }
    }
    
    function swap(index,index2){
        var tempName=PlayersName[index2];
        var tempPoints=PlayersPoints[index2];
        PlayersName[index2]=PlayersName[index];
        PlayersPoints[index2]=PlayersPoints[index];
        PlayersName[index]=tempName;
        PlayersPoints[index]=tempPoints;
    }

    function startGame(){
        if(online<2){
            startFirstGame();
        }else{
            chooseDrawsman();
            outputForPlayer();
        }       
    }

    function roundInterval(){
        countdown(time);
    }
    
    var timeLeft=0;
    function countdown(timer){
        timeLeft = timer;
        if(i<=time){
            i++;
            setTimeout(function(){
                if(countdownBool2 == false){io.sockets.emit('timeLeft',timeLeft);}
                
                timeLeft--;
                countdown(timeLeft);
            },1000);
        }else{
            
        }
    }
    function winner(nameOfThePlayer){
        sortArray();
        for(var i = 0; i<PlayersName.length; i++){
            if(PlayersName[i]==nameOfThePlayer){
                var currentPoints=PlayersPoints[i];
                PlayersPoints[i]=currentPoints+10;
            }
            if(PlayersName[i]==currentDrawsman){
                var currentPoints=PlayersPoints[i];
                PlayersPoints[i]=currentPoints+10;
            }
        }
        console.log(PlayersName);
        console.log(PlayersID);
        console.log(PlayersPoints);

        io.sockets.emit('playerNameArray', PlayersName);
        io.sockets.emit('playerPointsArray', PlayersPoints);
        io.sockets.emit('winner', nameOfThePlayer);
    }

    //Getting a random value from an array
    Array.prototype.sample = function(){
        return this[Math.floor(Math.random()*this.length)];
    }

   socket.on('randomWord',function(word){
        randomWord=word;
        console.log('random word is: '+ word);
    });

    socket.on('sendPlayerArray', function(){
        io.sockets.emit('playerNameArray', PlayersName);
    });

    // Handle chat event
    socket.on('chat', function(input){
       console.log(input.message);
        io.sockets.emit('chat', input);
        if(randomWord==input.message){
            console.log(input.handle +" is the winner!");
            winner(input.handle);            
        }
    });

    // Handle typing event
    socket.on('typing', function(data){
        socket.broadcast.emit('typing', data);
    });

    //disconnect and remove the player
    socket.on('disconnect', function (data) {
        io.sockets.emit('disconnectThatSoc');
        console.log('user disconnected'+socket.id);
       for(var i = 0; i<PlayersID.length; i++){
            if(socket.id==PlayersID[i]){
                if(PlayersName[i]==currentDrawsman){
                   startGame();
                }
                PlayersID.splice(i, 1);
                PlayersName.splice(i,1);
                PlayersPoints.splice(i,1);
                console.log(PlayersName);
                console.log(PlayersPoints);
                console.log(PlayersID);
                online--;
                outputForPlayer();
            }
       }
    });
});


const words = require('./resources/words');
const highscores = require('./resources/highscores');

app.use(function(err, req, res, next) {
    if (err.type === 'entity.parse.failed') {
        return res.status(400).send(JSON.stringify({
            error: {
                code: "INVALID_JSON",
                message: "The body of your request is not valid JSON."
            }
        }))
    }
});

app.get('/highscore', (req, res) => {
    res.status(200).json(highscores);
});

app.post('/highscore', (req, res) => {
    const newScore = req.body;

    for (let user in newScore) {
        if (Number.isInteger(newScore[user])) {
            if (!(highscores[user] > newScore[user])) highscores[user] = newScore[user];
                    
            const json = JSON.stringify(newScore);
            fs.writeFile ("./resources/highscores.json", json, (err) => {
                    if (err) throw err;
                    
                    msg = newScore[user] + " has been successfully added";
                }
            );
        
        }else {
            res.status(400).json({message: 'The score for ' + user + ' is not an Integer'});
           
            return;
        }
    }

    res.status(200).json({message: 'Data has been successfully added'});
});

app.get('/words', (req, res) => {
    res.status(200).json(words);
});

app.put('/add-word', (req, res) => {
    const wordArray = req.body;

    // Check if data is an array
    if (!Array.isArray(wordArray)) {
        res.status(400).json({message: 'Data must be a JSON array'});
        return;
    }

    for (let newWord in wordArray) {
        // Check if data is in String format
        if (typeof wordArray[newWord] !== 'string') {
            res.status(400).json({message: 'Data in array must be Strings'});
            return;
        }

        let isDuplicate = false;

        // Check if word already exists
        for (let existingWord in words) {
            if (words[existingWord] === wordArray[newWord]) isDuplicate = true;
        }

        // If not a duplicate, add it to the array
        if (isDuplicate)
        {

         console.log(wordArray[newWord] + ' is a duplicate');
         msg = wordArray[newWord] + " is a duplicate";

        }
        else
        { words.push(wordArray[newWord]); 
            
            const json = JSON.stringify(words);
            fs.writeFile ("./resources/words.json", json, (err) => {
                    if (err) throw err;
                    
                    console.log(wordArray[newWord] + ' has been successfully added');
                    msg = wordArray[newWord] + " has been successfully added";
                }
            );
        }
        }
    res.status(200).json({message: 'Data has been successfully added'})
});


//zeichenfeld
function onConnection(socket){

    socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));
  
  }

  io.on('connection', onConnection);


app.get('/message', (req, res) => {
    res.send(msg);
});
