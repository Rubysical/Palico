
var canvas = document.getElementById('drawArea');

var ctx = canvas.getContext('2d');

var draw =false;
var color="black";

function drawLine(event){
    if(draw==true){
        var posX = event.pageX;
        var posY = event.pageY-260;
        ctx.strokeStyle=color;
        ctx.lineTo(posX,posY);
       
        ctx.stroke();
        
    }
}

function start(event){
    var posX = event.pageX;
    var posY = event.pageY-260;
    ctx.moveTo(posX,posY);
    draw=true;
}

function stop(){
    draw = false;

}

function colorBlack(){
    color="black";
}
function colorWhite(){
    color="white";
}
function colorBlue(){
    color="blue";
}
function colorRed(){
    color="red";
}
function colorGreen(){
    color="green";
}
function colorBrown(){
    color="brown";
}
function colorYellow(){
    color="yellow";
}
function colorOrange(){
    color="orange";
}

var formData = new FormData();
formData.append('username', 'johndoe');
formData.append('id', 123456);
var xhr = new XMLHttpRequest();
xhr.open('POST', '/server', true);
xhr.onload = function(e) {  };
xhr.send(formData);