from server import app
import wsgi

def lambda_handler(event, context):
    response = wsgi.Response()
    try:
        environ = wsgi.make_environ(event)
        response.write(next(app(environ, response.start_response)))
    except Exception as e:
        print("Unhandle exception in WSGI", e)
        raise e
    finally:
        return response.get_response()
