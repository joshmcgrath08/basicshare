import json
import os
import re
import requests
import time
import uuid

SENDER_NAME = "Fake sender name"
DESCRIPTION = "Fake decription"
RECAPTCHA_VERIFICATION = "Fake recaptcha verification"

# making requests

def do_request(
        resource, data, request_transform=json.dumps, response_transform=json.loads,
        content_type="application/json", request_fn=requests.post):
    url = "{}/messages/{}".format(URL_BASE, resource)
    headers = {"X-Api-Key": API_KEY, "Content-Type": content_type}
    if MODE == "lambda":
        time.sleep(2.0)
    r = request_fn(url, headers=headers, data=request_transform(data))
    return (response_transform(r.text), r.status_code)

def do_send(request):
    return do_request("send", request)

def do_receive(request):
    return do_request("receive", request)

def send_email(recaptcha_override=None):
    # Because RECAPTCHA_OVERRIDE isn't instantiated until setup_global_from_env is called
    if recaptcha_override is None:
        recaptcha_override = RECAPTCHA_OVERRIDE
    return send(recaptcha_override, {"type": "email", "value": EMAIL})

def send_sms(recaptcha_override):
    return send(recaptcha_override, {"type": "sms", "value": SMS})

def send(recaptcha_override, receiver):
    request = {
        "senderName": SENDER_NAME,
        "receiver": receiver,
        "payload": str(uuid.uuid4()),
        "description": DESCRIPTION,
        "recaptchaVerification": RECAPTCHA_VERIFICATION,
        "recaptchaOverride": RECAPTCHA_OVERRIDE
    }
    response = do_send(request)
    return (request, response)

def receive(id_, nonce):
    request = {
        "id": id_,
        "nonce": nonce
    }
    response = do_receive(request)
    return (request, response)

# setup/teardown

def setup_global_from_env(variable, validator):
    if variable not in os.environ:
        raise ValueError("Environment variable \"{}\" is not set".format(variable))
    else:
        value = os.environ[variable]
        if validator:
            validator(value)
        globals()[variable] = value

def validate_sms(s):
    if not re.match(r"^\+1\d{10}$", s):
        raise ValueError("\"{}\" is not a valid SMS number".format(s))

def validate_email(s):
    if not re.match(r"^[A-Za-z0-9._+-]+@[a-z]+\.[a-z]+$", s):
        raise ValueError("\"{}\" is not a valid email".format(s))

def validate_mode(m):
    assert m in ["moto", "lambda"]

def setup_function(function):
    for v in [("API_KEY", None), ("EMAIL", validate_email), ("SMS", validate_sms), ("RECAPTCHA_OVERRIDE", None), ("URL_BASE", None), ("MODE", validate_mode)]:
        setup_global_from_env(*v)

# test cases

## good

### send

def test_send_email_good():
    request, response = send_email()
    assert 201 == response[1]
    for k in request:
        if k not in ["recaptchaOverride", "recaptchaVerification"]:
            assert request[k] == response[0][k]
    assert uuid.UUID(response[0]["id"]) is not None
    assert uuid.UUID(response[0]["nonce"]) is not None

# Known issues with moto: cannot publish SMS notifications via SNS without a topic
# https://github.com/spulec/moto/issues/2198
def test_send_sms_good():
    if MODE == "lambda":
        request, response = send_sms(RECAPTCHA_OVERRIDE)
        assert 201 == response[1]
        for k in request:
            if k not in ["recaptchaOverride", "recaptchaVerification"]:
                assert request[k] == response[0][k]
        assert uuid.UUID(response[0]["id"]) is not None
        assert uuid.UUID(response[0]["nonce"]) is not None

### send + receive

def test_send_receive():
    send_request, send_response = send_email()
    assert 201 == send_response[1]
    for k in send_request:
        if k not in ["recaptchaOverride", "recaptchaVerification"]:
            assert send_request[k] == send_response[0][k]
    assert uuid.UUID(send_response[0]["id"]) is not None
    assert uuid.UUID(send_response[0]["nonce"]) is not None

    receive_request, receive_response = receive(send_response[0]["id"], send_response[0]["nonce"])
    assert 200 == receive_response[1]
    for k in send_response[0]:
        assert send_response[0][k] == receive_response[0][k]

## bad

def test_invalid_path():
    assert do_request("foo", {}, response_transform=lambda x: x)[1] == 404

def test_invalid_method():
    if MODE == "lambda":
        assert do_request("receive", {}, response_transform=lambda x: x, request_fn=requests.get)[1] == 403
    elif MODE == "moto":
        assert do_request("receive", {}, response_transform=lambda x: x, request_fn=requests.get)[1] == 405

### send

