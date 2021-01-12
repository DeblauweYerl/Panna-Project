from flask import Flask, render_template, json, request, jsonify
from flask_socketio import SocketIO,send,emit
from flask_cors import CORS

app = Flask(__name__)
app.config['SECRET_KEY']="mysecret"
socketio=SocketIO(app, cors_allowed_origins='*')

@socketio.on('connect')
def connect_message():
    print('client connected')
    clientid="id"
    emit("B2F_client_connected", clientid, broadcast=False) #Broadcast=True -> Naar alle clients word de boodschap gestuurd
    #Broadcasr=False -> Er word geen boodschap gestuurd naar alle clients

    # versturen als de game gestopt is
    emit("B2F_stop_game", broadcast=False)



@socketio.on('F2B_start_singleplayer')
def handle_message_start_singleplayer(data):
    naam= data['sp_naam']
    print(naam)
    moeilijkheidsgraad = data['sp_moeilijkheidsgraad']
    print(moeilijkheidsgraad)

@socketio.on('F2B_tijd')
def handle_message_tijd(data):
    # eind tijd ophalen 
    tijd= data['sp_tijd']
    print(tijd)

@socketio.on('F2B_ledselection')
def handle_message_ledsselection(data):
    number_led=data["led"]
    stop=data["stop"]
    singleplayer_extra_modi(number_led,stop)


def singleplayer_extra_modi(number_led,stop):
    global playing
    x=0
    if(stop!= 1):
        current_base = number_led
        current_base.activate()
        current_base.check_for_hit()
    else:print("You ended training mode")
    # DataRepository.insert_game(datetime.now(), player_name, time_score, difficulty)
    playing = False




if __name__ == '__main__':
    socketio.run(app,host="127.0.0.1",port=5010, debug=True)