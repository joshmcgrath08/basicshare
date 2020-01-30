import io
import sys
import urllib.parse as up

def make_environ(event):
    """"
    As documented in https://www.python.org/dev/peps/pep-0333/
    and https://docs.aws.amazon.com/lambda/latest/dg/with-on-demand-https.html
    """
    headers = {}
    for k in event["headers"]:
        headers[k.lower()] = event["headers"][k]

    environ = {
        "REQUEST_METHOD": event["httpMethod"],
        "SCRIPT_NAME": "",
        "PATH_INFO": event["path"],
        "QUERY_STRING": up.urlencode(event.get("queryStringParameters") or {}),
        "CONTENT_TYPE": headers.get("content-type"),
        # Not passed along by API Gateway
        "CONTENT_LENGTH": len(event["body"]) if event["body"] is not None else None,
        "SERVER_NAME": headers["x-forwarded-for"],
        "SERVER_PORT": headers["x-forwarded-port"],
        "SERVER_PROTOCOL": "HTTP/1.1",
        "wsgi.version": (1,0),
        "wsgi.url_scheme": headers["x-forwarded-proto"],
        "wsgi.input": io.StringIO(event["body"]),
        "wsgi.errors": sys.stdout,
        "wsgi.multithread": False,
        "wsgi.multiprocess": False,
        "wsgi.run_once": True
    }
    return environ


class Response(object):
    def __init__(self):
        self.status = 500
        self.response_headers = {}
        self.body_data = None

    def start_response(self, status, response_headers, exc_info=None):
        self.status = status.split(" ")[0]
        self.response_headers = dict(response_headers)
        return self.write

    def write(self, body_data):
        self.body_data = body_data

    def get_response(self):
        return {
            "statusCode": self.status,
            "body": self.body_data and self.body_data.decode("utf-8"),
            "headers": self.response_headers
        }
