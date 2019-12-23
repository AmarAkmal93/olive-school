import os
from flask import Blueprint, render_template, request, jsonify, json

from proj.model import *

bp_main = Blueprint('bp_main', __name__)


@bp_main.route('/')
def index():
    user = User.query.filter_by(id=request.args.get('id')).first()

    if user:
        # role = Role.query.filter_by(id=user.role_id).first()
        return render_template('index.html', id=user.id)
    else:
        return render_template('error.html')
