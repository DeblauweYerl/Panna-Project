from flask import Flask, request, jsonify
from flask_CORS import CORS

from repositories.Datarepository import DataRepository


app = Flask(__name__)
#endpoints
endpoint = '/api'

@app.route(endpoint + '/scoreboard/<difficulty>', methods=['GET'])
def get_scoreboard(difficulty):
    data = DataRepository.read_scoreboard(difficulty)-
    return jsonify(data), 200


if __name__ == '__main__':
    app.run(debug=True)