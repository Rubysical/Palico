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