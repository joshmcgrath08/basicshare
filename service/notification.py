"""
Module for sending message notifications.
"""

import logging

import boto3
import botocore

from aws_clients import SES, SNS
from constants import BASE_URL
from exceptions import HttpError

logger = logging.getLogger()

CHARSET = "UTF-8"

def send_notification(message):
    receiver_type = message.receiver_type
    if receiver_type == "email":
        return send_email_notification(message)
    elif receiver_type == "sms":
        return send_sms_notification(message)
    else:
        raise ValueError("Invalid receiver type {}. This is a bug.".format(receiver_type))

def send_sms_notification(message):
    SNS.publish(PhoneNumber=message.receiver_value,
                Subject=message_subject(message),
                Message=message_body(message))

def send_email_notification(message):
    url = get_view_url(message)
    try:
        SES.send_email(Destination={
            "ToAddresses": [
                message.receiver_value
            ]
        },
        Message={
            "Body": {
                "Text": {
                    "Charset": CHARSET,
                    "Data": message_body(message)
                }
            },
            "Subject": {
                "Charset": CHARSET,
                "Data": message_subject(message)
            }
        },
        Source="notify@basicshare.io")
    except botocore.exceptions.ClientError as e:
        if e.response["Error"]["Code"] == "MessageRejected" and "Email address is not verified" in e.response["Error"]["Message"]:
            logger.warn("Failed to send SES email {}".format(e))
            raise HttpError(
                "Email address not verified",
                400,
                emailAddress=message.receiver_value)
        else:
            raise e

def message_subject(message):
    return "{} shared a message with you".format(message.sender_name)

def message_body(message):
    res = [message_subject(message)]
    if message.description is not None:
        res.append("Description: " + message.description)
    res.append(get_view_url(message))
    res.append("What's Next?\nYou will receive a second message from {} with a password.".format(
        message.sender_name))
    return "\n\n".join(res)

def get_view_url(message):
    return "{}/?mode=view&id={}&nonce={}".format(BASE_URL, message.id, message.nonce)
