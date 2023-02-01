import React, { useEffect, useRef, useState } from 'react'
import Generator from '../functions/generator.js'
import styles from '../styles/interface.module.css'

export default function Interface() {
  var MQ = window.MQ;
  const field = useRef();
  const [output, setOutput] = useState("Click calculate!");

  // On mount
  useEffect(() => {
    field.current = MQ.MathField(document.getElementById('input'));
  });

  // Handles calculations
  function handler() {
    var res;
    res = Generator(field.current.latex())
    setOutput(() => res);
  }

  return (
    <div className={styles.container}>
      <div className={styles.input} id="input"></div>
      <div className={styles.buttons}>
        <button id="sum" className={styles.sum_button} onClick={() => field.current.write('\\sum_{i=0}^{n}\\left(i\\right)')}>Σ</button>
        <div></div>
        <button className={styles.calc_button} onClick={() => handler()}>Calculate</button>
      </div>
      <div className={styles.output}>{output}</div>
    </div>
  )
}