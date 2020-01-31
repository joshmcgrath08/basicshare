import React from 'react';
import $ from "jquery";
import uuid from 'uuid/v4';

import ErrorModal from './ErrorModal';
import { API_URL, API_KEY, DEBUG } from './Constants';

function sendMessage(
    senderName, receiver, payload, description,
    recaptchaVerification, modalCloseHandler, recaptchaOverride) {
    if (DEBUG) {
        return doRequest(
            "send", {
                senderName, receiver, payload, description, recaptchaVerification,
                recaptchaOverride: "dummy"},
            modalCloseHandler);
    } else {
        const req = {senderName, receiver, payload, description, recaptchaVerification};
        if (recaptchaOverride) {
            req.recaptchaOverride = recaptchaOverride;
        }
        return doRequest("send", req, modalCloseHandler);
    }
}

function receiveMessage(id, nonce, modalCloseHandler) {
    return doRequest("receive", {id, nonce}, modalCloseHandler);
}

function doRequest(operation, data, modalCloseHandler) {
    return $.ajax({
        url: API_URL + "/messages/" + operation,
        crossDomain: true,
        type: "POST",
        dataType: "json",
        contentType: "application/json",
        headers: {
            "X-Api-Key": API_KEY
        },
        data: JSON.stringify(data)
    }).then(function(x) { return x; }, makeFailHandler(operation, modalCloseHandler));
}

function makeFailHandler(operation, modalCloseHandler) {
    return function (jqXHR, textStatus, errorThrown) {
        let msg;
        if (jqXHR.responseJSON) {
            msg = jqXHR.responseJSON.message;
        } else {
            msg = "This is usually due to an authentication issue.";
        }
        msg = `Failed to ${operation} message. ${msg}`;
        return $.Deferred().reject(<ErrorModal message={msg} key={uuid()} modalCloseHandler={modalCloseHandler}/>);
    }
}

export { sendMessage, receiveMessage };
