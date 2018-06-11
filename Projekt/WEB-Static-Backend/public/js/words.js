/*var addWordsUrl = "http://localhost:3000/add-word";


window.addEventListener("load", function() { 

    // Dem HTML-Button (name="senden") den Event-Handler: "click" zuweisen 
    // dieser ruft dann (beim klicken) die Funktion: eintragen() auf. 
    document.getElementsByName("senden")[0].addEventListener("click", senden); 
    
   }); 

function senden(){
    xhr = new XMLHttpRequest();
    xhr.open("PUT", addWordsUrl, true);
    xhr.setRequestHeader("Content-type", "application/json");
    var word = document.getElementById("label1").value;
    array = [word];
    var json = JSON.stringify(array);
    console.log(json);
    xhr.send(json);
   
}

*/

$(document).ready(function(){

    $("button").click(function(){
        myFunction();
    });
});

function myFunction()
{        
var $word = $('#textfield').val();
var parts = $word.split(','); //Für später
array = [$word];
var json = JSON.stringify(array);
console.log(json);

$.ajax({
    type: 'PUT',
    contentType: "application/json; charset=utf-8",
    url: 'http://localhost:3000/add-word',
    data: json
});



//TimeOut nicht schön !

setTimeout(function(){
    showMessage();
}, 300);

}

;


function showMessage() {  
        $.ajax({
            type: 'GET',
            url: 'http://localhost:3000/message',
            success: function (data) {
                alert(data);
            }
        });
}