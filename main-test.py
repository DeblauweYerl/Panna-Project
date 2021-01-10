from RPi import GPIO
import time
import random
import threading
from datetime import datetime
from datetime import timedelta
from flask import Flask, render_template, json, request, jsonify
from flask_socketio import SocketIO,send,emit
from flask_cors import CORS

from models.Led import Led
from models.Button import Button
from models.Base import Base
from database.repositories.Datarepository import DataRepository

GPIO.setmode(GPIO.BCM)

leds = [Led([26, 19]), Led([18, 6]), Led([21, 20]), Led([16, 12])]
buttons = [Button(10), Button(22), Button(24), Button(23)]
bases = []
for led in leds:
    GPIO.output(led.pins, 0)
    bases.append(Base(led, buttons[leds.index(led)]))
    
time_score = 0
playing = 0

app = Flask(__name__)
app.config['SECRET_KEY']="supergeheimesleuteldaniemandmagweten6"
socketio=SocketIO(app, cors_allowed_origins='*')

@socketio.on('connect')
def connect_message():
    print('client connected')
    clientid=request.sid
    emit("B2F_client_connected", clientid, broadcast=False)

@socketio.on('F2B_start_singleplayer')
def start_singleplayer(player_name, difficulty):
    singleplayer(difficulty, player_name)

@socketio.on('F2B_start_multiplayer')
def start_multiplayer(player1_name, player2_name):
    print(f"er word een like aangevraagd")

# @socketio.on('F2B_request_scoreboard')
# def request_scoreboard(gamemode, difficulty):
#     DataRepository



def timer():
    global time_score
    start = round(time.time(), 8)
    while playing:
        time_score = round(time.time(), 8) - start


def singleplayer(difficulty, player_name):
    global playing
    timer_thread = threading.Thread(target=timer)
    timer_thread.start()

    total_bases = 10 + (difficulty * 5)
    bases_completed = 0
    while(bases_completed <= total_bases):
        current_base = bases[random.randint(0, 3)]
        current_base.activate()
        current_base.check_for_hit()
        bases_completed += 1
    # DataRepository.insert_game(datetime.now(), player_name, time_score, difficulty)
    print(f"\nfinished with time: {time_score}")
    playing = False


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


def game(gamemode, difficulty=0):
    global playing
    playing = True
    if gamemode == "mp":
        player1_name = str(input("Whats the name of player 1 \n"))
        player2_name = str(input("Whats the name of player 2 \n"))
        mp = threading.Thread(target=multiplayer, args=[player1_name, player2_name])
        mp.start()
    if gamemode == "sp":
        player_name = str(input("Whats the name of the player \n"))
        sp = threading.Thread(target=singleplayer, args=[difficulty, player_name])
        sp.start()


try:
    while True:
        if playing == False:
            gamemode = input("sp of mp?: ")
            difficulty = ""
            if gamemode == 'sp':
                difficulty = int(input("gemakkelijk(0), gemiddeld(1) of moeilijk(2)?: "))
            game(gamemode, difficulty)

except KeyboardInterrupt:
    print("\nManually stopped program")

finally:
    GPIO.cleanup()


if __name__ == '__main__':
    socketio.run(app,host="127.0.0.1",port=5010, debug=True)