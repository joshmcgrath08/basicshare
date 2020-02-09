import React from 'react';
import { FormGroup, FormControl, FormText, Card } from 'react-bootstrap';
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
            <Card className="success">
              <Card.Header>Your Info</Card.Header>
              <Card.Body>
                <FormGroup>
                  <FormControl
                    type="text"
                    placeholder={this.props.placeholder}
                    value={this.props.value}
                    onChange={this.props.onChange}
                    ref={(input) => { this.focusInput = input; }}/>
                  <FormControl.Feedback />
                  {this.isValidated() ||
                   <FormText>
                     Name must be between 1 and 25 characters.
                   </FormText>}
                </FormGroup>
              </Card.Body>
            </Card>
        );
    }
}

export default SenderNameStep;
