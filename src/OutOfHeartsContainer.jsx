import { useState, useEffect } from "react";
import Timer from "./Timer";
import ruled_paper from "/ruled_paper.png";
import { DitherShader } from "./dither-shader";
import MathProblem from "./MathProblem";
import circle from "/circle.png";
import { EASY_DIAMONDS, HARD_DIAMONDS } from "./constants.js";

export default function OutOfHeartsContainer(props) {
  const { setShowOutOfDiamonds, nextDiamondRefreshTime, setDiamonds, diamonds } = props;
  const [showMath, setShowMath] = useState(0); //0, 1, 2
  const [mathProblems, setMathProblems] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [resetTick, setResetTick] = useState(0);

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

  function getNextDifficulty() {
    const now = Date.now();
    const hourStart = parseInt(localStorage.getItem("gacha_math_hour_start") || "0");
    let completions = parseInt(localStorage.getItem("gacha_math_completions") || "0");
    if (now - hourStart > 3600000) {
      localStorage.setItem("gacha_math_hour_start", now.toString());
      localStorage.setItem("gacha_math_completions", "0");
      completions = 0;
    }
    const nextCount = completions + 1;
    const numProblems = nextCount <= 1 ? 3 : 6;
    const maxDigits = nextCount <= 2 ? 15 : 15 + (nextCount - 2) * 15;
    return { numProblems, maxDigits };
  }

  function generateMathProblems() {
    var newProblems = [];
    var { numProblems, maxDigits } = getNextDifficulty();
    var numberPool = Array.from({ length: maxDigits }, (_, i) => i + 1);
    var operationPool = ["+"];
    for (var i = 0; i < numProblems; i++) {
      var rand1 = numberPool[Math.floor(Math.random() * numberPool.length)];
      var rand2 = numberPool[Math.floor(Math.random() * numberPool.length)];
      var operation =
        operationPool[Math.floor(Math.random() * operationPool.length)];
      rand1 = parseInt(rand1);
      rand2 = parseInt(rand2);
      var solution = rand1 + rand2;
      if (operation == "-") {
        if (rand2 > rand1) {
          var temp = rand1;
          rand1 = rand2;
          rand2 = temp;
        }
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
      setDiamonds(diamonds + (showMath == 2 ? HARD_DIAMONDS : EASY_DIAMONDS));
      const prev = parseInt(localStorage.getItem("gacha_math_completions") || "0");
      localStorage.setItem("gacha_math_completions", (prev + 1).toString());
      setShowSuccess(true);
      setTimeout(() => {
        var container = document.getElementsByClassName("out-of-hearts-outer")[0];
        container.classList.add("flicker-out");
        setTimeout(() => {
          setShowOutOfDiamonds(false);
          setShowSuccess(false);
        }, 100);
      }, 400);
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
          setShowOutOfDiamonds(false);
      }}
    >
      <div className={"out-of-hearts-outer" + (showMath != 0 ? " flip" : "")}>
        <div className={"out-of-hearts-inner" + (showMath != 0 ? " flip" : "")}>
          <div className={"out-of-hearts-popup dither-bg"}>
            <div className="out-of-hearts-title title">
              OUT OF &diams;&#xfe0e;!
            </div>
            <div className="out-of-hearts-popup-inner">
              {nextDiamondRefreshTime && (
                <div>
                  Next &diams;&#xfe0e; in{" "}
                  <Timer
                    endTime={nextDiamondRefreshTime}
                    onTimerEnd={() => {}}
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
                Do Math Problems{" "}
                <div>(+{EASY_DIAMONDS} &diams;&#xfe0e;)</div>
              </button>
              {(() => {
                var hourStart = parseInt(localStorage.getItem("gacha_math_hour_start") || "0");
                var completions = parseInt(localStorage.getItem("gacha_math_completions") || "0");
                var resetTime = hourStart + 3600000;
                if (completions <= 0 || resetTime <= Date.now()) return null;
                return (
                  <div className="math-problems-reset-timer-container">
                    Difficulty resets in{" "}
                    <Timer endTime={resetTime} onTimerEnd={() => setResetTick((t) => t + 1)} />
                  </div>
                );
              })()}
             
            </div>
          </div>

          <div className="math-problems">
            {showSuccess && (
              <div className="math-success-overlay">
                <DitherShader
                  src={circle}
                  gridSize={2}
                  ditherMode="bayer"
                  colorMode="default"
                  className="math-success-o"
                  objectFit="contain"
                />
              </div>
            )}
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
