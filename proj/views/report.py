from flask import Blueprint, render_template, request, flash, g, session, redirect, url_for, jsonify, send_file, \
    send_from_directory
# from proj import db
from proj.model import *
from werkzeug.utils import secure_filename
from proj import celery
import os, json, math, time, requests

bp_report = Blueprint('bp_report', __name__)


@bp_report.route('/')
def index():
    # users = User.query.all()
    return render_template("user/index_ajax.html")


@bp_report.route('/receive_laporan', methods=['POST'])
def receive_laporan():
    ####################START TERIMA DATA DARI API YEH ###########################
    no_rujukan = request.form.get("no_rujukan")
    category = request.form.get("category")
    agensi = request.form.get("agensi")
    # tarikh = request.form.get("tarikh")
    lokasi = request.form.get("lokasi")
    latlong = request.form.get("latlong")
    description = request.form.get("description")
    penghantar = request.form.get("penghantar")
    id_report = uuid.uuid4().hex

    folder = os.path.join(app.root_path, app.config['UPLOAD_FOLDER'], str(id_report))
    if os.path.exists(folder):
        pass
    else:
        os.mkdir(folder)
    file_storange = dict()
    file_storange["attachment"] = []
    if 'attachment' in request.files:
        for j in request.files.getlist('attachment'):
            unique = uuid.uuid4().hex
            filename = secure_filename(j.filename)
            fullfilename = os.path.join(folder, unique)
            j.save(fullfilename)

            dictv = dict()
            dictv["filename"] = filename
            dictv["unique"] = unique
            # dictv["format"] = os.path.splitext(j.filename)[-1].lower()
            file_storange["attachment"].append(dictv)
            db.session.commit()

    task = receive_laporan_long.apply_async(
        (no_rujukan, category, agensi, lokasi, latlong, description, penghantar, id_report, file_storange))

    response = dict()
    try:
        output = {"status": "OK", "task_id": task.id}
        db.session.commit()
        response['status'] = 'OK'
        response['returnCode'] = '1000'
    except Exception as e:
        output = {"status": e}
        print(e)

    return jsonify(output)


####################END TERIMA DATA DARI API YEH #############################


@celery.task(bind=True)
def receive_laporan_long(self, no_rujukan, category, agensi, lokasi, latlong, description, penghantar, id_report, file):
    date_now = datetime.now()
    status = Status.query.filter_by(name="New").first()

    get_agensi = Agensi.query.filter_by(name=agensi).first()
    if not get_agensi:
        return "NO AGENSI"

    report = Report(id=id_report, no_rujukan=no_rujukan, description=description, tarikh=date_now,
                    category=category, penghantar=penghantar,
                    lokasi=lokasi, latlong=latlong,
                    status=status.name, flag=1)
    report.agensi_id = get_agensi.id
    db.session.add(report)
    db.session.commit()
    for x in file["attachment"]:
        attchement = ReportAttachment(filename=x["filename"])
        attchement.id = x["unique"]
        report.attachment.append(attchement)
        db.session.commit()

    get_history = History(description="Received Report")
    get_history.status_id = status.id
    get_history.report_id = id_report
    get_history.date_created = date_now
    db.session.add(get_history)
    db.session.commit()


