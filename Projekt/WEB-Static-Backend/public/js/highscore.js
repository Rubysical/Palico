$(document).ready(function(){
getScore();
        $("button").click(function(){
    getScore();
    });
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