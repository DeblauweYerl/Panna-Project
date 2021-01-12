'use strict';
let playername, button;
const lanIP = `${window.location.hostname}:5010`; //ip adres automatisch opvragen met ${window.location.hostname}
const socketio = io(lanIP);
let btn_start_singleplayer, singleplayer_naam, singleplayer_moeilijkheidgraad, btn_stop_singleplayer,end_singleplayer_text, btn_start_multiplayer, btn_stop_multiplayer;
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
// const loadScoreboard = function(jsonObject){
//     console.log(jsonObject)
//     for(const element of jsonObject){
//         elementenHTML+=
//         `<tr>
//             <td>${element.index}</td>
//             <td>${element.name}</td>
//             <td>${element.time}</td>
//         </tr>`
//         ;
//     }
//     document.querySelector('.js-scoreboard').innerHTML=elementenHTML;
// }


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
        //hier moet nog een socketio emit om het spel in de backend te stoppen
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
    console.log('init')
    button = document.querySelector('input[type=button]');
    btn_start_singleplayer = document.querySelector('.js-start-singleplayer');
    btn_stop_singleplayer = document.querySelector('.js-stop-game-singleplayer');
    btn_start_multiplayer = document.querySelector('.js-start-multiplayer')
    btn_stop_multiplayer = document.querySelector('.js-stop-multiplayer')
    end_singleplayer_text = document.querySelector('.js-end-time')
    loadSocketListeners();
    // loadScoreboard();
    if(btn_start_singleplayer!=null){
        playername = document.querySelector('.js-playername');
        button.disabled=true;
        eventListenersToevoegen();
        listenToSingleplayer(playername);
        console.log('1')
    }
    else if(btn_stop_singleplayer!=null){
        listenToSingleplayerGame();
        console.log('2')
    }
    else if(end_singleplayer_text!=null){
        listenToEndgameSingleplayer();
        console.log('3')
    }
    else if(btn_start_multiplayer!=null){
        listenToMultiplayer();
        console.log('4')
    }
    else if(btn_stop_multiplayer!=null){
        listenToMultiplayerGame();
        console.log('5')
    }
};

document.addEventListener('DOMContentLoaded', function () {
    console.info("DOM content is loaded")
    init();
});