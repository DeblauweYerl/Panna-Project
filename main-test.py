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

player_name = ""
player2_name = ""
difficulty = 0
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
def start_singleplayer(data):
    if not playing:
        global player_name
        global difficulty
        player_name = data['sp_name']
        difficulty = data['sp_difficulty']

        sp = threading.Thread(target=singleplayer, args=[difficulty, player_name])
        sp.start()

@socketio.on('F2B_start_multiplayer')
def start_multiplayer(data):
    if not playing:
        global player_name
        global player2_name
        player_name = data['player1_name']
        player2_name = data['player2_name']

        mp = threading.Thread(target=multiplayer, args=[player_name, player2_name])
        mp.start()

@socketio.on('F2B_request_scoreboard')
def request_scoreboard(data):
    difficulty = data['difficulty']
    data = DataRepository.read_scoreboard(difficulty)

@socketio.on('F2B_end_singleplayer')
def end_singleplayer(data):
    time = data['time']
    DataRepository.insert_game(datetime.now(), player_name, time, difficulty)



def singleplayer(difficulty, player_name):
    global playing
    playing = True

    total_bases = 10 + (int(difficulty) * 5)
    bases_completed = 0
    while(bases_completed <= total_bases):
        current_base = bases[random.randint(0, 3)]
        current_base.activate()
        current_base.check_for_hit()
        bases_completed += 1
    socketio.emit('B2F_stop_game', broadcast=False)
    playing = False


def multiplayer(player1_name, player2_name):
    global playing
    playing = True

    #leds per team oplichten in de respectievelijke kleur
    for base in bases[0:2]:
        base.activate('red')
    for base in bases[2:4]:
        base.activate('blue')

    #puntentelling + punt versturen over socket
    team_red_previous = [True, True]
    team_red = []
    team_red_score = 2
    team_blue_previous = [True, True]
    team_blue = []
    team_blue_score = 2

    while team_red_score!=0 and team_blue_score!=0:
        for base in bases[0:2]:
            team_red.append(base.active)
        team_red_score = team_red.count(True)
        print(f"team_red {team_red}")
        print(f"team_red_previous {team_red_previous}")
        if team_red != team_red_previous:
            print("hit on red")
            socketio.emit('B2F_multiplayer_score', {'team': 'red', 'score': team_red_score})
            team_red_previous = team_red

        for base in bases[2:4]:
            team_blue.append(base.active)
        team_blue_score = team_blue.count(True)
        if team_blue != team_blue_previous:
            print("hit on blue")
            socketio.emit('B2F_multiplayer_score', {'team': 'blue', 'score': team_blue_score})
            team_blue_previous = team_blue

        team_red.clear()
        team_blue.clear()
        time.sleep(.01)

    if team_red_score == 0:
        socketio.emit('B2F_multiplayer_end', {'winner': player2_name})
    else:
        socketio.emit('B2F_multiplayer_end', {'winner': player1_name})

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
    if __name__ == '__main__':
        socketio.run(app,host="192.168.0.26",port=5010, debug=True)
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

