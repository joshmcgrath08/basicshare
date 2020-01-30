import React from 'react';
import Modal from './Modal';

function ErrorModal(props) {
    return <Modal {...props} bsStyle="danger" heading="Oops!"/>
}

export default ErrorModal;
