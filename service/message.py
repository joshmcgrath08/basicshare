"""
Module implementing the message abstraction and conversions.
"""

import collections
import datetime
import dateutil.parser
import uuid

Message = collections.namedtuple(
    "Message", ["sender_name",
                "receiver_type",
                "receiver_value",
                "payload",
                "description",
                "id",
                "nonce",
                "create_datetime",
                "valid_until_datetime",
                "access_datetime",
                "access_count",
                "ddb_ttl"])

def new_message(
        sender_name, receiver_type, receiver_value,
        payload, description, expiration_seconds):
    now = datetime.datetime.utcnow()
    expiration = now + datetime.timedelta(seconds=expiration_seconds)
    delta = datetime.timedelta(seconds=2*expiration_seconds)
    ddb_ttl = int((now + delta).strftime("%s"))
    return Message(sender_name,
                   receiver_type,
                   receiver_value,
                   payload,
                   description,
                   uuid.uuid4(),
                   uuid.uuid4(),
                   now,
                   expiration,
                   None,
                   0,
                   ddb_ttl)

def id_to_ddb(message_id):
    return {
        "id": {
            "S": str(message_id)
        }
    }

def message_to_ddb(message):
    def ddb_str(s):
        return {"S": s}

    def ddb_num(n):
        return {"N": str(n)}

    def ddb_datetime(dt):
        if dt is not None:
            dt = dt.isoformat()
        return ddb_str(dt)

    def filter_nulls(o):
        res = {}
        for k in o:
            if o[k][list(o[k].keys())[0]] is not None:
                res[k] = o[k]
        return res

    res = {
        "sender_name": ddb_str(message.sender_name),
        "receiver_type": ddb_str(message.receiver_type),
        "receiver_value": ddb_str(message.receiver_value),
        "payload": ddb_str(message.payload),
        "description": ddb_str(message.description),

        "id": ddb_str(str(message.id)),
        "nonce": ddb_str(str(message.nonce)),
        "create_datetime": ddb_datetime(message.create_datetime),
        "valid_until_datetime": ddb_datetime(message.valid_until_datetime),
        "access_datetime": ddb_datetime(message.access_datetime),
        "access_count": ddb_num(message.access_count),
        "ddb_ttl": ddb_num(message.ddb_ttl)
    }

    return filter_nulls(res)

def message_to_external_json(message):
    def format_datetime(dt):
        if dt is None:
            return None
        else:
            return dt.isoformat()

    return {
        "senderName": message.sender_name,
        "receiver": {
            "type": message.receiver_type,
            "value": message.receiver_value
        },
        "payload": message.payload,
        "description": message.description,
        "id": str(message.id),
        "nonce": str(message.nonce)
    }

def ddb_to_message(ddb_value):
    def get(key, transform=lambda x: x):
        r = ddb_value.get(key, None)
        if r is not None:
            r = list(r.values())[0]
            if r is not None:
                return transform(r)
        return None

    def get_str(key):
        return get(key)

    def get_int(key):
        return get(key, int)

    def get_datetime(key):
        return get(key, dateutil.parser.parse)

    def get_uuid(key):
        return get(key, lambda x: uuid.UUID(x))

    return Message(
        get_str("sender_name"),
        get_str("receiver_type"),
        get_str("receiver_value"),
        get_str("payload"),
        get_str("description"),
        get_uuid("id"),
        get_uuid("nonce"),
        get_datetime("create_datetime"),
        get_datetime("valid_until_datetime"),
        get_datetime("access_datetime"),
        get_int("access_count"),
        get_int("ddb_ttl"))
