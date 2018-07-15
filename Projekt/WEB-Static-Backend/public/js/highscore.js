
$(document).ready(function(){
    //Wenn die Seite aufgerufen wird, hole dir die aktuelle Highscore
    getScore();
});    

var sortJson={};
var arrayPlayerName=[];
var arrayPlayerPoints=[];

//Hol dir mit GET den Highscore
function getScore(){
    $("#highscore tr").remove(); 
    
    $.ajax({
    type: 'GET',
    url: 'http://localhost:3000/highscore',
    success: function(data) {
        var i=0;
        for (var key in data) {
            arrayPlayerName[i]=key;
            arrayPlayerPoints[i]=data[key];
            i++;
        }
        sortArray()
        for(var i=0; i<arrayPlayerName.length;i++){
            //if player hast zero point then do nothing
            if(arrayPlayerPoints[i]<10){

            }else{
                $('#highscore').append('<tr> <td>'+arrayPlayerName[i]+'</td> <td>'+arrayPlayerPoints[i]+'</td> </tr>');
            }
        }
    }
    });
}
//Sortiere Array Absteigend nach Punkten
function sortArray(){
    for(var i=0; i<=arrayPlayerName.length;i++){
        if(arrayPlayerPoints[i]<arrayPlayerPoints[i+1]){
            swap(i,i+1);
            sortArray();
        }
    }
}
//Swap nach Punkten
function swap(index,index2){
    var tempName=arrayPlayerName[index2];
    var tempPoints=arrayPlayerPoints[index2];
    arrayPlayerName[index2]=arrayPlayerName[index];
    arrayPlayerPoints[index2]=arrayPlayerPoints[index];
    arrayPlayerName[index]=tempName;
    arrayPlayerPoints[index]=tempPoints;
}

