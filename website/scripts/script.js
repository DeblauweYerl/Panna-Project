'use strict';
let naam, button;

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
    
        button.disabled = 'disabled';
        eventListenersToevoegen();
    };

    document.addEventListener('DOMContentLoaded', function () {
        init();
    });