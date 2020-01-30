import os
import sys

import boto3

if os.getenv("FLASK_DEBUG"):
    import moto
    moto.mock_dynamodb2().start()
    moto.mock_kms().start()
    moto.mock_ses().start()
    moto.mock_sns().start()

    DDB = boto3.client("dynamodb")
    DDB.create_table(
        AttributeDefinitions=[
            {
                "AttributeName": "id",
                "AttributeType": "S"
            }
        ],
        TableName="Messages",
        KeySchema=[
            {
                "AttributeName": "id",
                "KeyType": "HASH"
            }
        ]
    )

    KMS = boto3.client("kms")

    SES = boto3.client("ses")
    SES.verify_email_identity(EmailAddress="notify@basicshare.io")

    ses_send_email = SES.send_email
    def _ses_send_email_override(*args, **kwargs):
        print("Sending email", args, kwargs, file=sys.stderr)
        ses_send_email(*args, **kwargs)
    SES.send_email = _ses_send_email_override

    SNS = boto3.client("sns")
    sns_publish = SNS.publish
    def _sns_publish_override(*args, **kwargs):
        print("Publishing SMS", args, kwargs, file=sys.stderr)
        sns_publish(*args, **kwargs)
    SNS.publish = _sns_publish_override

else:
    KMS = boto3.client("kms")
    SES = boto3.client("ses")
    SNS = boto3.client("sns")
    DDB = boto3.client("dynamodb")
