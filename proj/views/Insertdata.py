from flask import Blueprint, render_template, request, flash, g, session, redirect, url_for, jsonify, send_file, \
    send_from_directory
# from proj import db
from proj.model import *
from werkzeug.utils import secure_filename
from proj import celery
import os, json, math, time, requests

bp_insertdata = Blueprint('bp_insertdata', __name__)


@bp_insertdata.route('/')
def index():
    arr1 = []
    arr1.extend(
        (Status(name='New', sort='1', flag=1), Status(name='Read', sort='2', flag=1),
         Status(name='On-Hold', sort='3', flag=0), Status(name='In Progress', sort='4', flag=1),
         Status(name='Failed', sort='5', flag=1), Status(name='Unresolved', sort='6', flag=1),
         Status(name='Return', sort='7', flag=1), Status(name='Completed', sort='8', flag=1),))
    for i in arr1:
        check = Status.query.filter_by(name=i.name).first()
        if not check:
            db.session.add(i)

    arr1 = []
    arr1.extend(
        (
            Agensi(name='Majlis Bandaraya Shah Alam (MBSA)', flag=1),
            Agensi(name='Majlis Bandaraya Petaling Jaya (MBPJ)', flag=1),
            Agensi(name='Majlis Perbandaran Subang Jaya (MPSJ)', flag=1),
            Agensi(name='Majlis Perbandaran Kajang (MPKJ)', flag=1),
            Agensi(name='Majlis Perbandaran Selayang (MPS)', flag=1),
            Agensi(name='Majlis Perbandaran Klang (MPK)', flag=1),
            Agensi(name='Majlis Perbandaran Ampang Jaya (MPAJ)', flag=1),
            Agensi(name='Majlis Perbandaran Sepang (MPSEPANG)', flag=1),
            Agensi(name='Majlis Daerah Kuala Selangor (MDKS)', flag=1),
            Agensi(name='Majlis Daerah Sabak Bernam (MDSB)', flag=1),
            Agensi(name='Majlis Daerah Hulu Selangor (MDHS)', flag=1),
            Agensi(name='Majlis Daerah Kuala Langat (MDKL)', flag=1),
            Agensi(name='Perbadanan Kemajuan Negeri Selangor(PKNS)', flag=1),
            Agensi(name='Perbadanan Perpustakaan Awam Negeri Selangor(PPAS)', flag=1),
            Agensi(name='Perbadanan Adat Melayu Dan Warisan Negeri Selangor(PADAT)', flag=1),
            Agensi(name='Perbadanan Kemajuan Pertanian Negeri Selangor(PKPS)', flag=1),
            Agensi(name='Pejabat Lembaga Urus Air Negeri Selangor(LUAS)', flag=1),
            Agensi(name='Lembaga Perumahan dan Hartanah Selangor(LPHS)', flag=1),
            Agensi(name='Majlis Sukan Negeri Selangor(MSNS)', flag=1),
            Agensi(name='Majlis Agama islam Selangor (MAIS)', flag=1),
            Agensi(name='Lembaga Zakat Selangor(Agensi MAIS)', flag=1),
            Agensi(name='Perbadanan Wakaf Selangor (Agensi MAIS)', flag=1),
        )
    )
    for i in arr1:
        check = Status.query.filter_by(name=i.name).first()
        if not check:
            db.session.add(i)
            db.session.commit()
    return "OK"
