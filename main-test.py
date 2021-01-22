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

leds = [Led(26), Led(19), Led(21), Led(20)]
buttons = [Button(13), Button(6), Button(16), Button(12)]
bases = []
for led in leds:
    GPIO.output(led.pin, 0)
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

@socketio.on('F2B_start_training')
def start_training():
    global playing
    playing == True
@socketio.on('F2B_activate_base')
def activate_base(data):
    bases[int(data['base'])].activate()

@socketio.on('F2B_stop_game')
def stop_game():
    end_current_game()


@socketio.on('F2B_request_scoreboard')
def request_scoreboard(data):
    difficulty = data['difficulty']
    version = data['version']
    if version == "full":
        response_data = DataRepository.read_scoreboard(difficulty)
    elif version == "limited":
        response_data = DataRepository.read_limited_scoreboard(difficulty)
    elif version == "targeted":
        response_data = DataRepository.read_scoreboard(difficulty)
        # response_data = get_surrounding_records(response_data, response_data[])
        
    socketio.emit('B2F_scoreboard_data', response_data, broadcast=False)

@socketio.on('F2B_end_singleplayer')
def end_singleplayer(data):
    time = data['time']
    DataRepository.insert_game(datetime.now(), player_name, time, difficulty)



def singleplayer(difficulty, player_name):
    global playing
    playing = True

    total_bases = 10 + (int(difficulty) * 5)
    print(f"total bases: {total_bases}")
    bases_completed = 0
    current_base_index = 4
    previous_base_index = 4
    while bases_completed < total_bases and playing == True:
        print(f"completed: {bases_completed}")
        while current_base_index == previous_base_index:
            current_base_index = random.randint(0, 3)
        current_base = bases[current_base_index]
        current_base.activate()
        current_base.check_for_hit()
        bases_completed += 1
        previous_base_index = current_base_index
    if playing == True:
        socketio.emit('B2F_stop_game', broadcast=False)
        playing = False


def multiplayer(player1_name, player2_name):
    global playing
    playing = True

    #leds per team oplichten in de respectievelijke kleur
    for base in bases[0:2]:
        base.activate()
    for base in bases[2:4]:
        base.activate()

    #puntentelling + punt versturen over socket
    team_red_previous = [True, True]
    team_red = []
    team_red_score = 2
    team_blue_previous = [True, True]
    team_blue = []
    team_blue_score = 2

    while team_red_score!=0 and team_blue_score!=0 and playing == True:
        for base in bases[0:2]:
            team_red.append(base.active)
        team_red_score = team_red.count(True)
        if team_red != team_red_previous:
            socketio.emit('B2F_multiplayer_score', {'team': 'red', 'score': team_red_score})
            team_red_previous = team_red

        for base in bases[2:4]:
            team_blue.append(base.active)
        team_blue_score = team_blue.count(True)
        if team_blue != team_blue_previous:
            socketio.emit('B2F_multiplayer_score', {'team': 'blue', 'score': team_blue_score})
            team_blue_previous = team_blue

        team_red.clear()
        team_blue.clear()
        time.sleep(.01)

    if playing == True:
        if team_red_score == 0:
            socketio.emit('B2F_stop_game', {'winner': player2_name})
        else:
            socketio.emit('B2F_stop_game', {'winner': player1_name})
        end_current_game()

def end_current_game():
    global playing
    playing = False
    for base in bases:
        base.deactivate()

# def get_surrounding_records(data):
    


# def game(gamemode, difficulty=0):
#     global playing
#     playing = True
#     if gamemode == "mp":
#         player1_name = str(input("Whats the name of player 1 \n"))
#         player2_name = str(input("Whats the name of player 2 \n"))
#         mp = threading.Thread(target=multiplayer, args=[player1_name, player2_name])
#         mp.start()
#     if gamemode == "sp":
#         player_name = str(input("Whats the name of the player \n"))
#         sp = threading.Thread(target=singleplayer, args=[difficulty, player_name])
#         sp.start()

try:
    if __name__ == '__main__':
        socketio.run(app,host="169.254.10.1",port=5010, debug=True)

except KeyboardInterrupt:
    print("\nManually stopped program")

finally:
    GPIO.cleanup()