@bp_report.route('/list_laporan/<keyword>/<pagenum>', methods=['GET'])
def list_laporan(keyword, pagenum):
    # print("MASUKAAAA")
    keyword = json.loads(keyword)
    pagenum = json.loads(pagenum)
    date_report = keyword["date_report"]
    no_rujukan = keyword["no_rujukan"]
    category = request.args["category"]
    status = keyword["status"]

    codeSql = Report.query.filter_by(flag=1)
    # print(codeSql)
    if date_report:
        try:
            date_report = datetime.strptime(date_report, '%d %B %Y')
            date_report_from = str(date_report.strftime("%Y-%m-%d ")) + "00:00"
            date_report_to = str(date_report.strftime("%Y-%m-%d ")) + "23:59"
            codeSql = codeSql.filter(Report.date_created.between(date_report_from, date_report_to))
        except Exception as e:
            print(e)

    if no_rujukan:
        codeSql = codeSql.filter(Report.no_rujukan.like('%' + no_rujukan + '%'))

    if category and category != "All":
        codeSql = codeSql.filter(Report.category.like('%' + category + '%'))

    if status and status != "All":
        codeSql = codeSql.filter(Report.status.like('%' + status + '%'))

    count_result = codeSql.order_by(Report.tarikh.desc(), Report.date_created.desc()).count()
    if count_result:
        totalpagenum = math.ceil(count_result / 10)

    else:
        totalpagenum = 0

    if totalpagenum >= int(pagenum):
        report = codeSql.order_by(Report.tarikh.desc(), Report.date_created.desc()).paginate(int(pagenum), 10)
    else:
        pagenum = int(pagenum)
        pagenum = pagenum - (pagenum - totalpagenum)
        if pagenum == 0:
            pagenum = 1
        report = codeSql.order_by(Report.tarikh.desc(), Report.date_created.desc()).paginate(int(pagenum), 10)

    list = dict()
    list['data'] = []
    list['totalpagenum'] = []
    list['count_result'] = []
    for x in report.items:
        dict1 = dict()
        dict1['id'] = x.id
        dict1['no_rujukan'] = x.no_rujukan
        dict1['tarikh'] = x.tarikh
        dict1['status'] = x.status
        dict1['date_report'] = x.date_created.strftime("%a,%d %b %Y %I:%M %p")
        dict1['category'] = x.category
        list['data'].append(dict1)
    list['totalpagenum'] = int(totalpagenum)
    list['count_result'] = str(count_result)
    return jsonify(list)


@bp_report.route('/get_laporan/<report_id>', methods=['GET'])
def get_laporan(report_id):
    # try:
    report_id = json.loads(report_id)
    report = Report.query.filter_by(id=report_id).first()

    ################### update history if  new to read ###############

    if report.status == "New":
        task = check_status_long.apply_async((report.id, str(report.date_created),))
    ###################END update history if read from new ###############

    if not report:
        return "Report does not exist"
    else:
        dict1 = dict()
        dict1['id'] = report.id
        dict1['no_rujukan'] = report.no_rujukan
        dict1['tarikh'] = report.tarikh.strftime("%a,%d %b %Y %I:%M %p")
        dict1['penghantar'] = report.penghantar
        dict1['lokasi'] = report.lokasi
        dict1['latlong'] = report.latlong
        dict1['status'] = report.status
        dict1['flag'] = report.flag
        dict1['desc'] = report.description
        dict1['category'] = report.category
        # dict1['sender_report'] = report.penghantar
        # if report.agensi:
        #     dict1['agensi'] = report.agensi.name
        # else:
        #     dict1['agensi'] = "None"
        dict1['work_report'] = report.work_report
        dict1['report_attachment'] = []
        attch = ReportAttachment.query.filter_by(report_id=report_id).all()
        for j in attch:
            dictS = dict()
            if ".jpg" in j.filename or ".png" in j.filename:
                dictS["type"] = "image"
            elif ".xls" in j.filename or ".xlsx" in j.filename:
                dictS["type"] = "excel"
            elif ".doc" in j.filename or ".doc" in j.filename:
                dictS["type"] = "doc"
            elif ".m4v" in j.filename or ".mp4" in j.filename or ".mov" in j.filename or ".mp4" in j.filename:
                dictS["type"] = "vid"
            elif ".txt" in j.filename:
                dictS["type"] = "txt"
            elif ".pdf" in j.filename:
                dictS["type"] = "pdf"
            else:
                dictS["type"] = "others"

            dictS["id"] = j.id
            dictS["filename"] = j.filename

            dict1['report_attachment'].append(dictS)

        dict1['work_attachment'] = []
        attch = WorkReportAttachment.query.filter_by(report_id=report_id).all()
        for j in attch:
            dictf = dict()
            if ".jpg" in j.filename or ".png" in j.filename or ".gif" in j.filename:
                dictf["type"] = "image"
            elif ".xls" in j.filename or ".xlsx" in j.filename:
                dictf["type"] = "excel"
            elif ".doc" in j.filename or ".doc" in j.filename:
                dictf["type"] = "doc"
            elif ".m4v" in j.filename or ".mp4" in j.filename or ".mov" in j.filename or ".mp4" in j.filename:
                dictf["type"] = "vid"
            elif ".txt" in j.filename:
                dictf["type"] = "txt"
            elif ".pdf" in j.filename:
                dictf["type"] = "pdf"
            else:
                dictf["type"] = "others"

            dictf["id"] = j.id
            dictf["filename"] = j.filename

            dict1['work_attachment'].append(dictf)

        return jsonify(dict1)


