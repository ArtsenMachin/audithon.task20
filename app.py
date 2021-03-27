from flask import Flask, render_template, url_for, request, send_from_directory
from models.models import map_baloon_data, regions_get, diagrams
import os
import json


app = Flask(__name__)


@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'), 'favicon.ico', mimetype='image/vnd.microsoft.icon')


@app.route('/')
def index():
    url_for('static', filename='script.js')
    url_for('static', filename='styles.css')
    return render_template("index.html")


@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404


@app.route('/get_baloons', methods=['GET'])
def baloons():
    return map_baloon_data()


@app.route('/select_diagrams', methods=['GET'])
def regions_for_dias():
    return regions_get()


@app.route('/diagrams', methods=['GET'])
def diagrams_info():
    regions = request.args['regions']
    cult_value = request.args['cult_value']
    state = request.args['state']
    return diagrams(regions, cult_value, state)


# @app.route('/diagrams2', methods=['GET'])
# def diagrams_info2():
#     regions = request.args['regions']
#     cult_value = request.args['cult_value']
#     state = request.args['state']
#     return diagrams(regions, cult_value, state)


@app.route('/form', methods=['GET'])
def redirect():
    return render_template("form.html")


if __name__ == "__main__":
    app.run(debug=True, host="26.173.145.160", port='5000')
