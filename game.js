$('#btn1').click(function(){ // Pass button
    if(pass === false){
        if($('#move').html() === 'Black to move'){
            $('#move').html('White to move');
        }
        else{
            $('#move').html('Black to move');
        }
        pass = true;
    }

    else{
        scoring(neighbourStones,groupNeighbours);
    }
    
});

$('#btn5').click(function(){ // Restart button
    console.clear();
    initializeMap();
    // location.reload();
});

var currentColor;
var pass = false;
var reverseMode;
var stateCount = 0;
var groupLiberties;
var ko = false;
var rowCount = 0;
var stoneCount = 0;
var posMap;
var states;
$('.row').each(function(index,value){
    $(value).attr('id', rowCount.toString());
    rowCount++;
    $(value).find('.stone').each(function(stoneIndex,stoneValue){
        $(stoneValue).attr('id', stoneCount.toString());
        stoneCount++;
    });
    stoneCount=0;
});

initializeMap();

$('.stone').click(function(){ if(reverseMode === false){//begin
    // current turn
    current = this;
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
            delete groupLiberties[member];
        }
    }
    else{ // if there are no friendly neighbours
        if(Object.keys(groupLiberties).length === 0){ // checking if board is empty
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
                delete groupLiberties[member];
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
            mapping(posMap,1);
            groupLiberties[currentGrp] = currentLiberties;
            stateDataupdate(states,posMap,groupLiberties);
            
        }
        
    }

    ko = false;

}});// end



$('#btn2').click(function(){ // Backward button
    if(Object.keys(states).length-1 > stateCount){
        stateCount += 1;
        reverseMode = true;
        var lastKey = Object.keys(states).length-1;
        var key = lastKey-stateCount;
        revertState(key);
    }
    
});

$('#btn3').click(function(){ // Forward button
    if(reverseMode === true){ // Checking if the game has been reversed atall.
        stateCount -= 1;
        var lastKey = Object.keys(states).length-1;
        var key = lastKey-stateCount;
        revertState(key);
    }
    if(stateCount===0){
        reverseMode=false;
    }
    
});

$('#btn4').click(function(){ // Resume button
    reverseMode=false;
    var lastKey = Object.keys(states).length-1;
    var key = lastKey-stateCount;
    stateCount = 0;
    for(i in states){
        if(i>key){
            delete states[i];
        }
    }
    groupLiberties=JSON.parse(JSON.stringify(states[key][19]));
});

/////  FUNCTIONS /////////////////////

function logger(msg,obj){
    return console.log(msg, JSON.parse(JSON.stringify(obj)));
}


function logger1(msg,obj){
    return console.log(msg, obj);
}

function isKo(){
    mapping(posMap,1);
    stateDataupdate(states,posMap,groupLiberties);
    var lastKey = Object.keys(states).length-1;
    for(let i in states){
        if(i < lastKey){
            if(processState(states[i]) === processState(states[lastKey]) && i%2===lastKey%2){ // modulus operator on key tells whether the key is even or odd which in turn indicates who's turn it was
                alert('Ko! of '+lastKey+ ' with board position after move: '+i); 
                delete states[lastKey];
                posMap = JSON.parse(JSON.stringify(states[lastKey-1])).splice(0,19);
                return true;
            }
        }
        
    }
    delete states[lastKey];
    posMap = JSON.parse(JSON.stringify(states[lastKey-1])).splice(0,19);
    return false;
}



function groupNeighbours(classGrp,neighbourStones){
    var nOc=[];
    $('.'+classGrp).each(function(index,value){
        let neighboursOfclass = neighbourStones(value);
        for(let member of neighboursOfclass){
            if($(member).attr('class').replace('stone ','') != classGrp){
                nOc.push(member);
            }
        }
    }); 
    nOc = [...new Set(nOc)];
    return nOc;
}

function calculateLiberties(classgrp){
    var liberties = 0;
    for(member of groupNeighbours(classgrp,neighbourStones)){
        if($(member).css('background-color')==='rgba(0, 0, 0, 0)'){ 
            liberties += 1;
        }
    }
    return liberties;
}