@celery.task(bind=True)
def check_status_long(self, report_id, date_report):
    report = Report.query.filter_by(id=report_id).first()
    if report:
        report.status = "Read"
        db.session.commit()

    status_id = Status.query.filter_by(name="Read").first()
    if status_id:
        # date_report = datetime.strptime(date_report, '%Y-%m-%d %H:%M:%S')  # STRING TYPE
        # date_report = date_report.strftime("%Y-%m-%d %H:%M")  # date Format DB

        status_get = History.query.filter(History.report_id == report_id, History.status_id == status_id.id).first()

        if not status_get:
            status = Status.query.filter_by(name="Read").first()
            if status:
                history_save = History(description="")
                history_save.report_id = report.id
                history_save.status_id = status.id
                history_save.date_created = datetime.now()
                db.session.add(history_save)
                db.session.commit()


@bp_report.route('/delete_report/<report_id>', methods=['DELETE'])
def delete_report(report_id):
    data = json.loads(report_id)
    task = delete_report_long.apply_async((data,))

    output = {"status": "OK", "task_id": task.id}
    return jsonify(output)


@celery.task(bind=True)
def delete_report_long(self, report_id):
    for x in report_id:
        get_report = Report.query.filter_by(id=x).first()
        get_report.flag = 0
        db.session.commit()


@bp_report.route("/status_delete_report_long/<taskId>")
def status_delete_report_long(taskId):
    task = work_report_long.AsyncResult(taskId)
    if task:
        if task.state == "PROGRESS":
            output = {"status": task.state}
        else:
            output = {"status": task.state}
        return jsonify(output)
    output = {"status": "SUCCESS"}
    return jsonify(output)


@bp_report.route('/work_report', methods=['PATCH'])
def work_report():
    if "data" not in request.form:
        return "no data"
    data = json.loads(request.form["data"])
    doc = [".xls", ".xlsx", ".doc", ".docx", ".pdf", ".txt", ".m4v", ".mp4", ".mov", ".mp4", ".jpg", ".png", ".gif"]
    file_storange = dict()
    file_storange["attachment"] = []
    host = request.host_url
    if "id" not in data:
        return "no id"
    folder = os.path.join(app.root_path, app.config['UPLOAD_FOLDER'], data["id"])
    if os.path.exists(folder):
        pass
    else:
        os.mkdir(folder)
    folder = os.path.join(app.root_path, app.config['UPLOAD_FOLDER'], data["id"], "work_report")
    if os.path.exists(folder):
        pass
    else:
        os.mkdir(folder)

    file_storange = dict()
    file_storange["attachment"] = []
    if 'attachment' in request.files:
        for j in request.files.getlist('attachment'):
            if os.path.splitext(j.filename)[-1].lower() in doc:
                unique = uuid.uuid4().hex
                filename = secure_filename(j.filename)
                fullfilename = os.path.join(folder, unique)
                j.save(fullfilename)

                dictv = dict()
                dictv["filename"] = filename
                dictv["unique"] = unique
                # dictv["format"] = os.path.splitext(j.filename)[-1].lower()
                file_storange["attachment"].append(dictv)
            else:
                return jsonify({"status": "Wrong format attachment"})

    task = work_report_long.apply_async((data, file_storange, host))
    output = {"status": "OK", "task_id": task.id}

    return jsonify(output)


