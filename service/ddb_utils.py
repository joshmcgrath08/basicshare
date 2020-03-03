def id_to_ddb(id_):
    return {
        "id": {
            "S": str(id_)
        }
    }

def ddb_str(s):
    return {"S": s}

def ddb_num(n):
    return {"N": str(n)}

def ddb_datetime(dt):
    if dt is not None:
        dt = dt.isoformat()
    return ddb_str(dt)

def ddb_filter_nulls(o):
    res = {}
    for k in o:
        if o[k][list(o[k].keys())[0]] is not None:
            res[k] = o[k]
    return res
