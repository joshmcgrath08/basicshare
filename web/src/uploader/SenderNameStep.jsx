import React from 'react';
import { FormGroup, FormControl, HelpBlock, Panel } from 'react-bootstrap';
import Joi from 'joi-browser';

import ValidatedStep from './ValidatedStep';

class SenderNameStep extends ValidatedStep {
    constructor(props) {
        super(props);
        this.validator = this.validator.bind(this);
    }

    validator() {
        return Joi.validate(this.props.value, Joi.string().min(1).max(25));
    }

    componentDidMount() {
        this.focusInput.focus();
    }

    render() {
        return (
            <Panel bsStyle="success">
              <Panel.Heading>Your Name</Panel.Heading>
              <Panel.Body>
                <FormGroup validationState={this.getValidationState()}>
                  <FormControl
                    type="text"
                    placeholder={this.props.placeholder}
                    value={this.props.value}
                    onChange={this.props.onChange}
                    inputRef={(input) => { this.focusInput = input; }}/>
                  <FormControl.Feedback />
                  {this.isValidated() ||
                   <HelpBlock>
                     Name must be between 1 and 25 characters.
                   </HelpBlock>}
                </FormGroup>
              </Panel.Body>
            </Panel>
        );
    }
}

export default SenderNameStep;
