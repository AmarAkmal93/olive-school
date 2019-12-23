from flask import Blueprint, render_template, request, url_for, redirect, flash, session, jsonify, json
from proj.model import *
from datetime import datetime

bp_login = Blueprint('bp_login', __name__)


@bp_login.route('/error')
def error():
    return render_template('error.html')


@bp_login.route('/', methods=['GET', 'POST'])
def auth():
    if request.method == 'POST':

        email = request.form["inputEmail3"]
        password = request.form["inputPassword3"]
        user = User.query.filter_by(email=email).first()

        if user.password == password:
            return redirect(url_for('bp_main.index', id=user.id))
        else:
            flash('An error has occured', 'error')

    return render_template('auth.html')


@bp_login.route('/logout')
def logout():
    try:
        flash('You were logged out')
    except Exception as e:
        print(e)
        flash('Failed')

    return redirect(url_for('bp_login.auth'))
