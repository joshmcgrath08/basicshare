import React from 'react';
import { Button, FormGroup, FormControl, FormText, Card } from 'react-bootstrap';
import Joi from 'joi-browser';

import ValidatedStep from './ValidatedStep';

class ReceiverStep extends ValidatedStep {
    constructor(props) {
        super(props);
        this.validator = this.validator.bind(this);
        this.contactSelector = this.contactSelector.bind(this);
    }

    validator() {
        let validator;
        let value = this.props.value;
        if (this.props.type === "sms") {
            value = value.replace(/(\(|\)|-| )/g, "");
            validator = Joi.string().regex(/^\+\d{11,14}$/).required();
        } else {
            validator = Joi.string().email().required();
        }
        return validator.validate(value);
    }

    componentDidMount() {
        this.focusInput.focus();
    }

    contactSelector(e) {
        const component = this;
        const cp = component.props.type === "sms" ? "tel" : "email";
        window.navigator.contacts.select([cp], {}).then(
            (contacts) => {
                if (contacts && contacts[0] && contacts[0][cp] && contacts[0][cp][0]) {
                    let cv = contacts[0][cp][0];
                    if (cp === "tel") {
                        cv = component.formatPhoneNumber(cv);
                    }
                    component.props.onValueChange({target: {value: cv}});
                }
            });
    }

    formatPhoneNumber(num) {
        if (num.startsWith("+")) {
            return num;
        } else if (num.startsWith("1")) {
            return "+" + num;
        } else {
            return "+1" + num;
        }
    }

    render() {
        return (
            <Card className="success">
              <Card.Header>Their Info</Card.Header>
              <Card.Body>

                <div className="recipient-type-and-contacts">
                  <FormControl
                    as="select"
                    value={this.props.type}
                    onChange={this.props.onTypeChange}
                    className="recipient-type-selector">
                    <option value="email">email</option>
                    <option value="sms">sms</option>
                  </FormControl>

                  <Button
                    disabled={!window.navigator || !window.navigator.contacts}
                    onClick={this.contactSelector}
                    className="choose-contact-button text-nowrap">
                    Use Contacts
                  </Button>
                </div>
                <FormGroup>
                  <FormControl
                    type={this.props.type === "email" ? "email" : "tel"}
                    placeholder={this.props.type === "email" ? "nobody@basicshare.io" : "+1234567890"}
                    value={this.props.value}
                    onChange={this.props.onValueChange}
                    ref={(input) => { this.focusInput = input; }}
                    className="type-selector"/>
                  <FormControl.Feedback />
                  {this.isValidated() ||
                   <FormText>
                     {this.props.type === "sms" &&
                      "Please enter a valid phone number (e.g. +1234567890)."
                     }
                     {this.props.type === "email" &&
                      "Please enter a valid email address (e.g. contact@basicshare.io)."
                     }
                   </FormText>}
                </FormGroup>
              </Card.Body>
            </Card>
        );
    }
}

export default ReceiverStep;
