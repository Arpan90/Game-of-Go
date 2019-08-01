var currentColor;
var pass;
var reverseMode;
var stateCount = 0;
var ko;
var rowCount = 0;
var stoneCount = 0;
var posMap;
var states;
var whiteScore;
var blackScore;
var deadDeletion;
var scored;

$('.row').each(function(index,value){ // provides unique id to each row and to each stone in each row.
    $(value).attr('id', rowCount.toString());
    rowCount++;
    $(value).find('.stone').each(function(stoneIndex,stoneValue){
        $(stoneValue).attr('id', stoneCount.toString());
        stoneCount++;
    });
    stoneCount=0;
});

initializeMap();

$('.grid').click(function(){
    if(scored === true){
        alert('Game Over!');
    }
});

$('.stone').click(function(){ current = this; if(reverseMode === false && deadDeletion === false){ //begin
    pass = false;
    // current turn
    if($('#move').html() === 'Black to move'){
        currentColor = 'rgb(0, 0, 0)';
    }
     else{
        currentColor = 'rgb(255, 255, 255)';
    }

    if($(current).css('background-color') === 'rgba(0, 0, 0, 0)'){ // Placing stone before testing the global impact.
        $(current).css('background-color', currentColor);
        if(currentColor === 'rgb(0, 0, 0)'){
            $('#move').html('White to move');
        }

        else{
            $('#move').html('Black to move');
        }
    }

    //Assigning a group to the stone:
    var neighbours = neighbourStones(current);
    var friendlygrps=[];
    var opponentgrps=[];
    var currentGrp;
    for(neighbour of neighbours){
        if($(neighbour).css('background-color')===currentColor){
            friendlygrps.push($(neighbour).attr('class').replace(/stone /,'')); // creating an array of friendly groups.
        }
        
        else if($(neighbour).css('background-color')!=currentColor && $(neighbour).css('background-color')!='rgba(0, 0, 0, 0)'){
            opponentgrps.push($(neighbour).attr('class').replace(/stone /,'')); // creating an array of opponent groups.
        }
    }

    if(friendlygrps.length > 0){
        currentGrp = friendlygrps.shift();
        $(current).attr('class','stone '+currentGrp); // group assigned to the current stone.
        for(let member of friendlygrps){ // merging all friendly groups into one.
            $('.'+member).attr('class','stone ' + currentGrp);
        }
    }
    else{ // if there are no friendly neighbours
        if(Object.keys(states).length === 1){ // checking if board is empty
            currentGrp = 'g1';
        }

        else{ // lone stone
            currentGrp = 'g'+ (Number(Object.keys(states)[Object.keys(states).length - 1])+1).toString();
        }
        $(current).attr('class','stone '+currentGrp);
        
    }
    
    if(opponentgrps.length > 0){
        for(let member of opponentgrps){ // checking if the current group can delete an opponent group
            var opponentLiberties = calculateLiberties(member);
            if(opponentLiberties===0){
                $('.'+member).css('background-color','rgba(0, 0, 0, 0)');
                $('.'+member).attr('class','stone initial');
                ko = isKo(); // checking if the deletion of the opponent would result in a ko.
                if(ko){
                    revertState();
                }

            }
        }
    }


    if(!ko){
        var currentLiberties = calculateLiberties(currentGrp);
        if(currentLiberties===0){
            revertState();
        }
        else{
            mapping(posMap,1); // save the changes on the game board to the positional map.
            stateDataupdate(states,posMap); // save the current positional map in the latest key of the states object.
            
        }
        
    }

    ko = false;

}
else if(deadDeletion === true){ // tells whether both players have passed their moves consecutively or not.
    if($(current).css('background-color') != 'rgba(0, 0, 0, 0)'){ 
        $(current).css('background-color','rgba(0, 0, 0, 0)') // deletes the stone chosen as dead.
        posMap[mapLocation(current)[0]] [mapLocation(current)[1]] = 0;
        stateDataupdate(states,posMap);
    }
}
});// end






