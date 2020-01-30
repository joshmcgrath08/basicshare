import React, { Component } from 'react';
import { Button, Panel } from 'react-bootstrap';
import { formatPasswordUrl } from '../passwordUtil';

class SharePasswordStep extends Component {
    constructor(props) {
        super(props);
        this.mobileWebShareHandler = this.mobileWebShareHandler.bind(this);
        this.shareAnotherHandler = this.shareAnotherHandler.bind(this);
    }

    mobileWebShareHandler() {
        const url = formatPasswordUrl(this.props.senderName, this.props.password, this.props.messageId);
        window.navigator.share({
            title: `Password for ${this.props.senderName}'s BasicShare message (${this.props.messageId})`,
            text: `Click or copy to decrypt ${this.props.senderName}'s BasicShare message: ${url}`
        });
    }

    shareAnotherHandler() {
        window.location.reload();
    }

    render() {
        const url = formatPasswordUrl(this.props.senderName, this.props.password, this.props.messageId);
        return (
            <div>
              <Panel bsStyle="success">
                <Panel.Heading>Share the Password</Panel.Heading>
                <Panel.Body>
                  Click or copy to decrypt {this.props.senderName}'s BasicShare message: <a href={url} target="_blank">{url}</a>
                </Panel.Body>
                <Panel.Footer>
                  {window.navigator.share !== undefined &&
                   <Button onClick={this.mobileWebShareHandler} bsStyle="success">Share Password</Button>
                  }
                  <Button onClick={this.shareAnotherHandler} bsStyle="warning">Share Another Message</Button>
                </Panel.Footer>
              </Panel>
            </div>
        );
    }
}

export default SharePasswordStep;
