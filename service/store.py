"""
Module storing and retrieving messages by message id.
"""

import logging

import boto3
import botocore

from aws_clients import DDB
from exceptions import HttpError
from message import message_to_ddb, ddb_to_message, id_to_ddb

MESSAGE_TABLE = "Messages"

logger = logging.getLogger()

def put_message(message):
    DDB.put_item(TableName=MESSAGE_TABLE, Item=message_to_ddb(message))

def get_message(message_id):
    key_obj = id_to_ddb(message_id)
    try:
        ddb_res = DDB.update_item(TableName=MESSAGE_TABLE,
                                  Key=key_obj,
                                  UpdateExpression="ADD access_count :one",
                                  ExpressionAttributeValues={
                                      ":one": {"N": "1"}
                                  },
                                  ReturnValues="ALL_NEW")
        return ddb_to_message(ddb_res["Attributes"])
    except botocore.exceptions.ClientError as e:
        if e.response["Error"]["Code"] == "ValidationException":
            logger.warn("Message {} does not exist".format(message_id))
            raise HttpError("Message does not exist", 404, messageId=message_id)
        else:
            raise e
