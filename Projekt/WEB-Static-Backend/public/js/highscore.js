
$(document).ready(function(){
    getScore();
    myFunction();
    });
    
    var x ={'testtest':10};
    
    
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