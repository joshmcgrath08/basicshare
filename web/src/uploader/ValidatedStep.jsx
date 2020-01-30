import { Component } from 'react';

class ValidatedStep extends Component {
    constructor(props) {
        super(props);
        this.isValidated = this.isValidated.bind(this);
        this.getValidationState = this.getValidationState.bind(this);

        this.state = {
            validationState: "warning"
        };
    }

    isValidated() {
        return this.getValidationState(this.props.value) === "success";
    }

    getValidationState() {
        const {error, value} = this.validator();
        if (value && error) {
            return "error";
        } else if (value) {
            return "success";
        } else {
            return "warning"
        }
    }
}

export default ValidatedStep;
