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
from sqlalchemy import and_
from sqlalchemy.orm.attributes import flag_modified

from . import app, db, github
from .model import (
    Circle,
    Item,
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
from .utils import make_indicators_graph

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
    users = github.get(
        f'/teams/{app.config["GITHUB_TEAM_ID"]}/members',
        access_token=oauth_token,
        all_pages=True,
    )
    user_id = str(github.get("/user", access_token=oauth_token)["id"])
    authorized_ids = [str(user["id"]) for user in users]
    if user_id not in authorized_ids:
        flash("Authorization failed.")
        return abort(403)
    session["token"] = oauth_token
    session["user_id"] = user_id
    session["repository_names"] = [
        repository["name"]
        for repository in get("orgs", "repos", oauth_token)
        if not repository["archived"]
    ]
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


def get_circle_milestones(circle):
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
        for repository_name in session["repository_names"]:
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
    return render_template("circle/infos.html.jinja2", circle=circle)


@app.route("/circles/<int:circle_id>/actions")
@need_login
def circle_actions(circle_id):
    circle = db.query(Circle).get(circle_id)
    last_reports = (
        db.query(Report)
        .filter(Report.circle_id == circle.circle_id)
        .filter(Report.report_type == "Triage")
        .order_by(Report.created_at.desc())
        .limit(4)
        .all()
    )
    actions = (
        db.query(Item)
        .join(RoleFocus)
        .join(Role)
        .join(Circle)
        .filter(
            and_(
                Item.item_type == "checklist",
                Circle.circle_id == circle.circle_id,
            )
        )
        .all()
    )

    return render_template(
        "circle/actions.html.jinja2",
        circle=circle,
        actions=actions,
        last_reports=last_reports,
    )


def circle_roles_choices(circle):
    choices = []
    active_roles = [r for r in circle.roles if r.is_active]
    for role in active_roles:
        for role_focus in role.role_focuses:
            choices.append(
                {
                    "id": role_focus.role_focus_id,
                    "label": f"{role.role_name} {role_focus.focus_name}",
                }
            )
    return choices


@app.route(
    "/circles/<int:circle_id>/actions/<int:action_id>", methods=("get", "post")
)
@need_login
def circle_action(circle_id, action_id):
    action = db.query(Item).get(action_id)
    circle = db.query(Circle).get(circle_id)

    if request.method == "POST":
        action.content = request.form.get("content")
        action.role_focus_id = request.form.get("role_focus_id")
        db.commit()
        return redirect(url_for("circle_actions", circle_id=circle.circle_id))

    role_id = action.role_focus.role_focus_id

    all_roles = circle_roles_choices(circle)

    return render_template(
        "circle/item.html.jinja2",
        circle=circle,
        item=action,
        all_roles=all_roles,
        role_id=role_id,
        is_edit=True,
    )


@app.route("/circles/<int:circle_id>/actions/add", methods=("get", "post"))
@need_login
def circle_action_add(circle_id):
    circle = db.query(Circle).get(circle_id)

    if request.method == "POST":
        action = Item()
        action.item_type = "checklist"
        action.content = request.form.get("content")
        action.role_focus_id = request.form.get("role_focus_id")
        db.add(action)
        db.commit()
        return redirect(url_for("circle_actions", circle_id=circle.circle_id))

    all_roles = circle_roles_choices(circle)

    return render_template(
        "circle/item.html.jinja2",
        circle=circle,
        all_roles=all_roles,
        is_action=True,
        is_edit=False,
    )


@app.route(
    "/circles/<int:circle_id>/actions/<int:action_id>/delete",
    methods=("get", "post"),
)
@need_login
def circle_action_delete(circle_id, action_id):
    circle = db.query(Circle).get(circle_id)
    if request.method == "POST":
        if "delete" in request.form:
            db.query(Item).filter(Item.item_id == action_id).delete()
            db.commit()
        return redirect(url_for("circle_actions", circle_id=circle.circle_id))

    action = db.query(Item).get(action_id)
    return render_template("circle/item_delete.html.jinja2", item=action)


@app.route("/circles/<int:circle_id>/indicators")
@need_login
def circle_indicators(circle_id):
    circle = db.query(Circle).get(circle_id)

    last_reports = (
        db.query(Report)
        .filter(Report.circle_id == circle.circle_id)
        .filter(Report.report_type == "Triage")
        .order_by(Report.created_at.desc())
        .limit(8)
        .all()
    )

    indicators = (
        db.query(Item)
        .join(RoleFocus)
        .join(Role)
        .join(Circle)
        .filter(
            and_(
                Item.item_type == "indicator",
                Circle.circle_id == circle.circle_id,
            )
        )
        .all()
    )
    charts = make_indicators_graph(indicators, last_reports, circle.label.color)
    return render_template(
        "circle/indicators.html.jinja2",
        circle=circle,
        indicators=indicators,
        charts=charts,
    )


@app.route(
    "/circles/<int:circle_id>/indicators/<int:indicator_id>",
    methods=("get", "post"),
)
@need_login
def circle_indicator(circle_id, indicator_id):
    circle = db.query(Circle).get(circle_id)
    indicator = db.query(Item).get(indicator_id)
    role_id = indicator.role_focus.role_focus_id
    all_roles = circle_roles_choices(circle)
    if request.method == "POST":
        indicator.content = request.form.get("content")
        indicator.role_focus_id = request.form.get("role_focus_id")
        db.commit()
        return redirect(url_for("circle_indicators", circle_id=circle_id))

    return render_template(
        "circle/item.html.jinja2",
        circle=circle,
        item=indicator,
        role_id=role_id,
        all_roles=all_roles,
        is_edit=True,
    )


@app.route("/circles/<int:circle_id>/indicators/add", methods=("get", "post"))
@need_login
def circle_indicator_add(circle_id):
    circle = db.query(Circle).get(circle_id)

    if request.method == "POST":
        indicator = Item()
        indicator.item_type = "indicator"
        indicator.content = request.form.get("content")
        indicator.role_focus_id = request.form.get("role_focus_id")
        db.add(indicator)
        db.commit()
        return redirect(
            url_for("circle_indicators", circle_id=circle.circle_id)
        )

    all_roles = circle_roles_choices(circle)

    return render_template(
        "circle/item.html.jinja2",
        circle=circle,
        all_roles=all_roles,
        is_action=False,
        is_edit=False,
    )
    return render_template("circle/item.html.jinja2", circle=circle)


@app.route(
    "/circles/<int:circle_id>/indicators/<int:indicator_id>/delete",
    methods=("get", "post"),
)
@need_login
def circle_indicator_delete(circle_id, indicator_id):
    circle = db.query(Circle).get(circle_id)

    if request.method == "POST":
        if "delete" in request.form:
            db.query(Item).filter(Item.item_id == indicator_id).delete()
            db.commit()
        return redirect(
            url_for("circle_indicators", circle_id=circle.circle_id)
        )

    indicator = db.query(Item).get(indicator_id)
    return render_template(
        "circle/item_delete.html.jinja2", circle=circle, item=indicator
    )


@app.route("/circles/<int:circle_id>/milestones")
@need_login
def circle_milestones(circle_id):
    circle = db.query(Circle).get(circle_id)
    return render_template(
        "circle/milestones.html.jinja2",
        circle=circle,
        milestones=get_circle_milestones(circle),
    )


@app.route(
    (
        "/circles/<int:circle_id>/milestones/<repo_name>"
        "/<int:milestone_number>/delete"
    ),
    methods=("get", "post"),
)
@need_login
def circle_milestone_delete(circle_id, repo_name, milestone_number):
    milestone = db.query(MilestoneCircle).get(
        (circle_id, milestone_number, repo_name)
    )

    if request.method == "POST":
        if "delete" in request.form:
            db.query(MilestoneCircle).filter(
                and_(
                    MilestoneCircle.circle_id == circle_id,
                    MilestoneCircle.milestone_number == milestone_number,
                )
            ).delete()
            db.commit()
        return redirect(url_for("circle_milestones", circle_id=circle_id))

    return render_template(
        "circle/milestone_delete.html.jinja2", milestone=milestone
    )


@app.route("/circles/<int:circle_id>/roles")
@need_login
def circle_roles(circle_id):
    circle = db.query(Circle).get(circle_id)
    return render_template("circle/roles.html.jinja2", circle=circle)


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
                focus_user = db.query(RoleFocusUser).get(int(focus_user_id))
                if focus_user is None:
                    continue
                if focus_user_type == "start" and value:
                    focus_user.start_date = datetime.strptime(value, "%Y-%m-%d")
                elif focus_user_type == "end" and value:
                    focus_user.end_date = datetime.strptime(value, "%Y-%m-%d")
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
            return redirect(url_for("circle_roles", circle_id=role.circle_id))
    return render_template("role.html.jinja2", role=role, circle=role.circle)


@app.route("/roles/<int:role_id>/edit", methods=("get", "post"))
@need_login
def circle_role_edit(role_id):
    role = db.query(Role).get(role_id)
    if request.method == "POST":
        for key in ("name", "purpose", "domain", "accountabilities"):
            setattr(role, f"role_{key}", request.form[f"role_{key}"])
        db.commit()
        return redirect(url_for("circle_role", role_id=role_id))
    return render_template(
        "role_edit.html.jinja2", role=role, circle=role.circle
    )


@app.route("/circles/<int:circle_id>/roles/add", methods=("post",))
@need_login
def circle_role_add(circle_id):
    role = Role(
        circle_id=circle_id, role_name="Nouveau rôle", role_type="assigned"
    )
    db.add(role)
    db.commit()
    return redirect(url_for("circle_role_edit", role_id=role.role_id))


@app.route("/roles/<int:role_id>/delete", methods=("get", "post"))
@need_login
def circle_role_delete(role_id):
    role = db.query(Role).get(role_id)
    if request.method == "POST":
        if "delete" in request.form:
            db.query(RoleFocus).filter(RoleFocus.role_id == role_id).delete()
            db.query(Role).filter(Role.role_id == role_id).delete()
            db.commit()
        return redirect(url_for("circle_roles", circle_id=role.circle_id))
    return render_template("role_delete.html.jinja2", role=role)


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
    return render_template("circle/circle_edit.html.jinja2", circle=circle)


@app.route("/circles/<int:circle_id>/reports")
@need_login
def circle_reports(circle_id):
    circle = db.query(Circle).get(circle_id)
    circle_reports = (
        db.query(Report)
        .filter(Report.circle_id == circle_id)
        .order_by(Report.created_at.desc())
    )
    return render_template(
        "circle/reports.html.jinja2",
        circle=circle,
        circle_reports=circle_reports,
    )


@app.route("/circles/reports/<int:report_id>")
@need_login
def circle_report(report_id):
    report = db.query(Report).get(report_id)
    return render_template("report.html.jinja2", report=report, edit=False)


@app.route("/circles/reports/<int:report_id>/delete", methods=("get", "post"))
@need_login
def circle_report_delete(report_id):
    report = db.query(Report).get(report_id)
    if request.method == "POST":
        if "delete" in request.form:
            db.query(Report).filter(Report.report_id == report_id).delete()
            db.query(ReportAttendee).filter(
                ReportAttendee.report_id == report_id
            ).delete()
            db.query(ReportChecklist).filter(
                ReportChecklist.report_id == report_id
            ).delete()
            db.query(ReportIndicator).filter(
                ReportIndicator.report_id == report_id
            ).delete()
            db.query(ReportMilestone).filter(
                ReportMilestone.report_id == report_id
            ).delete()
            db.commit()
        return redirect(url_for("circle_reports", circle_id=report.circle_id))
    return render_template("report_delete.html.jinja2", report=report)


@app.route("/circles/<int:circle_id>/report/create", methods=("post",))
@need_login
def circle_report_create(circle_id):
    report_type = request.form.get("report_type")
    circle = db.query(Circle).get(circle_id)
    report = Report(
        circle_id=circle_id,
        report_type=report_type,
        author_id=session["user_id"],
        modified_by=session["user_id"],
    )

    attendees = set(circle.user_ids)
    for child in circle.circle_children:
        for role in child.roles:
            lead_link = role.role_type == "leadlink"
            second_link = role.role_name == "Second lien"
            if lead_link or second_link:
                for focus in role.role_focuses:
                    if focus.latest_user:
                        attendees.add(focus.latest_user.user_id)
                        break

    for user_id in attendees:
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
        for milestone in get_circle_milestones(circle):
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
        report.modified_by = session["user_id"]
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
        return redirect(url_for("circle_reports", circle_id=report.circle_id))
    return render_template("report.html.jinja2", report=report, edit=True)