def test_send_invalid_params():
    for param in [
            "senderName",
            "receiver",
            "payload",
            "description",
            "recaptchaVerification",
            "recaptchaOverride",
            "receiver.type",
            "receiver.value"
    ]:
        req = {
            "senderName": "Bob",
            "receiver": {
                "type": "email",
                "value": "a@b.c"
            },
            "payload": "a payload",
            "description": "a description",
            "recaptchaVerification": "a recaptcha verification",
            "recaptchaOverride": "a recaptcha override"
        }

        target = req
        for pp in param.split(".")[:-1]:
            target = target[pp]
        target[param.split(".")[-1]] = 5
        expected = ({"message": "Invalid type", "name": param}, 400)
        assert do_request("send", req) == expected

def test_send_invalid_receiver_params():
    req = {
        "senderName": "Bob",
        "receiver": {
            "type": "email",
            "value": "a@b.c"
        },
        "payload": "a payload",
        "description": "a description",
        "recaptchaVerification": "a recaptcha verification",
        "recaptchaOverride": "a recaptcha override"
    }

    req2 = json.loads(json.dumps(req))
    req2["receiver"]["type"] = "foo"
    expected2 = ({"message": "Invalid value", "name": "receiver.type"}, 400)
    assert do_request("send", req2) == expected2

    req3 = json.loads(json.dumps(req))
    req3["receiver"]["value"] = "foo"
    expected3 = ({"message": "Invalid value", "name": "receiver.value"}, 400)
    assert do_request("send", req3) == expected3


def test_send_missing_params():
    for param in [
            "senderName",
            "receiver",
            "payload",
            "recaptchaVerification",
            "receiver.type",
            "receiver.value"
    ]:
        req = {
            "senderName": "Bob",
            "receiver": {
                "type": "email",
                "value": "a@b.c"
            },
            "payload": "a payload",
            "recaptchaVerification": "a recaptcha verification"
        }
        target = req
        for pp in param.split(".")[:-1]:
            target = target[pp]
        del target[param.split(".")[-1]]
        expected = ({"message": "Missing required parameter", "name": param}, 400)
        assert do_request("send", req) == expected

def test_send_invalid_recaptcha():
    req = {
        "senderName": "Bob",
        "receiver": {
            "type": "email",
            "value": "a@b.c"
        },
        "payload": "a payload",
        "description": "a description",
        "recaptchaVerification": "invalidrecaptchaverification"
    }
    assert do_request("send", req) == ({"message": "reCAPTCHA verification is invalid", "recaptchaVerification": "invalidrecaptchaverification"}, 400)

### receive

def test_receive_not_json():
    expected = ({"message": "Content-Type must be application/json and body must be valid JSON"}, 400)
    assert do_request("receive", "", content_type="text/plain") == expected

def test_receive_invalid_and_missing_params():
    for param in ["id", "nonce"]:
        for err in ["missing", "wrong_type"]:
            req = {
                "id": "a090575f-0892-49c7-b9c2-ebe228272316",
                "nonce": "81b4c1cb-1432-40cb-8921-05a40fb3f680"
            }
            if err == "missing":
                del req[param]
                expected = ({"message": "Missing required parameter", "name": param}, 400)
            else:
                req[param] = 5
                expected = ({"message": "Invalid type", "name": param}, 400)
            assert do_request("receive", req) == expected

def test_receive_invalid_id():
    id_ = str(uuid.uuid4())
    nonce = str(uuid.uuid4())
    receive_request, receive_response = receive(id_, nonce)
    assert ({"message": "Invalid nonce for message", "nonce": nonce, "messageId": id_}, 403) == receive_response

### send + receive

def test_send_receive_invalid_nonce():
    send_request, send_response = send_email()
    id_ = send_response[0]["id"]
    nonce = str(uuid.uuid4())
    receive_request, receive_response = receive(id_, nonce)
    assert ({"message": "Invalid nonce for message", "nonce": nonce, "messageId": id_}, 403) == receive_response

def test_send_receive_invalid_nonce_thrice():
    send_request, send_response = send_email()
    id_ = send_response[0]["id"]
    old_nonce = send_response[0]["nonce"]
    new_nonce = str(uuid.uuid4())
    receive(id_, new_nonce)
    receive(id_, new_nonce)
    receive(id_, new_nonce)
    receive_request, receive_response = receive(id_, new_nonce)
    assert ({"message": "Invalid nonce for message", "nonce": new_nonce, "messageId": id_}, 403) == receive_response

def test_send_receive_valid_nonce_thrice():
    send_request, send_response = send_email()
    id_ = send_response[0]["id"]
    nonce = send_response[0]["nonce"]
    receive(id_, nonce)
    receive(id_, nonce)
    receive(id_, nonce)
    receive_request, receive_response = receive(id_, nonce)
    assert ({"message": "Message has expired", "messageId": id_}, 410) == receive_response
