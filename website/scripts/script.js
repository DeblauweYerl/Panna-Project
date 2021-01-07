'use strict';
let naam, button;
const lanIP = `${window.location.hostname}:5500`;
const socketio = io(lanIP);



const loadSocketListeners = function () {
    console.log("done")
    socketio.on("message",function(msg){
     print("printing message from backend")
     document.querySelector('.js-messages').innerHTML+= `${msg}<br>`;
    });
    socketio.on('B2F_client_connected',function(msg){
      print(`Server Responded:${msg}`)
      
    });
  
  };

const checkValues = function () {
    console.log('kiesak');
  
        if (naam.value.length >0 && naam.value.length <= 14) {
            button.disabled = false;
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
    });