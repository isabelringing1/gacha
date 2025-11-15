import { useState } from "react";
import "./App.css";

import Number from "./Number";
import CardPack from "./CardPack";

function App() {
  const [playerData, setPlayerData] = useState({});
  const [numbers, setNumbers] = useState({});

  const rollNumbers = (amount = 5) => {
    var rolls = [];
    var newNumbers = { ...numbers };
    for (var i = 0; i < amount; i++) {
      var roll = Math.ceil(Math.random() * 100);
      newNumbers[roll] = newNumbers[roll] ? newNumbers[roll] + 1 : 1;
      rolls.push(roll);
    }
    setNumbers(newNumbers);
    console.log(rolls);
    return rolls;
  };

  const openPack = () => {
    var container = document.getElementById("card-pack-container");
    container.classList.add("bounce-in");

    setTimeout(() => {
      container.classList.remove("bounce-in");
      container.style.transform = "translateY(0px)";
    }, 750);
  };

  return (
    <div id="content">
      <CardPack rollNumbers={rollNumbers} />
      <div id="numbers-grid-container">
        <div id="numbers-grid">
          {Array.from({ length: 100 }, (_, i) => i + 1).map((n) => {
            return <Number key={"number-" + n} n={n} data={numbers[n]} />;
          })}
        </div>
      </div>
      <div id="buttons-container">
        <button onClick={openPack}>Open Pack</button>
        <div>1/2 remaining</div>
      </div>
    </div>
  );
}

export default App;