@celery.task(bind=True)
def work_report_long(self, data, file, host):
    report = Report.query.filter_by(id=data["id"]).first()
    if report:
        if "desc" in data:
            report.work_report = data["desc"]
            report.tarikh = datetime.now()

            db.session.commit()
        folder = os.path.join(app.root_path, app.config['UPLOAD_FOLDER'], data["id"], "work_report/")

        detail = []
        file_path = []
        if "attachment" in file:
            for x in file["attachment"]:
                attchement = WorkReportAttachment(filename=x["filename"])
                attchement.id = x["unique"]
                report.work_attachment.append(attchement)
                db.session.commit()

        attchement = WorkReportAttachment.query.filter_by(report_id=report.id, status=1).all()
        for x in attchement:
            detailV = dict()
            detailV["id"] = x.id
            detailV["file_name"] = x.filename
            detail.append(detailV)
            file_path.append(folder + x.id)
            db.session.commit()

        # files = [eval(f'("attachment", open("{file}", "rb"))') for file in file_path]
        files = []
        for file in file_path:
            filename = file.split('/')
            filename = filename[len(filename) - 1]
            files.append(('attachment', (filename, open(file, 'rb'), '')))

        if "localhost" in host:  # +++++++++++++++++++++ Localhost +++++++++++++++++++++++++++
            host = "http://192.168.5.92:8080/" + "report/get_report/" + report.no_rujukan

        else:  # +++++++++++++++++++++ Out server +++++++++++++++++++++++++++

            host = host + "pta_be/" + "report/get_report/" + report.no_rujukan
        try:
            req = requests.post(host, data={'desc': data['desc'], 'file': [detail]}, files=files,
                                verify=False)  # production
            print(req.status_code,
                  "STATUS BETWEEN SERVER ######################### STATUS BETWEEN SERVER #########################")
            if req.status_code == 200:
                WorkReportAttachment.query.filter_by(status=0).update(
                    dict(date_created=datetime.now()))
                db.session.commit()
                get_status = Status.query.filter_by(name="Completed").first()
                if get_status:
                    report.status = "Completed"
                    report.tarikh_report = datetime.now()
                    db.session.commit()
                    history = History(description="")
                    history.report_id = report.id
                    history.status_id = get_status.id
                    db.session.add(history)
                db.session.commit()

            else:
                WorkReportAttachment.query.filter_by(status=1).update(
                    dict(date_created=datetime.now()))
                db.session.commit()
                get_status = Status.query.filter_by(name="Failed").first()
                if get_status:
                    report.status = get_status.name
                    report.tarikh_report = datetime.now()
                    db.session.commit()
                    history = History(description="Failed to send report")
                    history.report_id = report.id
                    history.status_id = get_status.id
                    db.session.add(history)
                db.session.commit()

        except Exception as e:
            print(
                "STATUS BETWEEN SERVER ######################### STATUS Failed Connect SERVER #########################")
            WorkReportAttachment.query.filter_by(report_id=report.id).update(
                dict(status=1))
            db.session.commit()
            # report.status = "Failed"

            get_status = Status.query.filter_by(name="Failed").first()
            if get_status:
                report.status = get_status.name
                report.tarikh_report = datetime.now()
                db.session.commit()
                add_history = History(description="Failed to connect server")
                add_history.report_id = report.id
                add_history.status_id = get_status.id
                db.session.add(add_history)

                db.session.commit()
            print(e)

        # ####################END CALL API YEH #############################

        ############ DELETE FILE data not  in table work report attchement ###############

        files_db = []
        check = WorkReportAttachment.query.filter_by(report_id=data["id"]).all()
        for x in check:
            files_db.append(x.id)
        list_file = os.listdir(folder)
        for file in list_file:
            if file not in files_db:
                folder = os.path.join(folder)
                os.remove(folder + file)  # for file delete
                # shutil.rmtree(folder)


@bp_report.route("/status_work_report_long/<taskId>")
def status_work_report_long(taskId):
    task = work_report_long.AsyncResult(taskId)
    if task:
        if task.state == "PROGRESS":
            output = {"status": task.state}
        else:
            output = {"status": task.state}
        return jsonify(output)
    output = {"status": "SUCCESS"}
    return jsonify(output)


@bp_report.route("/status_update", methods=['POST'])
def status_update():
    data = json.loads(request.form["data"])
    # print(data)
    host = request.host_url
    task = status_update_long.apply_async((data, host,))

    output = {"status": "OK", "task_id": task.id}

    return jsonify(output)


