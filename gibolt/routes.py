from concurrent.futures import ThreadPoolExecutor
from datetime import date, datetime, timedelta
from functools import wraps
from locale import LC_ALL, setlocale

from flask import (
    Response,
    abort,
    flash,
    redirect,
    render_template,
    request,
    session,
    url_for,
)
from sqlalchemy.orm.attributes import flag_modified

from . import app, db, github
from .model import (
    Circle,
    MilestoneCircle,
    Report,
    ReportAttendee,
    ReportChecklist,
    ReportIndicator,
    ReportMilestone,
    Role,
    RoleFocus,
    RoleFocusUser,
)

setlocale(LC_ALL, "fr_FR.utf-8")


@app.route("/login")
def login():
    return github.authorize(scope="repo")


@github.access_token_getter
def token_getter():
    return session.get("token")


@app.route("/github-callback")
@github.authorized_handler
def authorized(oauth_token):
    if oauth_token is None:
        flash("Authorization failed.")
        return abort(403)
    session["token"] = oauth_token
    session["user_id"] = github.get("/user", access_token=oauth_token)["id"]
    session["repository_names"] = [
        repository["name"] for repository in get("orgs", "repos", oauth_token)
    ]
    users = github.get(
        f'/teams/{app.config["GITHUB_TEAM_ID"]}/members',
        access_token=oauth_token,
        all_pages=True,
    )
    session["users"] = {}
    for user in users:
        session["users"][user["id"]] = {
            "avatar_url": user["avatar_url"],
            "login": user["login"],
        }
    return redirect(session.get("redirect_auth_url", url_for("issues")))


def need_login(function):
    @wraps(function)
    def decorated_function(*args, **kwargs):
        if session.get("token") is None:
            session["redirect_auth_url"] = request.url
            return redirect(url_for("login"))
        return function(*args, **kwargs)

    return decorated_function


def get(root, url, access_token, filters=None):
    url = f'{root}/{app.config["ORGANISATION"]}/{url}?type=all&per_page=100'
    if filters:
        url += f"&{filters}"
    return github.get(url, access_token=access_token, all_pages=True)


def add_milestones(
    repository_name,
    milestones,
    access_token,
    beginning=None,
    end=None,
    circles=True,
):
    milestone_circles = db.query(MilestoneCircle).all()
    repository_milestones = get(
        "repos", f"{repository_name}/milestones", access_token, "state=all"
    )
    for milestone in repository_milestones[:]:
        due_on = milestone.get("due_on")
        if not due_on:
            repository_milestones.remove(milestone)
            continue
        if beginning and end and milestone["state"] == "closed":
            if due_on < beginning or due_on > end:
                repository_milestones.remove(milestone)
                continue
        milestone["repository_name"] = repository_name
        milestone["due_on_month"] = due_on[:7]
        if circles:
            milestone["circles"] = tuple(
                milestone_circle.milestone_circle
                for milestone_circle in milestone_circles
                if milestone_circle.milestone_number == milestone["number"]
            )
    milestones.extend(repository_milestones)


def circle_milestones(circle):
    milestones = []
    with ThreadPoolExecutor(max_workers=50) as executor:
        for repository_name in session["repository_names"]:
            executor.submit(
                add_milestones,
                repository_name,
                milestones,
                session.get("token"),
                circles=False,
            )
    circle_milestones = [
        (circle_milestone.milestone_number, circle_milestone.repo_name)
        for circle_milestone in circle.circle_milestones
    ]
    return [
        milestone
        for milestone in milestones
        if (milestone["number"], milestone["repository_name"])
        in circle_milestones
    ]


@app.route("/color.css")
def color_css():
    circles = db.query(Circle).all()
    return Response(
        render_template("color.css.jinja2", circles=circles),
        mimetype="text/css",
    )


@app.route("/")
@need_login
def issues():
    issues = get("orgs", "issues", session.get("token"))
    return render_template("issues.html.jinja2", issues=issues)


@app.route("/milestones")
@need_login
def milestones():
    milestones = []
    circles = db.query(Circle).all()
    beginning = (date.today() - timedelta(days=30)).isoformat()
    end = (date.today() + timedelta(days=60)).isoformat()

    with ThreadPoolExecutor(max_workers=50) as executor:
        for repository_name in session["repository_names"][48:53]:
            executor.submit(
                add_milestones,
                repository_name,
                milestones,
                session.get("token"),
                beginning=beginning,
                end=end,
            )

    return render_template(
        "milestones.html.jinja2", milestones=milestones, circles=circles
    )


@app.route(
    "/milestones/<repository_name>/" "<int:milestone_number>/set_circle",
    methods=("post",),
)
@need_login
def set_milestone_circle(milestone_number, repository_name):
    for circle_id, value in request.get_json().items():
        if value:
            milestone = MilestoneCircle(
                milestone_number=milestone_number,
                repo_name=repository_name,
                circle_id=circle_id,
            )
            db.add(milestone)
        else:
            db.query(MilestoneCircle).filter(
                MilestoneCircle.repo_name == repository_name,
                MilestoneCircle.milestone_number == milestone_number,
                MilestoneCircle.circle_id == circle_id,
            ).delete()
    db.commit()
    return "OK"


@app.route("/circles")
@need_login
def circles():
    circles = db.query(Circle).all()
    return render_template("circles.html.jinja2", circles=circles)


@app.route("/circles/<int:circle_id>")
@need_login
def circle(circle_id):
    circle = db.query(Circle).get(circle_id)
    return render_template(
        "circle.html.jinja2",
        circle=circle,
        milestones=circle_milestones(circle),
    )


