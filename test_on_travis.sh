#!/bin/bash

set -eux

cd browserstack

pip3 install -r requirements.txt

python3 test.py
