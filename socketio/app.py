from flask import Flask, render_template, json, request, jsonify
from flask_socketio import SocketIO,send,emit
from flask_cors import CORS

app = Flask(__name__)
app.config['SECRET_KEY']="mysecret"
socketio=SocketIO(app, cors_allowed_origins='*')

@socketio.on('connect')
def connect_message():
    print('client connected')
    clientid="kaka"
    emit("B2F_client_connected", clientid, broadcast=False) #Broadcast=True -> Naar alle clients word de boodschap gestuurd
    #Broadcasr=False -> Er word geen boodschap gestuurd naar alle clients
@socketio.on('F2B_start_singleplayer')
def handle_message():
    print("test")


@socketio.on('F2B_Like')
def like():
    print(f"er word een like aangevraagd")
    send(":dumb:", broadcast=True) #Broadcast=True -> Naar alle clients word de boodschap gestuurd
    #Broadcasr=False -> Er word geen boodschap gestuurd naar alle clients



if __name__ == '__main__':
    socketio.run(app,host="127.0.0.1",port=5010, debug=True)