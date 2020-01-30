import React, { Component } from 'react';
import { FormGroup, ControlLabel, FormControl, Panel } from 'react-bootstrap';
import $ from "jquery";
import Recaptcha from 'react-recaptcha';

import { DEBUG } from '../Constants';
import { sendMessage } from '../Client';

class SendEncryptedMessageStep extends Component {
    constructor(props) {
        super(props);
        this.sendMessageHandler = this.sendMessageHandler.bind(this);
        this.recaptchaVerifiedHandler = this.recaptchaVerifiedHandler.bind(this);
        this.modalCloseHandler = this.modalCloseHandler.bind(this);
        this.recaptchaRefHandler = this.recaptchaRefHandler.bind(this);
        this.state = {
            promise: null,
            promiseState: null,
            serviceFailureModal: null,
            modalOpen: false,
            recaptchaVerification: ""
        }
    }

    recaptchaVerifiedHandler(rv) {
        this.setState({
            recaptchaVerification: rv
        });
    }

    sendMessageHandler() {
        const senderName = this.props.message.senderName;
        const receiver = this.props.message.receiver;
        const encryptedPayload = this.props.message.encryptedPayload;
        const promise = sendMessage(senderName, receiver, encryptedPayload, null, this.state.recaptchaVerification, this.modalCloseHandler);
        const component = this;

        this.setState({
            promiseState: "pending",
            promise: promise
                .then(function(response) {
                    component.setState({
                        promiseState: "successful"
                    });
                    component.props.sendMessageHandler(response);
                    return $.Deferred().resolve(true);
                }, function(modal) {
                    component.recaptcha.reset();
                    component.setState({
                        promiseState: "failed",
                        serviceFailureModal: modal,
                        modalOpen: true,
                        recaptchaVerification: ""
                    });
                    return $.Deferred().resolve(false);
                })
        });
        return promise;
    }

    modalCloseHandler() {
        this.setState({
            modalOpen: false
        });
    }

    isValidated() {
        if (!this.state.recaptchaVerification && !DEBUG) {
            return false;
        }

        if (this.state.promiseState !== "successful" &&
            this.state.promiseState !== "pending" &&
            !this.state.modalOpen) {
            return this.sendMessageHandler();
        }
        return this.state.promise;
    }

    recaptchaRefHandler(recaptcha) {
        // Multiple callbacks occur and sometimes the value is null.
        // Initially I thought https://reactjs.org/docs/refs-and-the-dom.html#caveats
        // was the issue but I'm starting to think it may be a bug in react-recaptcha
        if (!this.recaptcha) {
            this.recaptcha = recaptcha;
        }
    }

    render() {
        return (
            <div>
              <Panel bsStyle="success">
                <Panel.Heading>Review and Send</Panel.Heading>
                <Panel.Body>
                  <FormGroup>
                    <ControlLabel>From</ControlLabel>
                    <FormControl readOnly type="text" value={this.props.message.senderName}/>
                    <ControlLabel>To</ControlLabel>
                    <FormControl readOnly type="text" value={this.props.message.receiver.value}/>
                    <ControlLabel>Encrypted Message</ControlLabel>
                    <FormControl readOnly componentClass="textarea" rows="3" className="encrypted-inline-payload" value={this.props.message.encryptedPayload}/>
                  </FormGroup>
                </Panel.Body>
              </Panel>

              <Panel bsStyle="info">
                <Panel.Heading>Are You a Robot?</Panel.Heading>
                <Panel.Body>
                  {!this.state.recaptchaVerification &&
                   <Recaptcha
                     ref={this.recaptchaRefHandler}
                     sitekey="6Ldn_kYUAAAAAPXS_737QHZ_TI-essPffmI_BIqk"
                     onloadCallback={function() {}}
                     verifyCallback={this.recaptchaVerifiedHandler}
                   />
                  }
                </Panel.Body>
              </Panel>

              {this.state.serviceFailureModal}
            </div>
        );
    }
}

export default SendEncryptedMessageStep;
