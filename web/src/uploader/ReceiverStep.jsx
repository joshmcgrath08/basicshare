import React from 'react';
import { FormGroup, FormControl, FormText, Card } from 'react-bootstrap';
import Joi from 'joi-browser';

import ValidatedStep from './ValidatedStep';

class ReceiverStep extends ValidatedStep {
    constructor(props) {
        super(props);
        this.validator = this.validator.bind(this);
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

    render() {
        return (
            <Card className="success">
              <Card.Header>Receiver</Card.Header>
              <Card.Body>

                <FormControl
                  as="select"
                  value={this.props.type}
                  onChange={this.props.onTypeChange}>
                  <option value="email">email</option>
                  <option value="sms">sms</option>
                </FormControl>

                <FormGroup validationState={this.getValidationState()}>
                  <FormControl
                    type={this.props.type === "email" ? "email" : "tel"}
                    placeholder={this.props.type === "email" ? "nobody@basicshare.io" : "+1234567890"}
                    value={this.props.value}
                    onChange={this.props.onValueChange}
                    ref={(input) => { this.focusInput = input; }}/>
                  <FormControl.Feedback />
                  {this.isValidated() ||
                   <FormText>
                     {this.props.type === "sms" &&
                      "Please enter a valid phone number."
                     }
                     {this.props.type === "email" &&
                      "Please enter a valid email address."
                     }
                   </FormText>}
                </FormGroup>
              </Card.Body>
            </Card>
        );
    }
}

export default ReceiverStep;
