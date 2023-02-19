import React from 'react'
import ReactDOM from 'react-dom/client'
import { useEffect } from 'react'
import Interface from './components/interface'
import styles from './styles/main.module.css'

export default function Main() {
  var MQ = window.MQ;
  // Possible text values for background
  const options = ["\\times", "\\div", "\\pi", "\\theta", "\\infty", "\\sum", "\\int", "\\prod", "\\log", "\\lim", "\\sin", "\\cos", "\\tan"];
  // Creating all possible locations for text 
  var range = [...Array(80 + 1).keys()];
  range = range.map((num) => num - 45);
  var locations = [];
  for (let u = 0; u < range.length; u = u + 20) {
    for (let v = 0; v < range.length; v = v + 20) {
      locations.push([range[u] + Math.ceil(Math.random() * 10), range[v] + Math.ceil(Math.random() * 10)]);
    }
  }

  var elements = [];
  for (let i = 0; i < options.length; i++) {
    let random = Math.floor(Math.random() * locations.length);
    let r = locations[random];
    elements.push(
      <p key={i} className={"math"} style={{
        position: 'absolute',
        transform: `translate(${r[0] * Math.max(window.innerWidth / 100, 8) + Math.random() * 2 - 1}px, 
                              ${r[1] * Math.max(window.innerHeight / 100, 8) + Math.random() * 2 - 1}px) 
                    rotate(${Math.random() * 360}deg)`,
        fontSize: `${((window.innerWidth + window.innerHeight) / 40)}px`,
        margin: '0',
        zIndex: '-1',
        color: 'rgb(200, 200, 200)',
      }}>{options[i]}</p>
    )
    locations.splice(random, 1);
  }

  // On mount
  useEffect(() => {
    const objects = document.getElementsByClassName("math");
    for (let i = 0; i < objects.length; i++) {
      MQ.StaticMath(objects[i]);
    }
  });

  return (
    <div className={styles.page}>
      {elements}
      <div className={styles.container}>
        <Interface />
      </div>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Main />);
