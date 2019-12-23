from flask import Flask, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
import os
import proj.config
from flask_cors import CORS

# from celery import Celery

app = Flask(__name__, instance_relative_config=True)

CORS(app)
# load config
config_name = os.getenv('FLASK_CONFIGURATION', 'default')
app.config.from_object(config.config_setting[config_name])  # object-based default configuration
app.config.from_pyfile('flask.cfg', silent=True)  # instance-folders configuration
# ---
from flask_cors import CORS

# celery = Celery(app.name, broker=app.config['CELERY_BROKER_URL'], backend=app.config['CELERY_BACKEND'])
# celery.conf.task_default_queue = 'agency'

# create tables
db = SQLAlchemy(app)
from proj import model

db.create_all()
# ---
from proj.views.login import bp_login

app.register_blueprint(bp_login, url_prefix='/login')


from proj.views.main import bp_main

app.register_blueprint(bp_main, url_prefix='/main')

from proj.views.Insertdata import bp_insertdata

app.register_blueprint(bp_insertdata, url_prefix='/insert')
# ---
