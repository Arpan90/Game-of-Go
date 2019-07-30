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

$('#btn4').click(function(){ // Restart button
    $('.stone').css('background-color','rgba(0, 0, 0, 0)');
    $('.stone').attr('class','stone initial');
    $('#move').html('Black to move');
    groupLiberties = {};
    boardState = {0:[]};
    colorState = {0:[]};
    reverseMode = false;
    // location.reload();
    console.clear();
});


pass = false;
reverseMode = false;
boardState = {0:[]};
colorState = {0:[]};
stateCount = 0;
var groupLiberties = {};
var ko = false;
var eyes=0;

$('.stone').click(function(){ if(reverseMode === false){
    pass = false;
    var current = this;
    var liberties = 0;
    var currentColor;
    var neighbours= neighbourStones(current);
    var deleted = false;
    friendlyGrps=[];
    opponentGrps=[];
    var testGroup={};

    $.extend(testGroup, groupLiberties);

    // current turn
    if($('#move').html() === 'Black to move'){
        currentColor = "rgb(0, 0, 0)";
     }
     else{
        currentColor = "rgb(255, 255, 255)";
     }

    for(let neighbour of  neighbours){
        if($(neighbour).css("background-color") === "rgba(0, 0, 0, 0)" ){ 
            liberties+=1;
        }
        if($(neighbour).css("background-color") === currentColor){ 
            friendlyGrps.push(($(neighbour).attr('class')).replace('stone ',''));

        }

        if(typeof($(neighbour).attr('class'))!='undefined' && $(neighbour).css("background-color") != currentColor && $(neighbour).css("background-color") != "rgba(0, 0, 0, 0)"){
            opponentGrps.push(($(neighbour).attr('class')).replace('stone ',''));
        }

    }

    friendlyGrps = [...new Set(friendlyGrps)];
    opponentGrps = [...new Set(opponentGrps)];
    if(opponentGrps.length>0){ // in case groups of opposite color do exist
        for(let opponentGrp of opponentGrps){
            testGroup[opponentGrp]-=1;
            borderStones = [];
            if(testGroup[opponentGrp] === 0){  // in case the liberties of an opponenent group reduce to zero.
                ////////////////////
                ko  = isKo(boardState,maintainBoardstate,current,opponentGrp);
                if(!ko){ 
                    let neighbourOfopponents = groupNeighbours(opponentGrp,neighbourStones);
                    neighbourOfopponents.splice(neighbourOfopponents.indexOf(current),1);

                    for(let neighbourOfopponent of neighbourOfopponents){
                        let neighboursOffriend = neighbourStones(neighbourOfopponent);
                        borderStones.push(neighbourOfopponent);
                    

                        for(let member of neighboursOffriend){
                            if($(member).attr('class').replace('stone ','') === opponentGrp){
                            testGroup[$(neighbourOfopponent).attr('class').replace('stone ','')] += 1;
                            }
                        }
                    }
                    borderStones = [...new Set(borderStones)]; // contain unique neighbours of deleted stones
                    for(let borderStone of borderStones){
                        borderStoneneighbours = neighbourStones(borderStone); 
                        for(let borderStoneneighbour of borderStoneneighbours){
                            for(let k in borderStoneneighbours){
                                if(borderStoneneighbours.indexOf(borderStoneneighbour)!=k && $(borderStoneneighbours[k]).attr('class')==$(borderStoneneighbour).attr('class') && opponentGrp == $(borderStoneneighbour).attr('class').replace('stone ','')){
                                    testGroup[$(borderStoneneighbours[k]).attr('class').replace('stone ','')] -= 1;
                                    borderStoneneighbours.splice(k,1);
                                }

                            }
                        }
                    }
                    /////////////////////
                    delete testGroup[opponentGrp];
                    deleted = true;
                    $('.'+opponentGrp).css('background-color','rgb(0, 0, 0, 0)');
                    // $('.'+opponentGrp).attr('id','#');
                    $('.'+opponentGrp).attr('class','stone initial');
                }
                else{
                    continue;
                }
                
            }
        }
        

    }

    
    // Placing stone and changing Pass button value
    if($(current).css("background-color") === "rgba(0, 0, 0, 0)" && (liberties!=0 || friendlyGrps.length>0 || deleted===true)&& !ko){
        $(current).css('background-color', currentColor);
        $('#move').html('White to move');
        if(currentColor === "rgb(0, 0, 0)"){
            $('#move').html('White to move');
            // $(current).attr('id', 'b');
        }

        else{
            $('#move').html('Black to move');
            // $(current).attr('id', 'w');
        }

        if(friendlyGrps.length>0){ // if the stone has friendly groups in its neighbourhood.

            // Handling single liberty friendly groups:
            if(liberties===0){
                for(let friendlyGrp of friendlyGrps){
                    if(testGroup[friendlyGrp]===1){
                        for(member of groupNeighbours(friendlyGrp,neighbourStones)){
                            if($(member).attr('class')==='stone initial'){
                                if(member === current){
                                    eyes += 1;
                                }
                            }
                        }
                    }
                    else{
                        break;
                    }
                }
            }
            

            if(eyes != friendlyGrps.length){
                testGroup[friendlyGrps[0]] = testGroup[friendlyGrps[0]]+liberties-1;
                var mainGrp = friendlyGrps.shift();
                var newClass = $(current).attr('class').replace("initial",mainGrp);
                $(current).attr('class',newClass);
                for(let friendlyGrp of friendlyGrps){
                    testGroup[mainGrp]+= testGroup[friendlyGrp];
                    $('.'+friendlyGrp).attr('class',newClass);
                    delete testGroup[friendlyGrp];
                }
            }

            else{
                // $(current).attr('id','#');
                $(current).css('background-color','rgba(0, 0, 0, 0)');
                if($('#move').html() === 'Black to move'){
                    currentColor = "rgb(255, 255, 255)";
                    $('#move').html("White to move");
                }

                else{
                    currentColor = "rgb(0, 0, 0)";
                    $('#move').html("Black to move");
                }
            }
            
            
        }
    
        else{ // if there are no friendly neighbours
            if(Object.keys(testGroup).length>0){ // if the board is not empty
                newClass = 'g'+(Number(Object.keys(testGroup)[Object.keys(testGroup).length - 1].replace(/g/,''))+1).toString();
                testGroup[newClass]=liberties;
                if(deleted===true){ // if the current stone captures any opponent stones
                    testGroup[newClass] = 0;
                    for(member of neighbourStones(current)){
                        if($(member).attr('class').replace('stone ','')==='initial'){
                            testGroup[newClass] += 1;
                        }
                    }
                    
                }
                newClass = $(current).attr('class').replace("initial",newClass);
                $(current).attr('class',newClass);

                
            }
            else{ // if the board is empty
                newClass = $(current).attr('class').replace('initial','g1');
                $(current).attr('class',newClass);
                testGroup['g1'] = liberties;
            }
            
        }

        // Calculating group liberties:
        if(eyes!=friendlyGrps.length || friendlyGrps.length===0){
            key = $(current).attr('class').replace('stone ','');
            testGroup[key]=0;
            for(member of groupNeighbours(key,neighbourStones)){
                if($(member).css('background-color')==='rgba(0, 0, 0, 0)'){ 
                    testGroup[key] += 1;
                }
            }

            groupLiberties = testGroup;

            maintainBoardstate(boardState,current);

            
        }

        
    }
    eyes = 0;
    ko = false;
}});



