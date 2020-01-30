"""
Module implementing business logic of message handling.
"""

import datetime
import logging
import uuid

from constants import MESSAGE_MAX_ACCESSES, MESSAGE_EXPIRATION_SECONDS
from exceptions import HttpError
from message import new_message, message_to_external_json
from notification import send_notification
from recaptcha import verify_recaptcha
import store

logger = logging.getLogger()

def put_message(
        sender_name, receiver_type, receiver_value, payload,
        description, recaptcha_verification, recaptcha_override):
    verify_recaptcha(recaptcha_verification, recaptcha_override)
    message = new_message(
        sender_name, receiver_type, receiver_value,
        payload, description, MESSAGE_EXPIRATION_SECONDS)
    logger.info("Storing message {}".format(message.id))
    store.put_message(message)
    send_notification(message)
    return message_to_external_json(message)

def get_message(message_id, nonce):
    message_id = uuid.UUID(message_id)
    nonce = uuid.UUID(nonce)
    message = store.get_message(message_id)

    logger.info("Retrieving message {} with nonce {}".format(message_id, nonce))

    if message.nonce != nonce:
        logger.warn("Invalid nonce for message_id {}. Expected {} but got {}".format(
            message_id, message.nonce, nonce))
        raise HttpError("Invalid nonce for message", 403, messageId=message_id, nonce=nonce)

    if message.valid_until_datetime < datetime.datetime.utcnow():
        logger.warn("Message {} has expired due to time".format(message_id))
        raise HttpError("Message has expired", 410, messageId=message_id)

    if message.access_count > MESSAGE_MAX_ACCESSES:
        logger.warn("Message {} has exceeded maximum accesses".format(message_id))
        raise HttpError("Message has expired", 410, messageId=message_id)

    return message_to_external_json(message)
