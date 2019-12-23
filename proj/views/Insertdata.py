from flask import Blueprint
from proj.model import *

bp_insertdata = Blueprint('bp_insertdata', __name__)


@bp_insertdata.route('/')
def index():
    arr1 = []
    arr1.extend(
        (User(name='Teacher', email='teacher1@mail.com', role='Teacher', password=111111),
         User(name='Principle', email='principle1@mail.com', role="Principle", password=111111),
         User(name='Account', email='account@mail.com', role="Account", password=111111)
         ))
    for i in arr1:
        check = User.query.filter_by(name=i.name).first()
        if not check:
            db.session.add(i)
            db.session.commit()

    return "OK"
