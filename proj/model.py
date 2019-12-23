from proj import app, db
from sqlalchemy.ext import mutable
import uuid


class User(db.Model):
    id = db.Column(db.String(32), primary_key=True)
    name = db.Column(db.String(250))
    phone = db.Column(db.String(100), unique=True)
    email = db.Column(db.String(100), unique=True)
    password = db.Column(db.String(100))
    date_created = db.Column(db.DateTime, default=db.func.current_timestamp())
    is_deleted = db.Column(db.Boolean, default=1)

    def __init__(self, name,email, role, password):
        self.id = uuid.uuid4().hex
        self.name = name
        self.email = email
        self.role = role
        self.password = password


class Student(db.Model):
    id = db.Column(db.String(32), primary_key=True)
    intake = db.Column(db.String(32))
    student_no = db.Column(db.String(32))
    ic_no = db.Column(db.String(32))
    name = db.Column(db.String(300))
    password = db.Column(db.String(100))
    date_created = db.Column(db.DateTime, default=db.func.current_timestamp())
    parent_detail = db.relationship("Parent", backref="student", cascade="all, delete-orphan")
    academy_detail = db.relationship("Academy", backref="student", cascade="all, delete-orphan")
    is_deleted = db.Column(db.Boolean, default=1)

    def __init__(self, name, ):
        self.id = uuid.uuid4().hex
        self.name = name


class Parent(db.Model):
    id = db.Column(db.String(32), primary_key=True)
    type = db.Column(db.String(32))
    name = db.Column(db.String(250))
    phone = db.Column(db.String(100))
    email = db.Column(db.String(100))
    ic_no = db.Column(db.String(100))
    password = db.Column(db.String(100))
    date_created = db.Column(db.DateTime, default=db.func.current_timestamp())
    student_id = db.Column(db.ForeignKey('student.id', ondelete="CASCADE", onupdate="CASCADE"))
    is_deleted = db.Column(db.Boolean, default=1)

    def __init__(self, name):
        self.id = uuid.uuid4().hex
        self.name = name


class Payment(db.Model):
    id = db.Column(db.String(32), primary_key=True)
    receipt_no = db.Column(db.String(32))
    desc = db.Column(db.TEXT)
    payment_detail = db.relationship("PaymentDetail", backref="payment", cascade="all, delete-orphan")
    date_created = db.Column(db.DateTime, default=db.func.current_timestamp())
    is_pay = db.Column(db.Boolean, default=1)
    is_deleted = db.Column(db.Boolean, default=1)

    def __init__(self, receipt_no, desc):
        self.id = uuid.uuid4().hex
        self.receipt_no = receipt_no
        self.desc = desc


class PaymentDetail(db.Model):
    id = db.Column(db.String(32), primary_key=True)
    type = db.Column(db.String(32))
    desc = db.Column(db.TEXT)
    price = db.Column(db.String(32))
    payment_id = db.Column(db.ForeignKey('payment.id', ondelete="CASCADE", onupdate="CASCADE"))
    date_created = db.Column(db.DateTime, default=db.func.current_timestamp())
    is_deleted = db.Column(db.Boolean, default=1)

    def __init__(self, price, desc):
        self.id = uuid.uuid4().hex
        self.price = price
        self.desc = desc


class Academy(db.Model):
    id = db.Column(db.String(32), primary_key=True)
    year = db.Column(db.String(10))
    sem = db.Column(db.String(32))
    desc = db.Column(db.TEXT)
    date_created = db.Column(db.DateTime, default=db.func.current_timestamp())
    student_id = db.Column(db.ForeignKey('student.id', ondelete="CASCADE", onupdate="CASCADE"))
    is_deleted = db.Column(db.Boolean, default=1)

    def __init__(self, year, sem, desc):
        self.id = uuid.uuid4().hex
        self.year = year
        self.sem = sem
        self.desc = desc


class AcademyDetail(db.Model):
    id = db.Column(db.String(32), primary_key=True)
    name = db.Column(db.String(250))
    grade = db.Column(db.String(25))
    desc = db.Column(db.TEXT)
    date_created = db.Column(db.DateTime, default=db.func.current_timestamp())
    is_deleted = db.Column(db.Boolean, default=1)

    def __init__(self, name, grade):
        self.id = uuid.uuid4().hex
        self.name = name
        self.grade = grade
