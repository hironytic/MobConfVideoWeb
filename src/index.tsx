import firebase from 'firebase/app';
import "firebase/firestore";
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import { setupBackNavigation } from './common/BackNavigation';
import './index.css';
import { unregister as unregisterServiceWorker } from './registerServiceWorker';

async function getFirebaseConfig(): Promise<object> {
  if (process.env.NODE_ENV !== 'production') {
    const config = JSON.parse(process.env.REACT_APP_FIREBASE_CONFIG!)
    return config;
  } else {
    return (await fetch('/__/firebase/init.json')).json();
  }
}

async function initialize() {
  // Initialize Firebase
  firebase.initializeApp(await getFirebaseConfig());

  // Initialize Cloud Firestore through Firebase
  const db = firebase.firestore();
  db.settings({
    timestampsInSnapshots: true
  });

  setupBackNavigation();

  ReactDOM.render(
    <App />,
    document.getElementById('root') as HTMLElement
  );
  unregisterServiceWorker();
}
initialize();
