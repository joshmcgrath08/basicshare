import React, { Component } from 'react';
import { Button, Card } from 'react-bootstrap';
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
              <Card className="success">
                <Card.Header>Share the Password</Card.Header>
                <Card.Body>
                  Click or copy to decrypt {this.props.senderName}'s BasicShare message: <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
                </Card.Body>
                <Card.Footer>
                  {window.navigator.share !== undefined &&
                   <Button onClick={this.mobileWebShareHandler} variant="success">Share Password</Button>
                  }
                  <Button onClick={this.shareAnotherHandler} variant="warning">Share Another Message</Button>
                </Card.Footer>
              </Card>
            </div>
        );
    }
}

export default SharePasswordStep;