$('#btn2').click(function(){ // Backward button
    stateCount += 1;
    reverseMode = true;
    var lastKey = Object.keys(boardState).length-1;
    var key = lastKey-stateCount;
    $('.stone').css('background-color','rgba(0, 0, 0, 0)');
    for(i in boardState[key]){
        $(boardState[key][i]).css('background-color',colorState[key][i]);
    }
    
});

$('#btn3').click(function(){ // Forward button
    if(stateCount>0){ // Checking if the game has been reversed atall.
        stateCount -= 1;
        var lastKey = Object.keys(boardState).length-1;
        var key = lastKey-stateCount;
        $('.stone').css('background-color','rgba(0, 0, 0, 0)');
        for(i in boardState[key]){
            $(boardState[key][i]).css('background-color',colorState[key][i]);
        }
    }
    if(stateCount===0){
        reverseMode=false;
    }
    
});

/////  FUNCTIONS /////////////////////

function logger(msg,obj){
    return console.log(msg, JSON.parse(JSON.stringify(obj)));
}


function logger1(msg,obj){
    return console.log(msg, obj);
}

function isKo(boardState,maintainBoardstate,current,opponentGrp){
    var lastKey = maintainBoardstate(boardState,current);
    for(let member of boardState[lastKey]){
        if($(member).attr('class').replace('stone ','')===opponentGrp){
            temp= boardState[lastKey].indexOf(member);
            boardState[lastKey].splice(temp,1);
            colorState[lastKey].splice(temp,1);
        }
    } 

    for(let i=lastKey-1; i>=0; i--){  // iterates through the state object 
        if(boardState[i].length === boardState[lastKey].length){  // checks if the number of stones in a given boardstate are same as current state.
            let koCounter = 0;
            for(let j of boardState[i]){  // comparing stones of current and given board state
                for(let k of boardState[lastKey]){
                    if(j===k && i%2 === lastKey%2){ // modulus operator on key tells whether the key is even or odd which in turn indicates who's turn it was
                        koCounter +=1;
                        if(koCounter===boardState[i].length){
                            alert('Ko! with board position after move number: '+ i);
                            delete boardState[lastKey];
                            delete colorState[lastKey];
                            return true;
                        }
                    }
                }
            }
        }
    }
    delete boardState[lastKey];
    delete colorState[lastKey];
    return false;

}

