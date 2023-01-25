import React from 'react';
import ReactDOM from 'react-dom/client';

export default function Main() {
  return (
    <div>Hello!</div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
)
