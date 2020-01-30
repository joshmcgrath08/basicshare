import React from 'react';
import Modal from './Modal';

function ErrorModal(props) {
    return <Modal {...props} cardType="danger" heading="Oops!"/>
}

export default ErrorModal;