function maintainBoardstate(boardState,current){
    boardState[Object.keys(boardState).length]=[];
    colorState[Object.keys(colorState).length]=[];
    var lastKey = Object.keys(boardState).length-1;
    $.extend(boardState[lastKey],boardState[lastKey-1]);
    for(member of boardState[lastKey]){
        if($(member).attr('class')==='stone initial'){
            boardState[lastKey].splice(boardState[lastKey].indexOf(member),1);
        }
    }
    boardState[lastKey].push(current);
    for(member of boardState[lastKey]){
        colorState[lastKey].push($(member).css('background-color'));
    }

    return lastKey;
}

function neighbourStones(node){ // returns neighbour intersections of a node
    var neighbours=[];
    var nodeIndex;
    var parentRow = $(node).closest('.row').find('.stone');
    // neighbours in same row
    $.each(parentRow, function(index, value){
        if(value===node){
            neighbours[3] = $(parentRow[index-1])[0];
            neighbours[1] = $(parentRow[index+1])[0];
            nodeIndex = index;   
        }
    });

    // neighbours in preceding and succeeding row
    var rowList = $('.grid').find('.row');
    $.each(rowList, function(index, value){ 
        if(value===node.closest('.row')){
            neighbours[0] = $($(rowList[index-1]).find('.stone'))[nodeIndex];
            neighbours[2] = $($(rowList[index+1]).find('.stone'))[nodeIndex];
                
        }      
    });
    for(let neighbour of neighbours){
        if(typeof($(neighbour).attr('class'))==='undefined'){
            neighbours.splice(neighbours.indexOf(neighbour),1);
        }
    }
    return neighbours;
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

// function scoring(neighbourStones,groupNeighbours){
//     var classNumber = 0;
//     $('.'+'initial').each(function(index,value){
//         white=false;
//         black=false;
//         var rejected=[];
//         classNumber += 1;
//         $(value).attr('class','stone '+classNumber.toString());
//         // var chunk = groupNeighbours($(value).attr('class'),neighbourStones);
//         var chunk = neighbourStones(value);
//         for(member of chunk){
//             if($(member).css('background-color')!='rgba(0, 0, 0, 0)'){
//                 rejected.push($(member).css('background-color'));
//                 chunk.splice(chunk.indexOf(member),1);
//             }
//             else{
//                 $(member).attr('class','stone '+classNumber.toString());
//             }
//             chunk.push(...groupNeighbours(classNumber.toString(),neighbourStones));
//         }
      

//         for(member of rejected){
//             if(member === 'rgb(0, 0, 0)'){
//                 black = true;
//             }
//             else{
//                 white = true;
//             }
//         }

//         if(white===true && black===false){
//             $('.'+classNumber.toString()).css('background-color','rgba(255, 255, 255, 0.5)')
//         }

//         else if(white===false && black===true){
//             $('.'+classNumber.toString()).css('background-color','rgba(0, 0, 0, 0.5)');
//         }
//         return;
//     });
    
// }
/////////////////////////////////

