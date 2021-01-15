from flask import Flask, request, jsonify
from flask_cors import CORS

from repositories.Datarepository import DataRepository


app = Flask(__name__)
endpoint = '/api'

@app.route(endpoint + '/scoreboard/<difficulty>', methods=['GET'])
def get_scoreboard(difficulty):
    if difficulty in ["-1", "0", "1", "2"]:
        data = DataRepository.read_scoreboard(difficulty)
        return jsonify(data), 200
    else:
        return jsonify(message="invalid difficulty"), 400



if __name__ == '__main__':
    app.run(debug=True)