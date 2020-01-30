import React from 'react';
import Modal from './Modal';

function InfoModal(props) {
    return <Modal {...props} cardType="success" heading="Success!"/>
}

export default InfoModal;
