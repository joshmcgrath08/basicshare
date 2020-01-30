import base64
import os

import boto3

from aws_clients import KMS

def decrypt(blob):
    return KMS.decrypt(CiphertextBlob=base64.b64decode(blob))["Plaintext"].decode("utf-8")

if os.getenv("FLASK_DEBUG"):
    BASE_URL = "http://localhost:3000"
    ACCESS_CONTROL_ALLOW_ORIGIN = "*"
    def decrypt_env(env_var):
        return os.environ[env_var]
else:
    BASE_URL = "https://basicshare.io"
    ACCESS_CONTROL_ALLOW_ORIGIN = BASE_URL
    def decrypt_env(env_var):
        return decrypt(os.environ[env_var])

DEMO_API_KEY = decrypt_env("API_KEY")

RECAPTCHA_SECRET_KEY = decrypt_env("RECAPTCHA_SECRET_KEY")

RECAPTCHA_OVERRIDE = decrypt_env("RECAPTCHA_OVERRIDE")

MESSAGE_MAX_ACCESSES = 3

MESSAGE_EXPIRATION_SECONDS = 7 * 24 * 60 * 60

MAX_PARAM_SIZE = 4096
