from flask import Flask, render_template, json, request, jsonify
from flask_socketio import SocketIO,send,emit
from flask_cors import CORS

app = Flask(__name__)
app.config['SECRET_KEY']="mysecret"
socketio=SocketIO(app, cors_allowed_origins='*')

stop=False

@socketio.on('connect')
def connect_message():
    print('client connected')
    clientid="id"
    emit("B2F_client_connected", clientid, broadcast=False) #Broadcast=True -> Naar alle clients word de boodschap gestuurd
    #Broadcasr=False -> Er word geen boodschap gestuurd naar alle clients

    # versturen als de game gestopt is
    #emit("B2F_stop_game", broadcast=False)


@socketio.on('F2B_start_multiplayer')
def handle_message_start_singleplayer(data):
    naam1= data['mp_naam1']
    print(naam1)
    naam2= data['mp_naam2']
    print(naam2)

@socketio.on('F2B_start_singleplayer')
def handle_message_start_multiplayer(data):
    naam= data['sp_naam']
    print(naam)
    moeilijkheidsgraad = data['sp_moeilijkheidsgraad']
    print(moeilijkheidsgraad)

@socketio.on('F2B_tijd')
def handle_message_tijd(data):
    # eind tijd ophalen 
    tijd= data['sp_tijd']
    print(tijd)

@socketio.on('F2B_multiplayer_stop')
def handle_message_stop_multiplayer():
    print("game manueel gestopt")

@socketio.on('F2B_ledselection')
def handle_message_ledsselection(data):
    number_led=data["led"]
    print(number_led)
    singleplayer_extra_modi(number_led)

#er word op de stop knop geduwd bij custom game mode
@socketio.on('F2B_custom_stop')
def handle_message_custom_stop():
    global stop
    print("stop")
    stop=True



def singleplayer_extra_modi(number_led):
    global stop
    if stop==False:
        current_base = number_led
        current_base.activate()
        current_base.check_for_hit()
    else:
        print("You ended training mode")
        stop=False

    # DataRepository.insert_game(datetime.now(), player_name, time_score, difficulty)
    




if __name__ == '__main__':
    socketio.run(app,host="127.0.0.1",port=5010, debug=True)