function mapping(posMap,direction){
    if(direction===1){ // grid to map
        $('.stone').each(function(index,value){
            rowNumber = mapLocation(value)[0];
            stoneNumber = mapLocation(value)[1];
            if($(value).css('background-color')==='rgb(0, 0, 0)'){
                posMap[rowNumber][stoneNumber] = -Number($(value).attr('class').replace(/stone g/,''));
            }

            else if($(value).css('background-color')==='rgb(255, 255, 255)'){
                posMap[rowNumber][stoneNumber] = Number($(value).attr('class').replace(/stone g/,''));
            }

            else{
                posMap[rowNumber][stoneNumber] = 0;
            }
        });
    }

    else{
        $('.stone').each(function(index,value){ // map to grid
            rowNumber = mapLocation(value)[0];
            stoneNumber = mapLocation(value)[1];
            if(posMap[rowNumber][stoneNumber] === 0){
                $(value).css('background-color','rgba(0, 0, 0, 0)');
                $(value).attr('class','stone initial');
            }

            else if(posMap[rowNumber][stoneNumber] > 0){
                $(value).css('background-color','rgb(255, 255, 255)');
                $(value).attr('class','stone g' + (posMap[rowNumber][stoneNumber]).toString());
            }

            else{
                $(value).css('background-color','rgb(0, 0, 0)');
                $(value).attr('class','stone g' + (-posMap[rowNumber][stoneNumber]).toString());
            }
        });
    }
}

function mapLocation(node){
    rowNumber = Number($(node).closest('.row').attr('id'));
    stoneNumber = Number($(node).attr('id'));
    return [rowNumber, stoneNumber];
}

function gridLocation(i,j){
    var result;
    $('.stone').each(function(index,value){
        rowNumber = Number($(value).closest('.row').attr('id'));
        stoneNumber = Number($(value).attr('id'));
        if(i===rowNumber && j===stoneNumber){
            result = value;
            return false; // to exit $.each() loop
        }
    });
    return result;
}

function stateDataupdate(states,posMap,groupLiberties){
    states[Object.keys(states).length] = [];
    states[Object.keys(states).length-1]=JSON.parse(JSON.stringify(posMap));
    states[Object.keys(states).length-1].push(JSON.parse(JSON.stringify(groupLiberties)));
}

function initializeMap(){
    posMap = [];
    for(let i = 0 ; i < 19 ; i++){
        posMap[i]=[]
        for(let j = 0 ; j < 19 ; j++){
            posMap[i].push(0);
        }
    } 

    states={0:[]};
    states[0]=JSON.parse(JSON.stringify(posMap));
    states[0].push({});

    groupLiberties = {};
    reverseMode = false;
    $('.stone').css('background-color','rgba(0, 0, 0, 0)');
    $('.stone').attr('class','stone initial');
    $('#move').html('Black to move');

}

function neighbourStones(node){
    var nodeOnmap = mapLocation(node);
    var neighbours=[];
    neighbours[0] = gridLocation(nodeOnmap[0]-1, nodeOnmap[1]);
    neighbours[1] = gridLocation(nodeOnmap[0], nodeOnmap[1]+1);
    neighbours[2] = gridLocation(nodeOnmap[0]+1, nodeOnmap[1]);
    neighbours[3] = gridLocation(nodeOnmap[0], nodeOnmap[1]-1);

    for(let neighbour of neighbours){
        if(typeof($(neighbour).attr('class'))==='undefined'){
            neighbours.splice(neighbours.indexOf(neighbour),1);
        }
    }
    return neighbours;
}

function revertState(key=Object.keys(states).length-1){
    mapping(states[key],-1);
    groupLiberties = JSON.parse(JSON.stringify(states[key][19]));
    if(key%2===0){
        $('#move').html('Black to move');
    }

    else{
        $('#move').html('White to move');
    }
}

function processState(map){
    a = JSON.parse(JSON.stringify(map));
    for(let i = 0; i < 19; i++){
        for(let j = 0; j < 19; j++){
            if(a[i][j] < 0){
                a[i][j] = -1;
            }
            else if(a[i][j] > 0){
                a[i][j] = 1;
            }
        }
    }
    delete a[19];
    return JSON.stringify(a);
}