@app.route("/roles/<int:role_id>", methods=("get", "post"))
@need_login
def circle_role(role_id):
    role = db.query(Role).get(role_id)
    if request.method == "POST":
        if role.role_type == "elected":
            focus = role.role_focuses[-1]
            if "add" in request.form:
                db.add(RoleFocusUser(role_focus_id=focus.role_focus_id))
            elif "delete" in request.form:
                db.query(RoleFocusUser).filter(
                    RoleFocusUser.role_focus_user_id
                    == int(request.form["delete"])
                ).delete()
            for key, value in request.form.items():
                if key in ("add", "delete"):
                    continue
                focus_user_type, focus_user_id = key.split("-")
                focus_user = db.query(RoleFocusUser).get(
                    int(focus_user_id)
                )
                if focus_user is None:
                    continue
                if focus_user_type == "start" and value:
                    focus_user.start_date = datetime.strptime(
                        value, "%Y-%m-%d"
                    )
                elif focus_user_type == "end" and value:
                    focus_user.end_date = datetime.strptime(
                        value, "%Y-%m-%d"
                    )
                elif focus_user_type == "user":
                    for user_id, user in session["users"].items():
                        if user["login"] == value:
                            focus_user.user_id = int(user_id)
                            break
        else:
            if "add" in request.form:
                db.add(RoleFocus(role=role))
            elif "delete" in request.form:
                db.query(RoleFocus).filter(
                    RoleFocus.role_focus_id == int(request.form["delete"])
                ).delete()
            for key, value in request.form.items():
                if key in ("add", "delete"):
                    continue
                focus_type, focus_id = key.split("-")
                focus = db.query(RoleFocus).get(int(focus_id))
                if focus is None:
                    continue
                if focus_type == "name":
                    focus.focus_name = value
                elif focus_type == "user":
                    for user_id, user in session["users"].items():
                        if user["login"] == value:
                            latest_user = focus.latest_user
                            if latest_user is None:
                                latest_user = RoleFocusUser(
                                    role_focus_id=focus.role_focus_id
                                )
                                db.add(latest_user)
                            latest_user.user_id = int(user_id)
                            break
        db.commit()
        if "add" in request.form or "delete" in request.form:
            return redirect(url_for("circle_role", role_id=role_id))
        else:
            return redirect(url_for("circle", circle_id=role.circle_id))
    return render_template("role.html.jinja2", role=role)


@app.route("/roles/<int:role_id>/edit", methods=("get", "post"))
@need_login
def circle_role_edit(role_id):
    role = db.query(Role).get(role_id)
    if request.method == "POST":
        for key in ("purpose", "domain", "accountabilities"):
            setattr(role, f"role_{key}", request.form[f"role_{key}"])
        db.commit()
        return redirect(url_for("circle_role", role_id=role_id))
    return render_template("role_edit.html.jinja2", role=role)


@app.route("/circles/<int:circle_id>/edit", methods=("get", "post"))
@need_login
def circle_edit(circle_id):
    circle = db.query(Circle).get(circle_id)
    if request.method == "POST":
        for key in ("name", "purpose", "domain", "accountabilities"):
            setattr(circle, f"circle_{key}", request.form[f"circle_{key}"])
        circle.label.color = request.form["color"]
        db.commit()
        return redirect(url_for("circle", circle_id=circle_id))
    return render_template("circle_edit.html.jinja2", circle=circle)


@app.route(
    "/circles/<int:circle_id>/report/create/<report_type>", methods=("post",)
)
@need_login
def circle_report_create(circle_id, report_type):
    circle = db.query(Circle).get(circle_id)
    report = Report(
        circle_id=circle_id,
        report_type=report_type,
        author_id=session["user_id"],
        modified_by=session["user_id"],
    )
    for user_id in circle.user_ids:
        db.add(
            ReportAttendee(
                report=report,
                user_id=user_id,
                user=session["users"].get(str(user_id)),
            )
        )
    if report_type == "Triage":
        for role in circle.roles:
            if role.is_active:
                for focus in role.role_focuses:
                    for item in focus.items:
                        if item.item_type == "checklist":
                            db.add(
                                ReportChecklist(
                                    report=report,
                                    content=item.content,
                                    item_id=item.item_id,
                                )
                            )
                        elif item.item_type == "indicator":
                            db.add(
                                ReportIndicator(
                                    report=report,
                                    content=item.content,
                                    item_id=item.item_id,
                                )
                            )
        for milestone in circle_milestones(circle):
            db.add(
                ReportMilestone(
                    report=report,
                    milestone_number=milestone["number"],
                    repo_name=milestone["repository_name"],
                    milestone=milestone,
                )
            )
    db.add(report)
    db.commit()
    return redirect(url_for("circle_report_edit", report_id=report.report_id))


@app.route("/circles/report/edit/<int:report_id>", methods=("get", "post"))
@need_login
def circle_report_edit(report_id):
    report = db.query(Report).get(report_id)
    if request.method == "POST":
        for attendee in report.attendees:
            attendee.checked = False
        for action in report.actions:
            action.checked = False
        report.content = None
        for key, value in request.form.items():
            keys = key.split("-", 3)[1:]
            if key.startswith("attendee-"):
                db.query(ReportAttendee).get(keys).checked = True
            elif key.startswith("action-"):
                db.query(ReportChecklist).get(keys).checked = True
            elif key.startswith("indicator-"):
                value = None if value == "" else float(value)
                db.query(ReportIndicator).get(keys).value = value
            elif key.startswith("milestone-"):
                value = None if value == "" else value
                report_milestone = db.query(ReportMilestone).get(keys)
                report_milestone.milestone["comment"] = value
                flag_modified(report_milestone, "milestone")
            elif key == "content":
                value = None if value == "" else value
                report.content = value
        db.commit()
        return redirect(url_for("circles"))
    return render_template("report.html.jinja2", report=report, edit=True)
