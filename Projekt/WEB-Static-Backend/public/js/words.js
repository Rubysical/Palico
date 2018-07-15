$(document).ready(function(){

    //Wenn der Button geklickt wird, sende das Wort ein
    $('#button').on('click',function(){
        myFunction();
    });
});

//Wort(er) mit PUT dem Server übergeben
function myFunction()
{        
var $word = $('#textfield').val();
var parts = $word.split(','); //Für später

array = parts;
var json = JSON.stringify(array);
console.log(json);

$.ajax({
    type: 'PUT',
    contentType: "application/json; charset=utf-8",
    url: 'http://localhost:3000/add-word',
    data: json
});

setTimeout(function(){
    showMessage();
}, 300);

};

//Hol dir die Information mit GET vom Server ob das einfügen funktioniert hat
function showMessage() {  
        $.ajax({
            type: 'GET',
            url: 'http://localhost:3000/message',
            success: function (data) {
                alert(data);
            }
        });
}
