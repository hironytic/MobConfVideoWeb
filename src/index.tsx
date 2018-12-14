import firebase from 'firebase/app';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import firebaseConfig from './FirebaseConfig';
import './index.css';
import registerServiceWorker from './registerServiceWorker';
import App from './view/App';

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Cloud Firestore through Firebase
const db = firebase.firestore();
db.settings({
  timestampsInSnapshots: true
});

ReactDOM.render(
  <App />,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
