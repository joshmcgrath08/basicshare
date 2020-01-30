import React, { Component } from 'react';
import { Button, Panel } from 'react-bootstrap';
import QueryString from 'query-string';

import { receiveMessage } from './Client';
import { decrypt } from './Encryption';
import PasswordModal from './PasswordModal';

class Viewer extends Component {
    constructor(props) {
        super(props);

        this.decryptHandler = this.decryptHandler.bind(this);
        this.shareHandler = this.shareHandler.bind(this);

        const store = window.localStorage;
        const storePassword = store.getItem("password:" + this.props.id);
        let storeMessage = store.getItem("message:" + this.props.id)
        if (storeMessage !== null) {
            storeMessage = JSON.parse(storeMessage);
        }

        this.state = {
            password: storePassword || "",
            message: storeMessage || null,
            passwordModalOpen: false,
            decryptSuccessful: (
                storePassword
                    && storeMessage
                    && this.canDecrypt(storePassword, storeMessage))
                || false,
            decryptFailureCount: 0,
            serviceFailureModal: null
        };
    }

    decryptHandler(password) {
        if (!this.canDecrypt(password, this.state.message)) {
            this.setState((prevState) => ({
                decryptFailureCount: prevState.decryptFailureCount + 1
            }));
        } else {
            const store = window.localStorage;
            store.setItem("password:" + this.props.id, password);
            this.setState({
                password: password,
                decryptFailureCount: 0,
                decryptSuccessful: true,
                passwordModalOpen: false
            });
        }
    }

    canDecrypt(password, message) {
        try {
            decrypt(password, message.payload);
            return true;
        } catch(e) {}
        return false;
    }

    shareHandler() {
        window.location.search = QueryString.stringify({});
    }

    componentDidMount() {
        const component = this;
        if (!component.state.message) {
            receiveMessage(this.props.id, this.props.nonce)
                .then(function(data) {
                    const store = window.localStorage;
                    store.setItem("message:" + component.props.id, JSON.stringify(data));
                    component.setState({
                        message: data,
                        passwordModalOpen: component.state.password === "",
                        decryptSuccessful: component.state.password && component.canDecrypt(component.state.password, data)
                    });
                }, function(modal) {
                    component.setState({
                        serviceFailureModal: modal
                    });
                });
        }
    }

    render() {
        let message = "";
        if (this.state.message) {
            message = JSON.stringify(this.state.message, null, 2);
        }

        let decryptedPayload = "";
        if (this.state.message && this.state.decryptSuccessful) {
            decryptedPayload = decrypt(this.state.password, this.state.message.payload);
        }

        const senderName = (this.state.message && this.state.message.senderName) || "";
        const decryptFailureCount = this.state.decryptFailureCount;

        return (
            <div>

              <Panel bsStyle="success">
                <Panel.Heading>Encrypted Message</Panel.Heading>
                <Panel.Body className="encrypted-message">{message}</Panel.Body>
              </Panel>

              <Panel bsStyle="danger">
                <Panel.Heading>Decrypted Message</Panel.Heading>
                <Panel.Body>{decryptedPayload}</Panel.Body>
              </Panel>

              <Panel bsStyle="info">
                <Panel.Heading>Share Your Own Message</Panel.Heading>
                <Panel.Body>
                  <Button onClick={this.shareHandler} bsStyle="warning">Share A Message</Button>
                </Panel.Body>
              </Panel>

              <PasswordModal
                show={this.state.passwordModalOpen}
                submitHandler={this.decryptHandler}
                errorCount={this.state.decryptFailureCount}
                panelStyle="danger"
                initialMessage={`Enter the password to decrypt your message. If you have not received the password, please contact ${senderName}`}
                followUpMessage={`Incorrect password (${decryptFailureCount}). Please try again`} />

              {this.state.serviceFailureModal}

            </div>
        );
    }
}

export default Viewer;
