'use strict';
let playername, button;
const lanIP = `${window.location.hostname}:5010`; //ip adres automatisch opvragen met ${window.location.hostname}
const socketio = io(lanIP);
let scoreboard_select, scoreboard_moeilijkheidgraad, btn_start_singleplayer, singleplayer_naam, singleplayer_moeilijkheidgraad, btn_stop_singleplayer,end_singleplayer_text, btn_start_multiplayer, btn_stop_multiplayer, multiplayer_winner, playername1, playername2, btnMultiplayer;
let singleplayer_tijd=0;

//custom game mode buttons
let btn_custom_stop, btn_custom_1, btn_custom_2, btn_custom_3 ,btn_custom_4, btn_custom_5, btn_custom_6, btn_custom_7, btn_custom_8;


//LISTEN TO PAGES
const listenToSingleplayer=function(){
    handleData("http://127.0.0.1:5000/api/scoreboard/0", loadScoreboard);
    btn_start_singleplayer.addEventListener("click", function() {
        //singleplayer starten
        singleplayer_naam= document.querySelector(".js-playername").value;
        singleplayer_moeilijkheidgraad= document.getElementById("js-singleplayer-select").options[document.getElementById("js-singleplayer-select").selectedIndex].value;
        socketio.emit("F2B_start_singleplayer", {sp_name: singleplayer_naam, sp_difficulty: singleplayer_moeilijkheidgraad});
        console.log(singleplayer_moeilijkheidgraad);

        if (singleplayer_moeilijkheidgraad == "-1"){
            window.location.href="customGameMode.html";
        }
        else{
            window.location.href="singleplayerGame.html";
        }
    });
    scoreboard_select.addEventListener("click", function() {
        scoreboard_moeilijkheidgraad= document.getElementById("js-singleplayer-select").options[document.getElementById("js-singleplayer-select").selectedIndex].value;
        console.log(scoreboard_moeilijkheidgraad);
        handleData(`http://127.0.0.1:5000/api/scoreboard/${scoreboard_moeilijkheidgraad}`, loadScoreboard);
    });
};

const listenToSingleplayerGame=function(){
    btn_stop_singleplayer.addEventListener("click", function() {
        window.location.href=`singleplayer.html`;
        socketio.emit('F2B_stop_game');
    });
};

const listenToCustomGameMode= function(){
    btn_custom_1.addEventListener("click", function() {
        socketio.emit("F2B_ledselection", {led: 0});
    });
    btn_custom_2.addEventListener("click", function() {
        socketio.emit("F2B_ledselection", {led: 1});
    });
    btn_custom_3.addEventListener("click", function() {
        socketio.emit("F2B_ledselection", {led: 2});
    });
    btn_custom_4.addEventListener("click", function() {
        socketio.emit("F2B_ledselection", {led: 3});
    });
    btn_custom_5.addEventListener("click", function() {
        socketio.emit("F2B_ledselection", {led: 4});
    });
    btn_custom_6.addEventListener("click", function() {
        socketio.emit("F2B_ledselection", {led: 5});
    });
    btn_custom_7.addEventListener("click", function() {
        socketio.emit("F2B_ledselection", {led: 6});
    });
    btn_custom_8.addEventListener("click", function() {
        socketio.emit("F2B_ledselection", {led: 7});
    });
    btn_custom_stop.addEventListener("click", function() {
        socketio.emit("F2B_custom_stop");
        window.location.href=`singleplayer.html`;
    });
};

const listenToEndgameSingleplayer= function(){
    const urlParams = new URLSearchParams(window.location.search);
    const time = urlParams.get('time');
    document.querySelector('.js-end-time').innerHTML = `Je hebt het spel voltooid in ${time}`
    socketio.emit("F2B_end_singleplayer", {time: time});
};

const listenToScoreboard= function(){
    scoreboard_select.addEventListener("click", function() {
        scoreboard_moeilijkheidgraad= document.getElementById("js-scoreboard-select").options[document.getElementById("js-scoreboard-select").selectedIndex].value;
        console.log(scoreboard_moeilijkheidgraad);
        handleData(`http://127.0.0.1:5000/api/scoreboard/${scoreboard_moeilijkheidgraad}`, loadScoreboard);
    });
};

const loadScoreboard = function(jsonObject){
    console.log(jsonObject)
    let position = 1;
    for(const element of jsonObject){
        elementenHTML+=
        `<tr>
            <td>${position}</td>
            <td>${element.name}</td>
            <td>${element.time}</td>
        </tr>`;
        position++;
    };
    document.querySelector('.js-scoreboard').innerHTML=elementenHTML;
};


