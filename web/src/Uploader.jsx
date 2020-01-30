import React, { Component } from 'react';
import StepZilla from 'react-stepzilla';

import { encrypt } from './Encryption';
import SenderNameStep from './uploader/SenderNameStep';
import ReceiverStep from './uploader/ReceiverStep';
import MessageStep from './uploader/MessageStep';
import SendEncryptedMessageStep from './uploader/SendEncryptedMessageStep';
import SharePasswordStep from './uploader/SharePasswordStep';

class Uploader extends Component {
    constructor(props) {
        super(props);
        this.payloadChangeHandler = this.payloadChangeHandler.bind(this);
        this.senderNameChangeHandler = this.senderNameChangeHandler.bind(this);
        this.receiverTypeChangeHandler = this.receiverTypeChangeHandler.bind(this);
        this.receiverValueChangeHandler = this.receiverValueChangeHandler.bind(this);
        this.sendMessageHandler = this.sendMessageHandler.bind(this);

        this.state = {
            payload: "",
            encrpytedPayload: "",
            password: this.generatePassword(),
            senderName: "",
            receiverType: "email",
            receiverValue: "",
            message: null,
        };
    }

    generatePassword() {
        const vals = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        const arr = new Uint32Array(32);
        window.crypto.getRandomValues(arr);
        return [...arr.map(rv => rv % vals.length)].map(i => vals.charAt(i)).join("")
    }

    payloadChangeHandler(e) {
        this.setState({
            payload: e.target.value,
            encryptedPayload: encrypt(this.state.password, e.target.value)
        });
    }

    senderNameChangeHandler(e) {
        this.setState({
            senderName: e.target.value
        });
    }

    receiverValueChangeHandler(e) {
        this.setState({
            receiverValue: e.target.value
        });
    }

    receiverTypeChangeHandler(e) {
        this.setState({
            receiverType: e.target.value
        });
    }

    sendMessageHandler(message) {
        this.setState({ message });
    }

    render() {
        const senderNameStep = (
            <SenderNameStep
              placeholder="Your Name"
              value={this.state.senderName}
              onChange={this.senderNameChangeHandler}
            />
        );
        const receiverStep = (
            <ReceiverStep
              type={this.state.receiverType}
              value={this.state.receiverValue}
              onTypeChange={this.receiverTypeChangeHandler}
              onValueChange={this.receiverValueChangeHandler}
            />

        );
        const messageStep = (
            <MessageStep
              payload={this.state.payload}
              encryptedPayload={this.state.encryptedPayload}
              password={this.state.password}
              onChange={this.payloadChangeHandler}
            />
        );
        const sendEncryptedMessageStep = (
            <SendEncryptedMessageStep
              message={({
                  senderName: this.state.senderName,
                  receiver: {
                      type: this.state.receiverType,
                      value: this.state.receiverValue
                  },
                  encryptedPayload: this.state.encryptedPayload
              })}
              sendMessageHandler={this.sendMessageHandler}
            />
        );
        const sharePasswordStep = (
            <SharePasswordStep
              receiver={this.state.receiver}
              senderName={this.state.senderName}
              messageId={this.state.message && this.state.message.id}
              password={this.state.password}
            />
        )
        const steps = [
            { name: "1", component: senderNameStep },
            { name: "2", component: receiverStep },
            { name: "3", component: messageStep },
            { name: "4", component: sendEncryptedMessageStep },
            { name: "5", component: sharePasswordStep }
        ];
        return (
            <StepZilla
              steps={steps}
              showSteps={false}
              prevBtnOnLastStep={false}
              nextTextOnFinalActionStep="Send Message"
            />
        );
    }
}

export default Uploader;
