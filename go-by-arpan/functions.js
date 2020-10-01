/////  FUNCTIONS /////////////////////

const BOARD_SIZE = Number(localStorage.size);

function logger(msg,obj){
    return console.log(msg, JSON.parse(JSON.stringify(obj)));
}


function logger1(msg,obj){
    return console.log(msg, obj);
}

function initializeMap(){
    $('.stone').css('border','none');
    posMap = [];
    for(let i = 0 ; i < BOARD_SIZE ; i++){
        posMap[i]=[]
        for(let j = 0 ; j < BOARD_SIZE ; j++){
            posMap[i].push(0);
        }
    } 

    states={0:[]};
    states[0]=JSON.parse(JSON.stringify(posMap));
    states[0].push({});
    whiteGrps = [];
    blackGrps = [];
    whiteScore = 0.5;
    blackScore = 0;
    pass = false;
    ko = false;
    reverseMode = false;
    deadDeletion = false;
    scored = false;
    msg = '';
    $('.stone').css('background-color','rgba(0, 0, 0, 0)');
    $('.stone').attr('class','stone initial');
    $('#move').show();
    $('#move').html('Black to move');
    $('.btn').show();
    $('#btn6').hide();
    $('#btn7').hide();

}

function isKo(){ // checks if the current move leads to a ko situation i.e. a repetition of a past board state.
    mapping(posMap,1);
    stateDataUpdate(states,posMap);
    var lastKey = Object.keys(states).length-1;
    for(let i in states){
        if(i < lastKey){
            if(processState(states[i]) === processState(states[lastKey]) && i%2===lastKey%2){ // modulus operator on key tells whether the key is even or odd which in turn indicates who's turn it was
                alert('Ko! of move: '+lastKey+ ' with board position after move: '+i); 
                delete states[lastKey];
                posMap = JSON.parse(JSON.stringify(states[lastKey-1]));
                return true;
            }
        }
        
    }
    delete states[lastKey];
    posMap = JSON.parse(JSON.stringify(states[lastKey-1]));
    return false;
}



