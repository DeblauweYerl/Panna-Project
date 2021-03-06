'use strict';
let playername, button;
const lanIP = `${window.location.hostname}:5010`; //ip adres automatisch opvragen met ${window.location.hostname}
const socketio = io(lanIP);
let scoreboard_select, scoreboard_moeilijkheidgraad,
btn_start_singleplayer, singleplayer_naam, singleplayer_moeilijkheidgraad = 0, btn_stop_singleplayer, end_singleplayer_text, html_position,
btn_start_multiplayer, btn_stop_multiplayer, multiplayer_winner, playername1, playername2,
btn_custom_stop, btns_custom;

let singleplayer_tijd=0;



//LISTEN TO PAGES
const listenToSingleplayer=function(){
    socketio.on('B2F_scoreboard_data', function(data) {
        loadScoreboard(data);
    });
    socketio.emit("F2B_request_scoreboard", {version: "limited", difficulty: "0"});
    btn_start_singleplayer.addEventListener("click", function() {
        //singleplayer starten
        singleplayer_naam = document.querySelector(".js-playername").value;
        singleplayer_moeilijkheidgraad= document.getElementById("js-singleplayer-select").options[document.getElementById("js-singleplayer-select").selectedIndex].value;

        if (singleplayer_moeilijkheidgraad == "-1"){
            socketio.emit("F2B_start_training");
            window.location.href="customGameMode.html";
        }
        else {
            socketio.emit("F2B_start_singleplayer", {sp_name: singleplayer_naam, sp_difficulty: singleplayer_moeilijkheidgraad});
            window.location.href=`singleplayerGame.html?name=${singleplayer_naam}&diff=${singleplayer_moeilijkheidgraad}`;
        };
    });
    scoreboard_select.addEventListener("click", function() {
        singleplayer_moeilijkheidgraad = document.getElementById("js-singleplayer-select").options[document.getElementById("js-singleplayer-select").selectedIndex].value;
        if(singleplayer_moeilijkheidgraad != "-1"){
            socketio.emit("F2B_request_scoreboard", {version: "limited", difficulty: singleplayer_moeilijkheidgraad});
        }
        else {
            document.querySelector(".js-scoreboard").innerHTML = "<tr><td>Geen scorebord beschikbaar</td></tr>"
        };
    });
};

const listenToSingleplayerGame=function(){
    const urlParams = new URLSearchParams(window.location.search);
    const diff = urlParams.get('diff');
    const name = urlParams.get('name');
    btn_stop_singleplayer.addEventListener("click", function() {
        window.location.href=`singleplayer.html`;
        socketio.emit('F2B_stop_game');
    });
    socketio.on('B2F_stop_game',function(msg){
        console.log(`game stoppen`);
        // tijd ophalen van de timer
        singleplayer_tijd = document.querySelector(".js-time").textContent;
        console.log(singleplayer_tijd);
        socketio.emit("F2B_end_singleplayer", {time: singleplayer_tijd});
        // navigeren naar endgameSingleplayer.html
        window.location.href=`endgameSingleplayer.html?name=${name}&diff=${diff}&time=${singleplayer_tijd}`;
    });
};

const listenToEndgameSingleplayer= function(){
    const urlParams = new URLSearchParams(window.location.search);
    const diff = urlParams.get('diff');
    const time = urlParams.get('time');
    const name = urlParams.get('name');
    document.querySelector('.js-end-time').innerHTML = `Je hebt het spel voltooid in ${time}`
    socketio.emit("F2B_request_scoreboard", {version: "targeted", difficulty: diff, name: name, time: time})
    socketio.on('B2F_scoreboard_data', function(data) {
        console.log(data)
        loadScoreboard(data, data[0].position+1)
        html_position.innerHTML = data[0].position_general
    });
};

const listenToCustomGameMode= function(){
    console.log(btns_custom);
    socketio.emit("F2B_start_training");
    for(let btn of btns_custom){
        btn.addEventListener("click", function() {
            socketio.emit("F2B_activate_base", {base: btn.value});
            console.log(btn.value);
        });
    };

    btn_custom_stop.addEventListener("click", function() {
        socketio.emit("F2B_stop_game");
        window.location.href=`singleplayer.html`;
    });
};

const listenToScoreboard= function(){
    socketio.emit("F2B_request_scoreboard", {version: "full", difficulty: "0"});
    socketio.on('B2F_scoreboard_data', function(data) {
        loadScoreboard(data);
    });
    scoreboard_select.addEventListener("click", function() {
        scoreboard_moeilijkheidgraad = document.getElementById("js-scoreboard-select").options[document.getElementById("js-scoreboard-select").selectedIndex].value;
        console.log(scoreboard_moeilijkheidgraad);
        socketio.emit("F2B_request_scoreboard", {version: "full", difficulty: scoreboard_moeilijkheidgraad});
    });
};

const loadScoreboard = function(jsonObject, position = 1){
    console.log(jsonObject)
    let records = ''
    if(jsonObject.length != 0) {
        for(const element of jsonObject){
            records +=
            `<tr>
                <td>${position}</td>
                <td>${element.PlayerName}</td>
                <td>${element.Time}</td>
            </tr>`;
            position++;
        };
    }
    else {
        records = "<tr><td>Geen scorebord beschikbaar</td></tr>";
    };
    document.querySelector('.js-scoreboard').innerHTML = records;
};


const listenToMultiplayer = function () {
    btn_start_multiplayer.addEventListener('click', function(){
        const player1_name = document.querySelector('.js-player1-name').value;
        const player2_name = document.querySelector('.js-player2-name').value;
        socketio.emit('F2B_start_multiplayer', {player1_name: player1_name, player2_name: player2_name});
        window.location.href=`startMultiplayer.html?player1=${player1_name}&player2=${player2_name}`;
    });
    playername1.addEventListener('input', checkValuesMultiplayer);
    playername2.addEventListener('input', checkValuesMultiplayer);
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
    socketio.on('B2F_stop_game', function(data) {
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

    //custom game mode
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
        html_position = document.querySelector('.js-position')
        listenToEndgameSingleplayer();
    }
    else if(btn_custom_stop!=null){
    btns_custom = document.querySelectorAll('.js-btn-base');
        listenToCustomGameMode();
    }
    else if(btn_start_multiplayer!=null){
        btn_start_multiplayer.disabled = true;
        playername1 = document.querySelector('.js-player1-name');
        playername2 = document.querySelector('.js-player2-name');
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
    console.info("DOM content is loaded");
    init();
});