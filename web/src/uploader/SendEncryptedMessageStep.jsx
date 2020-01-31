import React, { Component } from 'react';
import { FormGroup, FormLabel, FormControl, Card } from 'react-bootstrap';
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
        const promise = sendMessage(
            senderName, receiver, encryptedPayload, null, this.state.recaptchaVerification,
            this.modalCloseHandler, this.getRecaptchaOverrideCookie());
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

    getRecaptchaOverrideCookie() {
        const cookies = document.cookie.split(";").filter(
            x => x.trim().indexOf("recaptchaOverride=") === 0);
        if (cookies.length > 0) {
            return cookies[0].split("=")[1];
        }
        return null;
    }

    isValidated() {
        const hasCookie = this.getRecaptchaOverrideCookie() !== null;
        if (!this.state.recaptchaVerification && !DEBUG && !hasCookie) {
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
              <Card className="success">
                <Card.Header>Send It</Card.Header>
                <Card.Body>
                  <FormGroup>
                    <FormLabel>From</FormLabel>
                    <FormControl readOnly type="text" value={this.props.message.senderName}/>
                    <FormLabel>To</FormLabel>
                    <FormControl readOnly type="text" value={this.props.message.receiver.value}/>
                    <FormLabel>Encrypted Message</FormLabel>
                    <FormControl readOnly as="textarea" rows="3" className="encrypted-inline-payload" value={this.props.message.encryptedPayload}/>
                  </FormGroup>
                </Card.Body>
              </Card>

              <Card className="info">
                <Card.Header>Are You a Robot?</Card.Header>
                <Card.Body>
                  {!this.state.recaptchaVerification &&
                   <Recaptcha
                     ref={this.recaptchaRefHandler}
                     sitekey="6Ldn_kYUAAAAAPXS_737QHZ_TI-essPffmI_BIqk"
                     onloadCallback={function() {}}
                     verifyCallback={this.recaptchaVerifiedHandler}
                   />
                  }
                </Card.Body>
              </Card>

              {this.state.serviceFailureModal}
            </div>
        );
    }
}

export default SendEncryptedMessageStep;
