import React, { Component } from 'react';
import { FormText, Modal, Button, FormControl, FormGroup, Card } from 'react-bootstrap';
import $ from "jquery";
import { parsePassword } from './passwordUtil';

class PasswordModal extends Component {
    constructor(props) {
        super(props);

        this.passwordChangeHandler = this.passwordChangeHandler.bind(this);
        this.submitHandler = this.submitHandler.bind(this);

        this.state = {
            password: ""
        };
    }

    passwordChangeHandler(e) {
        this.setState({
            password: e.target.value
        });
    }

    submitHandler(e) {
        if (e) {
            e.preventDefault();
        }
        this.props.submitHandler(parsePassword(this.state.password));
    }

    // For some reason, this element render before the Modal body, perhaps
    // because the Modal implementation uses Portals? As a result,
    // we can't use componentDidMount to grab focus, so instead we
    // use the onEntered callback provide by Modal.
    modalEnteredHandler() {
        $("div[role='dialog'] input[type='password']").focus();
    }

    render() {
        return (
            <Modal
              show={this.props.show}
              onEntered={this.modalEnteredHandler}
              onHide={this.submitHandler}>
              <Card className={this.props.cardType}>
                <Card.Header>Password</Card.Header>

                <form onSubmit={this.submitHandler}>
                  <Card.Body>
                    {this.props.errorCount === 0 ?
                     <p>{this.props.initialMessage}</p> :
                     <p>{this.props.followUpMessage}</p>
                    }

                    <FormGroup>
                      <FormControl
                        type="password"
                        value={this.state.password}
                        placeholder="Enter password here"
                        onChange={this.passwordChangeHandler}/>
                      <FormText>
                        You may enter just the password or the message you received containing the password.
                      </FormText>
                    </FormGroup>

                    <Modal.Footer>
                      <Button variant="primary" onClick={this.submitHandler}>Decrypt</Button>
                    </Modal.Footer>
                  </Card.Body>
                </form>

              </Card>
            </Modal>
        );
    }
}

export default PasswordModal;