@celery.task(bind=True)
def status_update_long(self, data, host):
    report_id = data["report_id"]
    status = data["status"]

    get_status = Status.query.filter_by(id=status["id"]).first()
    if get_status:
        report = Report.query.filter_by(id=report_id).first()
        if report:
            # print(report.no_rujukan, status["name"], report.agensi.name, str(desc))
            if status["name"] == "In Progress":
                desc = status["name"]
            else:
                desc = data["desc"]

            try:
                if "localhost" in host:
                    host = "http://192.168.5.92:8080/" + "report/update_status/" + report.no_rujukan + "/" + status[
                        "name"]
                else:
                    host = host + "pta_be/report/update_status/" + report.no_rujukan + "/" + status["name"]

                req = requests.post(host, data={'desc': data['desc'], "agensi": report.agensi.name},
                                    verify=False)  # production
                print(req.status_code,
                      "######################### STATUS BETWEEN SERVER  #########################")

                if req.status_code == 200:
                    print("Status OK status_update_long IF", report.status)

                    if status["name"] == "Return":
                        report.flag = 0
                    else:
                        report.flag = 1
                    db.session.commit()
                    if report.status != "Return":
                        # report.flag = 0
                        report.status = get_status.name
                        report.tarikh = datetime.now()
                        db.session.commit()
                        update_history = History(description=desc)
                        update_history.status_id = get_status.id
                        update_history.report_id = report.id
                        update_history.date_created = datetime.now()
                        db.session.add(update_history)
                        db.session.commit()
                    else:
                        # report.flag = 0
                        report.status = get_status.name
                        report.tarikh = datetime.now()
                        db.session.commit()
                else:
                    pass
                    # print("Status OK status_update_long ELSE", report.status)
                    # report.status = get_status.name
                    # report.tarikh = datetime.now()
                    # if report.status != "Return":
                    #     # report.flag = 0
                    #     db.session.commit()
                    #
                    #     update_history = History(description=desc)
                    #     update_history.status_id = get_status.id
                    #     update_history.report_id = report.id
                    #     update_history.date_created = datetime.now()
                    #     db.session.add(update_history)
                    #     db.session.commit()
                    # else:
                    #     # report.flag = 0
                    #     report.tarikh = datetime.now()
                    #     db.session.commit()

            except Exception as e:
                print("Status Failed status_update_long", report_id)

                report.status = get_status.name
                report.tarikh = datetime.now()
                # db.session.commit()

                update_history = History(description="Failed to connect server")
                update_history.status_id = get_status.id
                update_history.report_id = report.id
                update_history.date_created = datetime.now()
                db.session.add(update_history)
                db.session.commit()
                print(e)


@bp_report.route("/status_status_update_long/<taskId>")
def status_status_update_long(taskId):
    task = status_update_long.AsyncResult(taskId, )

    if task:
        if task.state == "PROGRESS":
            output = {"status": task.state}
        else:
            output = {"status": task.state}
        return jsonify(output)
    output = {"status": "SUCCESS"}
    return jsonify(output)


@bp_report.route('/get_load_file/<report_id>/<file_id>/<tab>', methods=['GET'])
def get_load_file(report_id, file_id, tab):
    if str(tab) == "1":

        getfile = ReportAttachment.query.filter_by(id=file_id).first()
        if getfile:
            return send_file(app.config['UPLOAD_FOLDER'] + '/' + report_id + "/" + file_id,
                             attachment_filename=getfile.filename,
                             conditional=True)

    if str(tab) == "2":
        getfile = WorkReportAttachment.query.filter_by(id=file_id).first()
        if getfile:
            return send_file(app.config['UPLOAD_FOLDER'] + '/' + report_id + '/work_report/' + file_id,
                             attachment_filename=getfile.filename,
                             conditional=True)

    return "Denied"


