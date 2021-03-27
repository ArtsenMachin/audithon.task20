from flask import Flask, render_template, url_for, request, send_from_directory
from models.models import map_baloon_data
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


@app.route('/get_baloons', methods = ['GET'])
def baloons():
    page = request.args['page']
    return map_baloon_data(page)


if __name__ == "__main__":
    app.run(debug=True, host="26.173.145.160", port='5000')
