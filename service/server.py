import logging
import re
import sys
import uuid

import flask as f
import werkzeug.exceptions

import app_impl
from constants import ACCESS_CONTROL_ALLOW_ORIGIN, MAX_PARAM_SIZE
from exceptions import HttpError

app = f.Flask(__name__)
app.logger.setLevel(logging.DEBUG)

################################################################################
##### Routes
################################################################################

@app.route("/messages/send", methods=["POST"])
def send():
    _assert_json(f.request)
    j = f.request.get_json()
    _assert_params(
        j,
        ("senderName", str),
        ("receiver", "receiver"),
        ("payload", str),
        ("description", str, False),
        ("recaptchaVerification", str),
        ("recaptchaOverride", str, False))
    return f.make_response(f.jsonify(
        app_impl.put_message(
            j["senderName"],
            j["receiver"]["type"],
            j["receiver"]["value"],
            j["payload"],
            j.get("description"),
            j["recaptchaVerification"],
            j.get("recaptchaOverride"))),
        201)

@app.route("/messages/receive", methods=["POST"])
def receive():
    _assert_json(f.request)
    j = f.request.get_json()
    _assert_params(
        j,
        ("id", "uuid"),
        ("nonce", "uuid"))
    return f.jsonify(app_impl.get_message(j["id"], j["nonce"]))

@app.route("/messages/markasread", methods=["POST"])
def mark_as_read():
    _assert_json(f.request)
    j = f.request.get_json()
    _assert_params(j, ("id", "uuid"))
    return f.jsonify(app_impl.mark_as_read(j["id"]))

CORS_HEADERS = {
    "Access-Control-Allow-Origin": ACCESS_CONTROL_ALLOW_ORIGIN,
    "Vary": "Origin",
    "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
    "Access-Control-Allow-Methods": "POST"
}

@app.after_request
def handle_options(response):
    for k in CORS_HEADERS:
        response.headers[k] = CORS_HEADERS[k]
    return response

@app.errorhandler(Exception)
def handle_error(e):
    if isinstance(e, HttpError):
        app.logger.info("Error thrown by application: {}".format(e.to_json_internal()))
        return e.to_response()
    elif isinstance(e, werkzeug.exceptions.HTTPException):
        app.logger.exception("Something went wrong in Flask: %s", e)
        return e
    else:
        app.logger.exception("Unexpected server error: {}".format(e))
        msg_json = {
            "message": "An unexpected server error occurrred"
        }
        return f.make_response(f.jsonify(**msg_json), 500)

################################################################################
##### Parameter validation
################################################################################

def _assert_json(r):
    _assert(
        r.headers.get("Content-Type", None) == "application/json" and r.get_json() is not None,
        "Content-Type must be application/json and body must be valid JSON")

def _assert_params(r, *params):
    for p in params:
        name = p[0]
        ty = p[1]
        val = r.get(name, None)

        required = len(p) < 3 or p[2]
        _assert(
            val is not None or not required,
            "Missing required parameter",
            name=name)

        _assert(
            sys.getsizeof(val) <= MAX_PARAM_SIZE,
            "Parameter too large",
            max_size=MAX_PARAM_SIZE,
            name=name)

        if isinstance(ty, type):
            _assert(
                val is None or isinstance(val, ty),
                "Invalid type",
                name=name)
        elif ty == "uuid":
            _assert(
                isinstance(val, str) and _is_valid_uuid(val),
                "Invalid type",
                name=name)
        elif ty == "receiver":
            _assert(
                isinstance(val, dict),
                "Invalid type",
                name=name)
            _assert_valid_receiver(val)
        else:
            raise ValueError("Invalid type to validate {}".format(ty))

def _assert_valid_receiver(receiver):
    _assert(
        receiver.get("type") is not None,
        "Missing required parameter",
        name="receiver.type")
    _assert(
        isinstance(receiver["type"], str),
        "Invalid type",
        name="receiver.type")
    _assert(
        receiver["type"] in ["email", "sms"],
        "Invalid value",
        name="receiver.type")
    _assert(
        receiver.get("value") is not None,
        "Missing required parameter",
        name="receiver.value")
    _assert(
        isinstance(receiver["value"], str),
        "Invalid type",
        name="receiver.value")
    if receiver["type"] == "email":
        _assert(
            _is_valid_email(receiver["value"]),
            "Invalid value",
            name="receiver.value")

def _is_valid_email(s):
    return re.match(
        r"^[a-zA-Z0-9_.-]+(\+[a-zA-Z0-9_.-]+)?@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)*$",
        s)

def _is_valid_uuid(s):
    try:
        uuid.UUID(s)
        return True
    except:
        return False

def _assert(pred, msg, status=400, **kwargs):
    if not pred:
        raise HttpError(msg, status, **kwargs)

if __name__ == "__main__":
    # For running in dev environment
    app.run()
