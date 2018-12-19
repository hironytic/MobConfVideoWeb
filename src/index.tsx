import firebase from 'firebase/app';
import "firebase/firestore";
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import firebaseConfig from './FirebaseConfig';
import './index.css';
import { unregister as unregisterServiceWorker } from './registerServiceWorker';

async function initialize() {
  // Initialize Firebase
  firebase.initializeApp(await firebaseConfig());

  // Initialize Cloud Firestore through Firebase
  const db = firebase.firestore();
  db.settings({
    timestampsInSnapshots: true
  });

  ReactDOM.render(
    <App />,
    document.getElementById('root') as HTMLElement
  );
  unregisterServiceWorker();
}
initialize();