@bp_report.route('/download_file/<report_id>/<file_id>/<tab>', methods=['GET'])
def download_file(report_id, file_id, tab):
    if str(tab) == "1":

        getfile = ReportAttachment.query.filter_by(id=file_id).first()
        if getfile:
            return send_file(app.config['UPLOAD_FOLDER'] + '/' + report_id + "/" + file_id,
                             attachment_filename=getfile.filename,
                             as_attachment=True)
    if str(tab) == "2":

        getfile = WorkReportAttachment.query.filter_by(id=file_id).first()
        if getfile:
            return send_file(app.config['UPLOAD_FOLDER'] + '/' + report_id + '/work_report/' + file_id,
                             attachment_filename=getfile.filename,
                             as_attachment=True)
    return "Denied"


@bp_report.route('/delete_file_single/<report_items>/<file_id>', methods=['DELETE'])
def delete_file_single(report_items, file_id):
    task = delete_file_single_long.apply_async((report_items, file_id,))
    output = {"status": "OK", "task_id": task.id}

    return jsonify(output)


@celery.task(bind=True)
def delete_file_single_long(self, report_id, file_id):
    get_id = WorkReportAttachment.query.filter_by(id=file_id, report_id=report_id).first()
    folder = os.path.join(app.root_path, app.config['UPLOAD_FOLDER'], report_id, "work_report/")
    if get_id:
        db.session.delete(get_id)
        db.session.commit()
        os.remove(folder + file_id)


@bp_report.route("/status_delete_file_single_long/<taskId>")
def status_delete_file_single_long(taskId):
    task = delete_file_single_long.AsyncResult(taskId)
    if task:
        if task.state == "PROGRESS":
            output = {"status": task.state}
        else:
            output = {"status": task.state}
        return jsonify(output)
    output = {"status": "SUCCESS"}
    return jsonify(output)


@bp_report.route('/list_agensi', methods=['GET'])
def list_agensi():
    list_agensi = Agensi.query.all()

    list = []
    for x in list_agensi:
        dictv = dict()
        dictv["id"] = x.id
        dictv["name"] = x.name

        list.append(dictv)

    return jsonify(list)


@bp_report.route('/list_status', methods=['GET'])
def list_status():
    stories = Status.query.filter(Status.flag == 1, Status.name != "Return").order_by(Status.sort.asc()).all()

    list = []
    for x in stories:
        dictv = dict()
        dictv["id"] = x.id
        dictv["name"] = x.name

        list.append(dictv)

    return jsonify(list)


@bp_report.route('/list_status_selection', methods=['GET'])
def list_status_selection():
    list_agensi = Status.query.filter(Status.name != "Read", Status.name != "New", Status.name != "Failed",
                                      Status.name != "Completed", Status.name != "On-Hold").all()

    list = []
    for x in list_agensi:
        dictv = dict()
        dictv["id"] = x.id
        dictv["name"] = x.name

        list.append(dictv)

    return jsonify(list)


@bp_report.route('/get_history_status/<report_id>', methods=['GET'])
def get_history_status(report_id):
    stories = History.query.filter(History.report_id == report_id).order_by(History.date_created.asc()).all()

    list = []
    for x in stories:
        dictv = dict()
        # dictv["id"] = x.id
        dictv["status"] = x.status.name
        dictv["date"] = x.date_created.strftime("%a,%d %b %Y %I:%M %p")

        dictv["desc"] = x.description
        if x.status.name == "New" or x.status.name == "Completed" or x.status.name == "Read":
            dictv["color"] = "primary"
        elif x.status.name == "In Progress":
            dictv["color"] = "warning"
        else:
            dictv["color"] = "danger"

        list.append(dictv)

    return jsonify(list)


@bp_report.route("/resend_report/<report_id>", methods=['POST'])
def resend_report(report_id):
    check_report = Report.query.filter_by(id=report_id).first()
    output = dict()
    if check_report:
        data = {"id": check_report.id, "desc": check_report.description}
        #
        host = request.host_url
        task = work_report_long.apply_async((data, [], host))
        output = {"status": "OK", "task_id": task.id}

    return jsonify(output)

# @bp_report.route("/test", methods=['GET'])
# def test():
#     name = "JPEG_20191107_114802_892563545.jpg1575866216416"
#     realname = name.split('.jpg')
#     print(realname[0] + ".jpg")
#     return "ok"
