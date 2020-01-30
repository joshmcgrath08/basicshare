import React, { Component } from 'react';
import { Modal as BootstrapModal, Button, Panel } from 'react-bootstrap';
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
              <Panel bsStyle={this.props.bsStyle}>

                <Panel.Heading>{this.props.heading}</Panel.Heading>

                <Panel.Body>
                  <p>{this.props.message}</p>
                  <BootstrapModal.Footer>
                    <Button bsStyle="primary" onClick={this.closeHandler}>Ok</Button>
                  </BootstrapModal.Footer>
                </Panel.Body>

              </Panel>
            </BootstrapModal>
        );
    }
}

export default Modal;
