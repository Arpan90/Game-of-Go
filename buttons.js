$('#btn1').click(function(){ // Pass button
    if(pass === false || Object.keys(states).length === 1){ // if the Pass button has not been clicked twice consecutively and no player has made a move
        if($('#move').html() === 'Black to move'){
            $('#move').html('White to move');
        }
        else{
            $('#move').html('Black to move');
        }
        pass = true;
    }

    else if(pass === true && Object.keys(states).length > 1){ // if the Pass button has been clicked twice consecutively.
        $('.btn').hide();
        $('#btn4').show();
        $('#btn5').show();
        $('#btn6').show();
        $('#move').hide();
        deadDeletion = true;
        alert('Click on the stones you consider dead in order to remove them.');
    }
    
});


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
    if(reverseMode === true){ // Checking if the game has been reversed atall. (reverseMode = true) helps blocking the game play while past states of the game are being viewed.
        stateCount -= 1;
        var lastKey = Object.keys(states).length-1;
        var key = lastKey-stateCount;
        revertState(key);
    }
    if(stateCount===0){
        reverseMode=false;
    }
    
});

$('#btn4').click(function(){ // Resume button to resume game from a previous saved state
    deadDeletion = false;
    pass = false ;
    $('.btn').show();
    $('#btn6').hide();
    $('#move').show();
    reverseMode=false;
    var lastKey = Object.keys(states).length-1;
    var key = lastKey-stateCount;
    stateCount = 0;
    for(i in states){
        if(i>key){
            delete states[i];
        }
    }
});

$('#btn5').click(function(){ // Restart button
    console.clear();
    initializeMap();
    // location.reload();
});

$('#btn6').click(function(){ 
    deadDeletion = false;
    $("#btn4").hide();
    scoring();
});