const listenToMultiplayer = function () {
    btn_start_multiplayer.addEventListener('click', function(){
        const player1_name = document.querySelector('.js-player1-name').value;
        const player2_name = document.querySelector('.js-player2-name').value;
        socketio.emit('F2B_start_multiplayer', {player1_name: player1_name, player2_name: player2_name});
        window.location.href=`startMultiplayer.html?player1=${player1_name}&player2=${player2_name}`;
    });
};
const listenToMultiplayerGame = function () {
    const urlParams = new URLSearchParams(window.location.search);
    document.querySelector('.js-player1-name').innerHTML = urlParams.get('player1');
    document.querySelector('.js-player2-name').innerHTML = urlParams.get('player2');
    let html_player1_score = document.querySelector('.js-player1-score');
    let html_player2_score = document.querySelector('.js-player2-score');
    btn_stop_multiplayer.addEventListener('click', function(){
        socketio.emit('F2B_stop_game');
        window.location.href=`multiplayer.html`;
    });
    socketio.on('B2F_multiplayer_score', function(data) {
        console.log(`score: ${data.team} ${data.score}`)
        let team = data.team;
        let score = data.score;
        if(team == 'red'){
            html_player1_score.innerHTML = score;
        }
        else if(team == 'blue'){
            html_player2_score.innerHTML = score;
        };
    });
    socketio.on('B2F_multiplayer_end', function(data) {
        let winner = data.winner;
        window.location.href=`winnerMultiplayer.html?winner=${winner}`
    });
};
const listenToEndgameMultiplayer = function() {
    const urlParams = new URLSearchParams(window.location.search);
    document.querySelector('.js-winner').innerHTML = urlParams.get('winner');
};

const loadSocketListeners = function () {

    socketio.on('B2F_client_connected',function(msg){
      console.log(`Server Responded:${msg}`);
    });

    socketio.on('B2F_stop_game',function(msg){
        console.log(`game stoppen`);
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

const checkValuesMultiplayer = function () {
    if (playername1.value.length >0 && playername1.value.length <= 14 && playername2.value.length >0 && playername2.value.length <= 14) {
        btn_start_multiplayer.disabled = false;
        //word meerdere keren opgeroepen door input
    } else {
        btn_start_multiplayer.disabled = true;
    }
};

const eventListenersToevoegen = function () {
    playername.addEventListener('input', checkValues);
};

const eventListenersToevoegenMP = function () {
    playername1.addEventListener('input', checkValuesMultiplayer);
    playername2.addEventListener('input', checkValuesMultiplayer);
};

const init = function () {
    button = document.querySelector('input[type=button]');

    //singleplayer
    btn_start_singleplayer = document.querySelector('.js-start-singleplayer');
    btn_stop_singleplayer = document.querySelector('.js-stop-game-singleplayer');
    end_singleplayer_text = document.querySelector('.js-end-time');
    scoreboard_select = document.querySelector(".select-selected");

    //multiplayer
    btn_start_multiplayer = document.querySelector('.js-start-multiplayer');
    btn_stop_multiplayer = document.querySelector('.js-stop-multiplayer');
    multiplayer_winner = document.querySelector('.js-winner')

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
        playername = document.querySelector('.js-playername');
       
        button.disabled=true;
        eventListenersToevoegen();
        listenToSingleplayer(playername);
    }
    else if(btn_stop_singleplayer!=null){
        listenToSingleplayerGame();
    }
    else if(end_singleplayer_text!=null){
        listenToEndgameSingleplayer();
    }
    else if(btn_custom_1!=null){
        listenToCustomGameMode();
    }
    else if(btn_start_multiplayer!=null){
        btn_start_multiplayer.disabled = true;
        playername1 = document.querySelector('.js-player1-name');
        playername2 = document.querySelector('.js-player2-name');
        eventListenersToevoegenMP()
        listenToMultiplayer();
    }
    else if(btn_stop_multiplayer!=null){
        listenToMultiplayerGame();
    }
    else if(multiplayer_winner!=null){
        listenToEndgameMultiplayer();
    }
    else if(scoreboard_select!=null){
        listenToScoreboard();
    }
    
};

document.addEventListener('DOMContentLoaded', function () {
    console.info("DOM content is loaded")
    init();
});