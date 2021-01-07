from RPi import GPIO
import time
import random
import threading

from models.Led import Led
from models.Button import Button
from models.Base import Base
from flask import Flask, render_template, json, request
from flask_socketio import SocketIO,send,emit

GPIO.setmode(GPIO.BCM)


leds = [Led([26, 19]), Led([13, 6]), Led([21, 20]), Led([16, 12])]
buttons = [Button(10), Button(22), Button(24), Button(23)]
bases = []
for led in leds:
    GPIO.output(led.pins, 0)
    bases.append(Base(led, buttons[leds.index(led)]))
    
time_score = 0
playing = 0

def timer():
    global time_score
    while playing:
        start = round(time.time(), 8)
        time_score = round(time.time(), 8) - start


def singleplayer(total_bases, player_name):
    global playing
    timer_thread = threading.Thread(target=timer)
    timer_thread.start()

    bases_completed = 0
    while(bases_completed <= total_bases):
        current_base = bases[random.randint(0, 3)]
        current_base.activate()
        current_base.check_for_hit()
        bases_completed += 1
    playing = False
    print(f"finished with time: {time_score}")

def multiplayer(player1_name, player2_name):
    global playing
    for base in bases[0:2]:
        base.activate('red')
    for base in bases[2:4]:
        base.activate('blue')

    result = " "
            
    while result == " ":
        if bases[0].active==False and bases[1].active==False:
            result="blue"
            print(f"{player2_name} won!")
        if bases[2].active==False and bases[3].active==False:
            result="red"
            print(f"{player1_name} won!")
    playing = False
    deactivate_all_bases()

def deactivate_all_bases():
    for base in bases:
        base.deactivate()


def game(gamemode, difficulty="easy"):
    global playing
    playing = True
    if gamemode == "mp":
        player1_name = str(input("Whats the name of player 1 \n"))
        player2_name = str(input("Whats the name of player 2 \n"))
        mp = threading.Thread(target=multiplayer, args=[player1_name, player2_name])
        mp.start()
    if gamemode == "sp":
        player_name = str(input("Whats the name of the player \n"))
        if difficulty == "easy":
            sp = threading.Thread(target=singleplayer, args=[10, player_name])
        if difficulty == "normal":
            sp = threading.Thread(target=singleplayer, args=[15, player_name])
        if difficulty == "hard":
            sp = threading.Thread(target=singleplayer, args=[20, player_name])
        sp.start()


try:
    while True:
        if playing == False:
            gamemode = input("sp of mp?: ")
            difficulty = ""
            if gamemode == 'sp':
                difficulty = input("easy, normal of hard?: ")
            game(gamemode, difficulty)

except KeyboardInterrupt:
    print("\nManually stopped program")

finally:
    GPIO.cleanup()