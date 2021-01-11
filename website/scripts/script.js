'use strict';
let playername, button;
const lanIP = `${window.location.hostname}:5010`; //ip adres automatisch opvragen met ${window.location.hostname}
const socketio = io(lanIP);
let btn_start_singleplayer, singleplayer_naam, singleplayer_moeilijkheidgraad, btn_stop_singleplayer,end_singleplayer_text;
let singleplayer_tijd=0;

const listenToSingleplayer=function(){

    btn_start_singleplayer.addEventListener("click", function() {
        //singleplayer starten
        singleplayer_naam= document.querySelector(".js_singleplayer_naam").value;
        singleplayer_moeilijkheidgraad= document.getElementById("js-singleplayer-select").options[document.getElementById("js-singleplayer-select").selectedIndex].value;
        socketio.emit("F2B_start_singleplayer", {sp_name: singleplayer_naam, sp_difficulty: singleplayer_moeilijkheidgraad});
        console.log(singleplayer_moeilijkheidgraad);
        window.location.href="singleplayerGame.html";
    })  
};


const listenToSingleplayerGame=function(){
    console.log("test");
    btn_stop_singleplayer.addEventListener("click", function() {
        // navigeren naar endgameSingleplayer.html
        singleplayer_tijd = document.querySelector(".time").textContent;
        console.log(singleplayer_tijd);
        window.location.href=`endgameSingleplayer.html?time=${singleplayer_tijd}`;
    })  
};

const listenToEndgameSingleplayer= function(){
    const urlParams = new URLSearchParams(window.location.search);
    const time = urlParams.get('time');
    document.querySelector('.js-end-time').innerHTML = `Je hebt het spel voltooid in ${time}`
    socketio.emit("F2B_end_singleplayer", {time: time});
}

const loadSocketListeners = function () {
    socketio.on("message",function(msg){
     console.log("printing message from backend");
     document.querySelector('.js-messages').innerHTML+= `${msg}<br>`;
    });

    socketio.on('B2F_client_connected',function(msg){
      console.log(`Server Responded:${msg}`);
    });

    socketio.on('B2F_stop_game',function(msg){
        console.log(`game stoppen`);
        // tijd stoppen
        document.getElementById("pauseButton").click(); // Click on the button to stop
        // tijd ophalen van de timer
        singleplayer_tijd = document.querySelector(".time").textContent;
        console.log(singleplayer_tijd);
        socketio.emit("F2B_end_singleplayer", {time: singleplayer_tijd});

        // navigeren naar endgameSingleplayer.html
        window.location.href=`endgameSingleplayer.html?time=${singleplayer_tijd}`;
    });
};

const checkValues = function () {
    if (playername.value.length >0 && playername.value.length <= 14) {
        button.disabled = false;
        //word meerdere keren opgeroepen door input
        
    } else {
        button.disabled = true;
    }
};

const eventListenersToevoegen = function () {
    playername.addEventListener('input', checkValues);
};

const init = function () {
    button = document.querySelector('input[type=button]');
    btn_start_singleplayer = document.querySelector('.js-start-singleplayer');
    btn_stop_singleplayer = document.querySelector('.js-stop-game-singleplayer');
    end_singleplayer_text = document.querySelector('.js-end-time')
    loadSocketListeners();
    
    if(btn_start_singleplayer!=null){
        playername = document.querySelector('.js-playername');
        button.disabled=true;
        eventListenersToevoegen();
        listenToSingleplayer(playername);
    }
    if(btn_stop_singleplayer!=null){
        listenToSingleplayerGame();
    }
    if(end_singleplayer_text!=null){
        listenToEndgameSingleplayer();
    }
};

document.addEventListener('DOMContentLoaded', function () {
    init();
});