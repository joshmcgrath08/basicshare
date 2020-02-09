import React from 'react';
import { FormGroup, FormControl, FormText, Card } from 'react-bootstrap';
import Joi from 'joi-browser';

import ValidatedStep from './ValidatedStep';

class MessageStep extends ValidatedStep {
    constructor(props) {
        super(props);
        this.validator = this.validator.bind(this);
    }

    validator() {
        return Joi.validate(this.props.payload, Joi.string().min(1).max(250));
    }

    componentDidMount() {
        this.focusInput.focus();
    }

    render() {
        return (
            <div>

              <Card className="danger">
                <Card.Header>Message to Encrypt</Card.Header>
                <Card.Body>
                  <FormGroup>
                    <FormControl
                      type="text"
                      value={this.props.payload}
                      placeholder="Enter your message here"
                      onChange={this.props.onChange}
                      ref={(input) => { this.focusInput = input; }}/>
                    <FormControl.Feedback/>
                    {this.isValidated() ||
                     <FormText>
                       Message must consist of between 1 and 250 characters.
                     </FormText>}
                  </FormGroup>
                </Card.Body>
              </Card>


              <Card className="warning">
                <Card.Header>Password for Encrypting</Card.Header>
                <Card.Body>
                  {this.props.password}
                </Card.Body>
              </Card>

              <Card className="success">
                <Card.Header>Encrypted Message</Card.Header>
                <Card.Body className="encrypted-payload">
                  {JSON.stringify(
                      this.props.encryptedPayload
                          && JSON.parse(this.props.encryptedPayload),
                      null, 2)}
                </Card.Body>
              </Card>

            </div>
        );
    }
}

export default MessageStep;
