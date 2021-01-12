'use strict';
let naam, button;
const lanIP = `${window.location.hostname}:5010`; //ip adres automatisch opvragen met ${window.location.hostname}
const socketio = io(lanIP);
let btn_start_singleplayer, singleplayer_naam, singleplayer_moeilijkheidgraad, btn_stop_singleplayer,end_singleplayer_text;
let singleplayer_tijd=0;

//custom game mode buttons
let btn_custom_stop, btn_custom_1, btn_custom_2, btn_custom_3 ,btn_custom_4, btn_custom_5, btn_custom_6, btn_custom_7, btn_custom_8;


//LISTEN TO PAGES
const listenToSingleplayer=function(){

    btn_start_singleplayer.addEventListener("click", function() {
        //singleplayer starten
        singleplayer_naam= document.querySelector(".js_singleplayer_naam").value;
        singleplayer_moeilijkheidgraad= document.getElementById("js-singleplayer-select").options[document.getElementById("js-singleplayer-select").selectedIndex].value;
        socketio.emit("F2B_start_singleplayer", {sp_naam: singleplayer_naam, sp_moeilijkheidsgraad: singleplayer_moeilijkheidgraad});
        console.log(singleplayer_moeilijkheidgraad);

        if (singleplayer_moeilijkheidgraad == "Aangepast"){
            window.location.href="customGameMode.html";
        }
        else{
            window.location.href="singleplayerGame.html";
        }
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

const listenToCustomGameMode= function(){
    btn_custom_1.addEventListener("click", function() {
        socketio.emit("F2B_ledselection", {led: 0});
    })  
    btn_custom_2.addEventListener("click", function() {
        socketio.emit("F2B_ledselection", {led: 1});
    })  
    btn_custom_3.addEventListener("click", function() {
        socketio.emit("F2B_ledselection", {led: 2});
    })  
    btn_custom_4.addEventListener("click", function() {
        socketio.emit("F2B_ledselection", {led: 3});
    })  
    btn_custom_5.addEventListener("click", function() {
        socketio.emit("F2B_ledselection", {led: 4});
    })  
    btn_custom_6.addEventListener("click", function() {
        socketio.emit("F2B_ledselection", {led: 5});
    })  
    btn_custom_7.addEventListener("click", function() {
        socketio.emit("F2B_ledselection", {led: 6});
    })  
    btn_custom_8.addEventListener("click", function() {
        socketio.emit("F2B_ledselection", {led: 7});
    }) 
    btn_custom_stop .addEventListener("click", function() {
        socketio.emit("F2B_custom_stop");
        window.location.href=`singleplayer.html`;
    }) 
}

const listenToEndgameSingleplayer= function(){
    const urlParams = new URLSearchParams(window.location.search);
    const tijd = urlParams.get('time');
    console.log(tijd);
    document.querySelector('.js-end-time').innerHTML = `Je hebt het spel voltooid in ${tijd}`
    socketio.emit("F2B_tijd", {sp_tijd: tijd});
}




const loadScoreboard = function(jsonObject){
    console.log(jsonObject)
    for(const element of jsonObject){
        elementenHTML+= 
        `<tr>
            <td>${element.index}</td>
            <td>${element.name}</td>
            <td>${element.time}</td>
        </tr>`
        ;
    }
    document.querySelector('.js-scoreboard').innerHTML=elementenHTML;
}



const loadSocketListeners = function () {
    socketio.on("message",function(msg){
     console.log("printing message from backend");
     document.querySelector('.js-messages').innerHTML+= `${msg}<br>`;
    });

    socketio.on("B2F_scoreboard",function(jsonObject){
        console.log("Getting json of scoreboard")
        loadScoreboard(jsonObject)
       })

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
        socketio.emit("F2B_tijd", {sp_tijd: singleplayer_tijd});

        // navigeren naar endgameSingleplayer.html
        window.location.href=`endgameSingleplayer.html?time=${singleplayer_tijd}`;
    });
};

const checkValues = function () {
    if (naam.value.length >0 && naam.value.length <= 14) {
        button.disabled = false;
        //word meerdere keren opgeroepen door input
        
    } else {
        button.disabled = true;
    }
};

const eventListenersToevoegen = function () {
    naam.addEventListener('input', checkValues);
};

const init = function () {
    naam = document.querySelector('#name');
    button = document.querySelector('input[type=button]');
    btn_start_singleplayer = document.querySelector('.js-start-singleplayer');
    btn_stop_singleplayer = document.querySelector('.js-stop-game-singleplayer');
    end_singleplayer_text = document.querySelector('.js-end-time')

    //custom game mode buttons
    btn_custom_1 = document.querySelector('.js-btn-1');
    btn_custom_2 = document.querySelector('.js-btn-2');
    btn_custom_3 = document.querySelector('.js-btn-3');
    btn_custom_4 = document.querySelector('.js-btn-4');
    btn_custom_5 = document.querySelector('.js-btn-5');
    btn_custom_6 = document.querySelector('.js-btn-6');
    btn_custom_7 = document.querySelector('.js-btn-7');
    btn_custom_8 = document.querySelector('.js-btn-8');
    btn_custom_stop = document.querySelector('.js-stop-game'); 

    loadSocketListeners();
    if(btn_start_singleplayer!=null){
        button.disabled=true;
        eventListenersToevoegen();
        listenToSingleplayer();
    }
    if(btn_stop_singleplayer!=null){
        listenToSingleplayerGame();
    }
    if(end_singleplayer_text!=null){
        listenToEndgameSingleplayer();
    }
    if(btn_custom_1!=null){
        listenToCustomGameMode();
    }

};

document.addEventListener('DOMContentLoaded', function () {
    init();
});