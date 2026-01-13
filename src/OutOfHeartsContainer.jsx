import { useState, useEffect } from "react";
import Timer from "./Timer";
import ruled_paper from "/assets/ruled_paper.png";
import { DitherShader } from "./dither-shader";
import MathProblem from "./MathProblem";
import { EASY_HEARTS, HARD_HEARTS } from "./constants.js";

export default function OutOfHeartsContainer(props) {
  const { setShowOutOfHearts, nextHeartRefreshTime, setHearts, hearts } = props;
  const [showMath, setShowMath] = useState(0); //0, 1, 2
  const [mathProblems, setMathProblems] = useState([]);

  useEffect(() => {
    if (mathProblems.length > 0) {
      var firstUnsolvedProblem = mathProblems.find((p) => !p.isComplete);

      if (firstUnsolvedProblem) {
        document
          .getElementById("math-problem-input" + firstUnsolvedProblem.index)
          .focus();
      }
    }
  }, [mathProblems]);

  function generateMathProblems(isHard) {
    var newProblems = [];
    var maxDigits = isHard ? 100 : 15;
    var numberPool = Array.from({ length: maxDigits }, (_, i) => i + 1);
    var operationPool = isHard ? ["+", "-"] : ["+"];
    var numProblems = isHard ? 6 : 3;
    for (var i = 0; i < numProblems; i++) {
      var rand1 = numberPool[Math.floor(Math.random() * numberPool.length)];
      var rand2 = numberPool[Math.floor(Math.random() * numberPool.length)];
      var operation =
        operationPool[Math.floor(Math.random() * operationPool.length)];
      rand1 = parseInt(rand1);
      rand2 = parseInt(rand2);
      var solution = rand1 + rand2;
      if (operation == "-" && rand2 > rand1) {
        var temp = rand1;
        rand1 = rand2;
        rand2 = temp;
        solution = rand1 - rand2;
      }

      newProblems.push({
        numbers: [rand1, rand2],
        operation: operation,
        solution: solution,
        index: i,
        isComplete: false,
      });
    }
    setMathProblems(newProblems);
  }

  function onProblemComplete(index) {
    var newProblems = [...mathProblems];
    var problem = newProblems.find((p) => p.index == index);
    problem.isComplete = true;
    setMathProblems(newProblems);
    if (newProblems.every((p) => p.isComplete)) {
      setHearts(hearts + (showMath == 2 ? HARD_HEARTS : EASY_HEARTS));
      var container = document.getElementsByClassName("out-of-hearts-outer")[0];
      container.classList.add("flicker-out");
      setTimeout(() => {
        setShowOutOfHearts(false);
      }, 600);
    }
  }

  return (
    <div
      className="out-of-hearts-container"
      onClick={(e) => {
        if (
          !e.target.closest(".out-of-hearts-popup") &&
          !e.target.closest(".math-problems")
        )
          setShowOutOfHearts(false);
      }}
    >
      <div className={"out-of-hearts-outer" + (showMath != 0 ? " flip" : "")}>
        <div className={"out-of-hearts-inner" + (showMath != 0 ? " flip" : "")}>
          <div className={"out-of-hearts-popup"}>
            <div className="out-of-hearts-title">Out of ♥!</div>
            {nextHeartRefreshTime && (
              <div>
                Next ♥ in{" "}
                <Timer
                  endTime={nextHeartRefreshTime}
                  onTimerEnd={() => {
                    setShowOutOfHearts(false);
                  }}
                />
              </div>
            )}
            <button
              className="out-of-hearts-button"
              onClick={() => {
                setShowMath(1);
                generateMathProblems();
              }}
            >
              Do Easy Math Problems <div>(+{EASY_HEARTS} ♥)</div>
            </button>

            <button
              className="out-of-hearts-button"
              onClick={() => {
                setShowMath(2);
                generateMathProblems(true);
              }}
            >
              Do Hard Math Problems <div>(+{HARD_HEARTS} ♥)</div>
            </button>
          </div>

          <div className="math-problems">
            <DitherShader
              src={ruled_paper}
              gridSize={2}
              ditherMode="bayer"
              colorMode="custom"
              className="paper-bg"
              customPalette={["#FF0000", "#7D7D7D", "#ebebebff", "#ffffffff"]}
              objectFit="contain"
              threshold={0.05}
            />
            <div className="problems-container">
              {mathProblems.map((p, i) => {
                return (
                  <MathProblem
                    problem={p}
                    i={i}
                    key={"problem-" + i}
                    onComplete={onProblemComplete}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
