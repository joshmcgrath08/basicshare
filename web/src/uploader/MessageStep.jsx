import React from 'react';
import { FormGroup, FormControl, HelpBlock, Panel } from 'react-bootstrap';
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

              <Panel bsStyle="danger">
                <Panel.Heading>Message to Encrypt</Panel.Heading>
                <Panel.Body>
                  <FormGroup validationState={this.getValidationState()}>
                    <FormControl
                      type="text"
                      value={this.props.payload}
                      placeholder="Enter your message here"
                      onChange={this.props.onChange}
                      inputRef={(input) => { this.focusInput = input; }}/>
                    <FormControl.Feedback/>
                    {this.isValidated() ||
                     <HelpBlock>
                       Message must consist of between 1 and 250 characters.
                     </HelpBlock>}
                  </FormGroup>
                </Panel.Body>
              </Panel>


              <Panel bsStyle="warning">
                <Panel.Heading>Password for Encrypting</Panel.Heading>
                <Panel.Body>
                  {this.props.password}
                </Panel.Body>
              </Panel>

              <Panel bsStyle="success">
                <Panel.Heading>Encrypted Message</Panel.Heading>
                <Panel.Body className="encrypted-payload">
                  {JSON.stringify(
                      this.props.encryptedPayload
                          && JSON.parse(this.props.encryptedPayload),
                      null, 2)}
                </Panel.Body>
              </Panel>

            </div>
        );
    }
}

export default MessageStep;
