"""
Module implementing read_receipt abstraction and conversions.
"""

import collections
import datetime

from ddb_utils import *

ReadReceipt = collections.namedtuple("ReadReceipt", ["id", "create_datetime", "ddb_ttl"])

def new_read_receipt(id_, expiration_seconds):
    now = datetime.datetime.utcnow()
    delta = datetime.timedelta(seconds=expiration_seconds)
    ddb_ttl = int((now + delta).strftime("%s"))
    return ReadReceipt(
        id_,
        now,
        ddb_ttl)

def read_receipt_to_ddb(read_receipt):
    res = {
        "id": ddb_str(str(read_receipt.id)),
        "create_datetime": ddb_datetime(read_receipt.create_datetime),
        "ddb_ttl": ddb_num(read_receipt.ddb_ttl)
    }

    return ddb_filter_nulls(res)

