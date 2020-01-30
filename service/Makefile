python := python3.7
site_packages := env/lib/$(python)/site-packages
sources := $(wildcard *.py)
zip := $(shell pwd)/lambda.zip

.PHONY: all
all: build

.PHONY: build
build: $(zip)

$(zip): clean
	# Only include the packages not already provided by AWS Lambda environment
	# This dramatically cuts down on the size of the zip, even if it's a little
	# annoying to add new dependencies and hacky.
	cd $(site_packages) ; zip -r9 $@ requests/* urllib3/* chardet/* certifi/* idna/* flask/* jinja2/* markupsafe/* werkzeug/* click/* itsdangerous/* -x '*/__pycache__/*'
	zip -g $@ $(sources)

.PHONY: clean
clean:
	rm -f $(zip)
