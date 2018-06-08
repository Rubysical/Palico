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