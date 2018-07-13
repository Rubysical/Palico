$(document).ready(function(){
getScore();
getWord();
});


function getScore(){
    $("#highscore tr").remove(); 
    
    $.ajax({
    type: 'GET',
    url: 'http://localhost:3000/highscore',
    success: function(data) {
        for (var key in data) {
            $('#highscore').append(`<tr> <td>${key}</td> <td>${data[key]}</td> </tr>`);
        }

    }
});
 
}
function getWord(){
    
    $.ajax({
    type: 'GET',
    url: 'http://localhost:3000/words',
    success: function(data) {
        length = data.length;
        alert(length);
        randomNumber = Math.floor((Math.random() * length) + 1);
        alert(data[randomNumber]);
    }
    
});
 
}