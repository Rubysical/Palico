
var canvas = document.getElementById('drawArea');
var ctx = canvas.getContext('2d');
var draw =false;

function drawLine(event){
    if(draw==true){
        var posX = event.pageX;
        var posY = event.pageY-230;
        ctx.strokeStyle="red";
        ctx.lineTo(posX,posY);
       
        ctx.stroke();
        
    }
}

function start(event){
    var posX = event.pageX;
    var posY = event.pageY-230;
    ctx.moveTo(posX,posY);
    draw=true;
}

function stop(){
    draw = false;

}