import React from 'react';
import Obfuscate from 'react-obfuscate';

function Contact(props) {
    return (
        <div>
          To contact us, please email <Obfuscate email="contact@basicshare.io"/>
        </div>
    );
}

export default Contact;
