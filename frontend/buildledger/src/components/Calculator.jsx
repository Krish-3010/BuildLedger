import { useState } from "react";
import Header from "../utils/Header.jsx";
import { safeEvaluate } from "../utils/calculator.js";
import "./Calculator.css";

function Calculator() {
  const [display, setDisplay] = useState("");

  const handleClick = (value) => {
    if (display === "Error") {
      setDisplay(value);
    } else {
      setDisplay(display + value);
    }
  };

  const calculate = () => {
    try {
      const result = safeEvaluate(display);
      if (result === "") {
        setDisplay("");
      } else {
        setDisplay(result);
      }
    } catch {
      setDisplay("Error");
    }
  };

  const clear = () => {
    setDisplay("");
  };

  const backspace = () => {
    if (display === "Error") {
      setDisplay("");
    } else {
      setDisplay(display.slice(0, -1));
    }
  };

  return (
    <>
      <Header />
      <div className="calculator-page">
        <div className="calculator-container glass-card">
          <div className="calculator-header">
            <p className="calculator-subtitle">PROJECT ESTIMATION</p>
            <h2>Calculator</h2>
          </div>

          <div className="calculator-display-container">
            <input
              type="text"
              className="calculator-display"
              value={display || "0"}
              readOnly
            />
          </div>

          <div className="calculator-grid">
            {/* Row 1 */}
            <button className="calc-btn clear-btn" onClick={clear}>C</button>
            <button className="calc-btn backspace-btn" onClick={backspace}>⌫</button>
            <button className="calc-btn operator-btn" onClick={() => handleClick("/")}>/</button>
            <button className="calc-btn operator-btn" onClick={() => handleClick("*")}>*</button>

            {/* Row 2 */}
            <button className="calc-btn num-btn" onClick={() => handleClick("7")}>7</button>
            <button className="calc-btn num-btn" onClick={() => handleClick("8")}>8</button>
            <button className="calc-btn num-btn" onClick={() => handleClick("9")}>9</button>
            <button className="calc-btn operator-btn" onClick={() => handleClick("-")}>-</button>

            {/* Row 3 */}
            <button className="calc-btn num-btn" onClick={() => handleClick("4")}>4</button>
            <button className="calc-btn num-btn" onClick={() => handleClick("5")}>5</button>
            <button className="calc-btn num-btn" onClick={() => handleClick("6")}>6</button>
            <button className="calc-btn operator-btn" onClick={() => handleClick("+")}>+</button>

            {/* Row 4 */}
            <button className="calc-btn num-btn" onClick={() => handleClick("1")}>1</button>
            <button className="calc-btn num-btn" onClick={() => handleClick("2")}>2</button>
            <button className="calc-btn num-btn" onClick={() => handleClick("3")}>3</button>
            <button className="calc-btn equals-btn row-span" onClick={calculate}>=</button>

            {/* Row 5 */}
            <button className="calc-btn num-btn zero-btn" onClick={() => handleClick("0")}>0</button>
            <button className="calc-btn num-btn" onClick={() => handleClick(".")}>.</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Calculator;