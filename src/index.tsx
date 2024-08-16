import React from 'react';
import ReactDOM from 'react-dom/client';
import './app.scss';
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import App from './app';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <>
    <App/>
  </>
);
