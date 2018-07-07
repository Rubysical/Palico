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
var online=0;
var randomPlayer='';
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
        
       //min. 2 players as text on the website
       // io.sockets.emit('playerList', Players);
        console.log(Players);
        
        //drawsman was choose when minimum 2 player online
        //only for the first game
        if(online == 2){
            chooseDrawsman();
        }
        startGame();
    });
    //choose a random drawsman from the Players array
    function chooseDrawsman(){
        randomPlayer= Players.sample();
        io.sockets.emit('draw', randomPlayer);
    }
    //start the game and choose a random player who can draw 
    function startGame(){
        console.log('start game');
        io.sockets.emit('playerList', Players);
        io.sockets.emit('drawsman', randomPlayer);
    }
    
    //Getting a random value from an array
    Array.prototype.sample = function(){
        return this[Math.floor(Math.random()*this.length)];
    }

    // Handle chat event
    socket.on('chat', function(data){
        //console.log(data);
        io.sockets.emit('chat', data);
    });

    // Handle typing event
    socket.on('typing', function(data){
        socket.broadcast.emit('typing', data);
    });

    //disconnect the player
    socket.on('disconnect', function () {
        console.log('user disconnected');
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

app.get('/message', (req, res) => {
    res.send(msg);
});
