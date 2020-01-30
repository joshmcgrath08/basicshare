# Overview

This project is intended to provide a simple mechanism for privately sharing small blobs of text (e.g. links). All encryption, decryption, key generation, and key sharing happen entirely on the client, ensuring the service is unable to decrypt any of the shared content. A two-factor scheme is employed to separate the capability of retrieving the encrypted message and the capability of decrypting the message.

# Terms

- __Sender__: One who wants to send a secret
- __Receiver__: One who wants to receive a secret
- __Service__: The HTTP service/website
- __Client__: The software running (presumably in a web browser) local to the Sender or Receiver
- __Payload__: The content shared by Sender with Receiver
- __Message__: An encrypted Payload, Sender name, Receiver email or SMS, etc. stored by Service
- __Id__: An identifier used by Sender, Receiver, and System to refer to a message
- __Nonce__: A secret shared by Service with Receiver
- __Message Link__: A URL containing Id and Nonce that is a capability for retrieving a Message
- __Passphrase__: A shared secret between Sender and Receiver, unknown to Service, that allows decrypting the Message Payload
- __Passphrase Link__: A URL containing Id and Passphrase (as a fragment) to be used for decrypting a Message

# Use Cases

## Basic

### Send
0. Sender specifies their name in Client
1. Sender specifies intended Receiver in Client
2. Sender specifies Payload to share in Client
3. Sender Client generates Passphrase and encrypts Message
4. Sender submits create Message request to Service
5. Service returns Message Id to Sender
6. Service sends Message Link (Id + Nonce) to Receiver via email or SMS
7. Sender shares Passphrase Link (Id + Passphrase) from Client with Receiver via different channel (e.g. email, SMS, chat)

### Receive
1. Receiver receives email or SMS from Service with Message Link, clicks Message Link
2. Receiver Client sends request to Service to retrieve Message by Id and Nonce
3. Receiver receives chat message directly from Sender with Passphrase Link, clicks Link
4. Receiver Client decrypts encrypted Payload and displays to Receiver

# Technology Choices

- AWS DynamoDB for all persistence
- AWS Lambda is used for execution of the service code
- AWS API Gateway is used for routing HTTP requests to Lambda
- AWS CloudWatch Logs is used for logging from Lambda
- AWS Route53 is used for registering the `basicshare.io` domain
- AWS Certificate Manager is used for issuing SSL certificates
- AWS SES for sending emails
    + Used "Rule Sets" for Incoming Email along with email verification and 'Domains" to allow sending from `notify@basichsare.io`
- [reCAPTCHA](https://www.google.com/recaptcha/admin#list) to protect send API from abuse
- Client-side encryption/decryption via [sjcl](https://github.com/bitwiseshiftleft/sjcl/)
- [URL Fragments](https://en.wikipedia.org/wiki/Fragment_identifier) to share passwords as links without being sent to the server
- React via [Create React App](https://github.com/facebookincubator/create-react-app) for front end

# Testing

## Local (using Moto)

```sh
cd service
source env/bin/activate
env FLASK_DEBUG=true API_KEY=dummy RECAPTCHA_SECRET_KEY=dummy RECAPTCHA_OVERRIDE=dummy python server.py &
env RECAPTCHA_OVERRIDE=dummy API_KEY=dummy EMAIL=dummy@dummy SMS=+10000000000 URL_BASE=http://localhost:5000 MODE=moto pytest test/test_requests.py
```

## Lambda

```sh
cd service
env RECAPTCHA_OVERRIDE=<override key> API_KEY=<api key> EMAIL=<email> SMS=<sms> URL_BASE=https://api.basicshare.io MODE=lambda pytest test/test_requests.py
```

# Development

## Running Flask Server

```sh
cd service
source env/bin/activate
env FLASK_DEBUG=true API_KEY=dummy RECAPTCHA_SECRET_KEY=dummy RECAPTCHA_OVERRIDE=dummy python server.py
```

## Running React App
```sh
cd web
env REACT_APP_DEBUG=true REACT_APP_API_URL=http://localhost:5000 REACT_APP_API_KEY=dummy yarn start
```

# Deploying

## Flask Server

```sh
cd service
make
# Upload lambda.zip to Lambda
```

## React App

```sh
env REACT_APP_DEBUG=false REACT_APP_API_URL=https://api.basicshare.io REACT_APP_API_KEY=<api key> yarn build
# Upload contents of build/ directory to S3 bucket
```
