import sjcl from 'sjcl';

function encrypt(password, payload) {
    return sjcl.encrypt(password, payload);
}

function decrypt(password, payload) {
    return sjcl.decrypt(password, payload)
}

export { encrypt, decrypt };
