from flask import Flask, render_template, json, request
from flask_socketio import SocketIO,send,emit


app = Flask(__name__)
app.config['SECRET_KEY']="mysecret"
socketio=SocketIO(app, cors_allowed_origins='*')

@socketio.on('connect')
def connect_message():
    print('client connected')
    clientid=request.sid
    emit("B2F_client_connected", clientid, broadcast=False) #Broadcast=True -> Naar alle clients word de boodschap gestuurd
    #Broadcasr=False -> Er word geen boodschap gestuurd naar alle clients
@socketio.on('message')
def handle_message(msg):
    print(f"Message= {msg}")
    send(msg, broadcast=True) #Broadcast=True -> Naar alle clients word de boodschap gestuurd
    #Broadcasr=False -> Er word geen boodschap gestuurd naar alle clients

@socketio.on('F2B_Like')
def like():
    print(f"er word een like aangevraagd")
    send(":dumb:", broadcast=True) #Broadcast=True -> Naar alle clients word de boodschap gestuurd
    #Broadcasr=False -> Er word geen boodschap gestuurd naar alle clients



if __name__ == '__main__':
    socketio.run(app,host="127.0.0.1",port=5000, debug=True)