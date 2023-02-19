import React, { useEffect, useRef, useState } from 'react'
import Generator from '../functions/generator.js'
import styles from '../styles/interface.module.css'

export default function Interface() {
  var MQ = window.MQ;
  const field = useRef();
  const [buttons, setButtons] = useState([<button key={-1}>{"Result"}</button>]);
  const [output, setOutput] = useState(<pre><code>{"Enter an expression!"}</code></pre>);

  // On mount
  useEffect(() => {
    field.current = MQ.MathField(document.getElementById('input'), {
      autoCommands: 'pi theta sum',
      autoOperatorNames: 'sin cos tan log ln',
    })
    MQ.StaticMath(document.getElementById('sum'));
  });

  // Handles calculations
  function handler() {
    let res = Generator(field.current.latex());
    if (res === -1) {
      setButtons(() => [<button key={-1}>{"Result"}</button>]);
      setOutput(() => <pre><code>{"Enter an expression!"}</code></pre>);
    }
    else {
      let buttons = [];
      for (var i = 0; i < res.length; i++) {
        let data = res[i]["data"];
        if (data) {
          buttons.push(
            <button key={i} onClick={() => { setOutput(<pre><code>{data}</code></pre>); }}>{res[i]["name"]}</button>
          )
        }
        // No data indicates a border
        else {
          buttons.push(
            <div key={i} style={{width: "5px", background: "transparent", cursor: "pointer"}}></div>
          )
        }
      }
      setButtons(() => buttons);
      setOutput(() => <pre><code>{res[0]["data"]}</code></pre>);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.input_container}>
        <div className={styles.input} id="input"></div>
        <div className={styles.buttons}>
          <button id="sum" onClick={() => field.current.write('\\sum_{i=0}^{n}\\left(i\\right)')}>{'\\sum_{i=0}^{n}(i)'}</button>
          <button onClick={() => handler()}>{'Go'}</button>
        </div>
      </div>
      <div className={styles.output_container}>
        <div className={styles.buttons}>{buttons}</div>
        <div className={styles.output}>{output}</div>
      </div>
    </div>
  )
}