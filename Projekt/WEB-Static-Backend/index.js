const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const fs = require('fs');

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


var Players = [];
var PlayersID=[];
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
        Players[Players.length] = data;   
        PlayersID[PlayersID.length] = socket.id;
        
       //min. 2 players as text on the website
       // io.sockets.emit('playerList', Players);
        console.log(Players);
        console.log(PlayersID);
        if(online==2){
            startGame();
        }
    });

    
    
    

    //choose a random drawsman from the Players array
    function chooseDrawsman(){
        currentDrawsman= Players.sample();
        io.sockets.emit('draw', currentDrawsman);
        setTimeout(function(){startGame();},10000);
    }
    //start the game and choose a random player who can draw 
    function startGame(){
        chooseDrawsman();
        console.log('start game');
        io.sockets.emit('playerList', Players);
        io.sockets.emit('drawsman', currentDrawsman);
        
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
        io.sockets.emit('playerArray', Players);
    });

    // Handle chat event
    socket.on('chat', function(input){
       console.log(input.message);
        io.sockets.emit('chat', input);
        if(randomWord==input.message){
            console.log(input.handle +" is the winner!");
            io.sockets.emit('winner', input.handle);
            
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
                if(Players[i]==currentDrawsman){
                    startGame();
                }
                PlayersID.splice(i, 1);
                Players.splice(i,1);
                console.log(Players);
                console.log(PlayersID);
                online--;
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
        }

        else {
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
