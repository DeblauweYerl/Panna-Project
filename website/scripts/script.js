'use strict';
let naam, button;
const lanIP = `${window.location.hostname}:5010`; //ip adres automatisch opvragen met ${window.location.hostname}
const socketio = io(lanIP);
let btn_start_singleplayer, singleplayer_naam, moeilijkheidgraad;



const listenToClick=function(){
    btn_start_singleplayer.addEventListener("click", function() {
    console.log("singleplayer starten");
    singleplayer_naam= document.querySelector(".js_singleplayer_naam").value;
    
    
    // moeilijkheidgraad=
    socketio.emit("F2B_start_singleplayer", {sp_naam: singleplayer_naam});
    setTimeout(1000);
    })
}



const loadSocketListeners = function () {
    console.log("done")
    socketio.on("message",function(msg){
     console.log("printing message from backend")
     document.querySelector('.js-messages').innerHTML+= `${msg}<br>`;
    });
    socketio.on('B2F_client_connected',function(msg){
      console.log(`Server Responded:${msg}`)
      
    });
};

const checkValues = function () {
    console.log('kiesak');
  
    if (naam.value.length >0 && naam.value.length <= 14) {
        button.disabled = false;
        listenToClick()
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
    loadSocketListeners()
    button.disabled = 'disabled';
    eventListenersToevoegen();
};

document.addEventListener('DOMContentLoaded', function () {
    init();
    btn_start_singleplayer = document.querySelector('.js-start-singleplayer');
});