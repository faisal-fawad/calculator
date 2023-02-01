import React from 'react'
import ReactDOM from 'react-dom/client'
import Interface from './components/interface'
import styles from './styles/main.module.css'

export default function Main() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Interface />
      </div>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Main />);