function groupNeighbours(classGrp){ // returns the stone divs that form the neighbourhood of the stones whose group class has been passed as a parameter.
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

function calculateLiberties(classgrp){ // calculates liberties for a stone or a group of stone.
    var liberties = 0;
    for(member of groupNeighbours(classgrp)){
        if($(member).css('background-color')==='rgba(0, 0, 0, 0)'){ 
            liberties += 1;
        }
    }
    return liberties;
}


function mapping(posMap,direction){
    if(direction===1){ // translates the changes from the game board to the positional map.
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

    else{ // translates the changes on the positional map to the grid
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

function mapLocation(node){ // returns the indices on the positional map corresponding to a stone div on the game board.
    rowNumber = Number($(node).closest('.row').attr('id'));
    stoneNumber = Number($(node).attr('id'));
    return [rowNumber, stoneNumber];
}

function gridLocation(i,j){ // returns the stone div on the game board corresponding to the indices on the positional map.
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

function stateDataUpdate(states,posMap){ // updates the state object which stores the state of the game board after each move.
    states[Object.keys(states).length] = [];
    states[Object.keys(states).length-1]=JSON.parse(JSON.stringify(posMap));
}


function neighbourStones(node){ // returns an array containing references to stone divs which lie on liberties of the stone div passed as an argument.
    var nodeOnmap = mapLocation(node);
    var neighbours=[];
    var top = 1;
    var right = 1;
    var bottom = 1;
    var left = 1;
    
    if(nodeOnmap[0] === 0){
        top = 0;
    }
    if(nodeOnmap[0] === BOARD_SIZE-1){
        bottom = 0;
    }

    if(nodeOnmap[1] === 0){
        left = 0;
    }
    if(nodeOnmap[1] === BOARD_SIZE-1){
        right = 0;
    }
    if(top === 1){
        neighbours.push(gridLocation(nodeOnmap[0]-1, nodeOnmap[1]));
    }
    if(right === 1){
        neighbours.push(gridLocation(nodeOnmap[0], nodeOnmap[1]+1));
    }

    if(bottom === 1){
        neighbours.push(gridLocation(nodeOnmap[0]+1, nodeOnmap[1]));
    }

    if(left === 1){
        neighbours.push(gridLocation(nodeOnmap[0], nodeOnmap[1]-1));
    }

    return neighbours;
}

function revertState(key=Object.keys(states).length-1){ // used to reverse the board state to a given previous state.
    mapping(states[key],-1);
    if(key%2===0){
        $('#move').html('Black to move');
    }

    else{
        $('#move').html('White to move');
    }
}

function processState(map){
    a = JSON.parse(JSON.stringify(map));
    for(let i = 0; i < BOARD_SIZE; i++){
        for(let j = 0; j < BOARD_SIZE; j++){
            if(a[i][j] < 0){
                a[i][j] = -1;
            }
            else if(a[i][j] > 0){
                a[i][j] = 1;
            }
        }
    }
    delete a[BOARD_SIZE];
    return JSON.stringify(a);
}

function scoring(){ if(Object.keys(states).length > 1){
    if(scored === true){ // To prevent scoring again, adding to the previous score in case scoring button is clicked twice.
        alert(msg);
        return;
    }
    reverseMode = true;
    var scoreClass = [];
    var white;
    var black;
    $('.initial').each(function(index,value){ // iterate over each non colored stone div
        var classGrp=[];
        var currentClass;
        var neighbours = neighbourStones(value);
        for(let member of neighbours){
            if($(member).css('background-color')==='rgba(0, 0, 0, 0)'){
                if($(member).attr('class') != 'stone initial'){ 
                    classGrp.push($(member).attr('class').replace(/stone /,''));

                }
            }
        }
        if(classGrp.length > 0){
            currentClass = classGrp.shift();
            for(let member of classGrp){
                $('.'+member).attr('class','stone '+currentClass);
                // for(i of scoreClass){
                //     if(member === i){
                //         scoreClass.splice(scoreClass.indexOf(i),1);
                //     }
                // }
            }
        }

        else{
            if(scoreClass.length===0){ // first stone to be iterated over
                currentClass = 'x1';
            }
            else{
                currentClass = 'x'+(Number(scoreClass[scoreClass.length-1].replace(/x/,''))+1).toString(); // non colored stone which has no non colored stones in its neighbouhood which have been iterated over.
            }

            scoreClass.push(currentClass);
            
        }
        $(value).attr('class','stone '+currentClass);

    });
    for(let member of scoreClass){
        var surrounding = groupNeighbours(member);

        for(let stone of surrounding){
            if($(stone).css('background-color')==='rgb(0, 0, 0)'){
                black = true;
            }
            else if($(stone).css('background-color')==='rgb(255, 255, 255)'){
                white = true;
            }
        }
        if(white === true && black != true){
            $('.'+member).css('background-color','rgba(255, 255, 255, 0.5)');
            $('.'+member).each(function(index,value){
                whiteScore += 1;
            });
        }
        else if(white != true && black === true){
            $('.'+member).css('background-color','rgba(0, 0, 0, 0.5)');
            $('.'+member).each(function(index,value){
                blackScore += 1;
            });
        }
        white = 0;
        black = 0;

        
    }
    for(let i = 0; i < BOARD_SIZE; i++){ // calculating the number of white and black stones on the board.
        for(let j = 0; j < BOARD_SIZE; j++){
            if(posMap[i][j] > 0){
                whiteScore += 1;
            }
            else if(posMap[i][j] < 0){
                blackScore += 1;
            }
        }
    }
    var score = whiteScore-blackScore;
    if(score > 0){
        msg  = 'White won by '+score+' points!';
    }
    else{
        msg = 'Black won by '+(-score)+' points!';
    }

    alert(msg);
    scored = true;

}}


