import os

from flask import Blueprint, render_template, request, jsonify, json
from flask import url_for, redirect, flash, session
from werkzeug.utils import secure_filename

bp_main = Blueprint('bp_main', __name__)


@bp_main.route('/')
def index():
    return render_template('index.html', id=1111111111111111111, role="USER")

