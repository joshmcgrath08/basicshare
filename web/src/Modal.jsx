import React, { Component } from 'react';
import { Modal as BootstrapModal, Button, Card } from 'react-bootstrap';
import $ from "jquery";

class Modal extends Component {
    constructor(props) {
        super(props);

        this.closeHandler = this.closeHandler.bind(this);

        if (this.props.closeAfterMillis !== undefined) {
            setTimeout(this.closeHandler, this.props.closeAfterMillis);
        }

        this.state = {
            show: true
        };
    }

    closeHandler(e) {
        if (this.props.modalCloseHandler) {
            this.props.modalCloseHandler(this);
        }
        this.setState({
            show: false
        });
    }

    // For some reason, this element render before the Modal body, perhaps
    // because the Modal implementation uses Portals? As a result,
    // we can't use componentDidMount to grab focus, so instead we
    // use the onEntered callback provide by Modal.
    modalEnteredHandler() {
        $("div[role='dialog'] button").focus();
    }

    render() {
        return (
            <BootstrapModal
              show={this.state.show}
              onEntered={this.modalEnteredHandler}
            >
              <Card className={this.props.cardType}>

                <Card.Header>{this.props.heading}</Card.Header>

                <Card.Body>
                  <p>{this.props.message}</p>
                  <BootstrapModal.Footer>
                    <Button variant="primary" onClick={this.closeHandler}>Ok</Button>
                  </BootstrapModal.Footer>
                </Card.Body>

              </Card>
            </BootstrapModal>
        );
    }
}

export default Modal;
