import flask as f

class HttpError(Exception):
    def __init__(self, message, status, **kwargs):
        super().__init__()
        self.message = message
        self.status = status
        self.extra_args = kwargs

    def to_response(self):
        msg_json = {
            "message": self.message
        }
        msg_json.update(self.extra_args)
        return f.make_response(f.jsonify(**msg_json), self.status)

    def to_json_internal(self):
        return {
            "message": self.message,
            "status": self.status,
            "extra_args": self.extra_args
        }
