$(document).ready(function(){

    $('#button').on('click',function(){
        myFunction();
    });
});

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


function showMessage() {  
        $.ajax({
            type: 'GET',
            url: 'http://localhost:3000/message',
            success: function (data) {
                alert(data);
            }
        });
}
