import React, { Component } from 'react';
import { Panel } from 'react-bootstrap';
import QueryString from 'query-string';
import Obfuscate from 'react-obfuscate';

import Viewer from './Viewer';
import Uploader from './Uploader';
import ErrorModal from './ErrorModal';
import InfoModal from './InfoModal';
import Contact from './Contact';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';

import './App.css';


class App extends Component {
    render() {
        const query = QueryString.parse(window.location.search);
        const mode = query.mode || "upload";
        const path = window.location.pathname.replace(/\/$/, '');
        let component;
        if (path === "/contact") {
            component = <Contact/>;
        }
        else if (path === "" && mode === "view") {
            component = <Viewer id={query.id} nonce={query.nonce} />;
        } else if (path === "" && mode === "password") {
            const store = window.localStorage;
            const password = window.location.hash.substring(1);
            store.setItem("password:" + query.id, password);
            if (store.getItem("message:" + query.id) !== null) {
                component = <Viewer id={query.id} nonce={null}/>;
            } else {
                component = <InfoModal
                              message={"Password has been stored"}
                              closeAfterMillis={2000}/>;
            }
        } else if (path === "" && mode === "upload") {
            component = <Uploader/>;
        } else if (path === "") {
            component = <ErrorModal message={`Invalid mode: ${mode}`} />;
        } else {
            component = <ErrorModal message={`Invalid path: ${path}`} />;
        }

        return (
            <div>
              <p className="custom-page-header">
                <h1>BasicShare</h1>
                <span>
                  <a href="https://termsfeed.com/privacy-policy/a2e9a6463963572610d4b59f4b833e37">Privacy Policy</a>
                  &nbsp;/&nbsp;
                  <a href="https://termsfeed.com/terms-conditions/849b9587d74e05e7109ea68b70c25d56">Terms and Conditions</a>
                  &nbsp;/&nbsp;
                  <Obfuscate email="contact@basicshare.io">Contact Us</Obfuscate>
                </span>
              </p>
              <Panel>
                <Panel.Body>
                  {component}
                </Panel.Body>
              </Panel>
            </div>
        );
    }
}

export default App;
