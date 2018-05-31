var highscoreUrl = 'http://127.0.0.1:3000/highscore';

//Highscore
var textField = ['s1', 's2', 's3', 's4', 's5'];
var pointField = ['p1', 'p2', 'p3', 'p4', 'p5'];

/**
 * Highscore vom Server laden(Empfangen).
 */
function getScore() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', highscoreUrl, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
        var data = xhr.response;
        if (data !== null) {
           console.log(data); // Parsed JSON object
           
           printData(data);
           // var array = getData(data);
			//printData(array);
        }
    };
    xhr.send(null);
}


/**
 * Füge den Highscore auf der Seite ein
 * @param {any} array
 */
function printData(array) {
    alert(array.Anna);
    document.getElementById(textField[0]).textContent = array.Anna;

	/*
	for (let i = 0; i < array.length && i < textField.length; i++) {
		document.getElementById(textField[i]).innerHTML = ar;
    }
    */
}