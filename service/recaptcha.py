"""
Module for verifying reCAPTCHA responses.
"""

import json
import logging
import requests

from constants import RECAPTCHA_SECRET_KEY, RECAPTCHA_OVERRIDE
from exceptions import HttpError

logger = logging.getLogger()

def verify_recaptcha(recaptcha_verification, recaptcha_override):
    if recaptcha_override is not None:
        if recaptcha_override != RECAPTCHA_OVERRIDE:
            raise HttpError(
                "Invalid reCAPTCHA override",
                400,
                recaptchaOverride=recaptcha_override)
        else:
            return

    response = requests.post(
        "https://www.google.com/recaptcha/api/siteverify",
        data={"secret": RECAPTCHA_SECRET_KEY, "response": recaptcha_verification})
    errors = json.loads(response.text).get("error-codes", None) or []

    if response.status_code != 200:
        raise HttpError(
            "Failed to verify reCAPTCHA",
            400,
            recaptchaVerification=recptcha_verification)

    if not json.loads(response.text)["success"] or "invalid-input-response" in errors:
        raise HttpError(
            "reCAPTCHA verification is invalid",
            400,
            recaptchaVerification=recaptcha_verification)

    if len(errors) > 0:
        raise HttpError(
            "Failed to verify reCAPTCHA",
            400,
            recaptchaVerification=recaptcha_verification)
