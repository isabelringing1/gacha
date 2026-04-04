import { useState, useRef, useEffect } from "react";
import achievementData from "./json/achievements.json";
import { UNLOCK_ACHIEVEMENTS_COST } from "./constants.js";

function getMultiplesOf(n) {
  var result = [];
  for (var i = n; i <= 100; i += n) {
    result.push(String(i));
  }
  return result;
}

export default function Achievements(props) {
  const { numbers, claimedAchievements, claimAchievement, achievementsState, canUnlockAchievements, unlockAchievements, setHighlightedNumbers } = props;
  const [fadingOut, setFadingOut] = useState([]);
  const initialClaimed = useRef(claimedAchievements);

  var uniqueCount = Object.keys(numbers).length;
  var progress = uniqueCount;

  useEffect(() => {
    var progress_div = document.getElementById("achievements-progress-bar-text");
    if (!progress_div) return;
    progress_div.classList.add("pulse");
    setTimeout(() => {
      progress_div.classList.remove("pulse");
    }, 1000);
  }, [numbers]);

  function handleClaim(achievement) {
    claimAchievement(achievement);
    setTimeout(() => {
      setFadingOut((prev) => [...prev, achievement.id]);
    }, 1000);
  }

  function getProgress(a) {
    if (a.type === "multiples") {
      var multiples = getMultiplesOf(a.multiple);
      return multiples.filter((m) => numbers[m] !== undefined).length / multiples.length;
    }
    return uniqueCount / a.threshold;
  }

  var visibleAchievements = achievementData
    .filter((a) => !fadingOut.includes(a.id) && !initialClaimed.current.includes(a.id))
    .sort((a, b) => getProgress(b) - getProgress(a));

  var getCurrencyIcon = (currency) => {
    if (currency == "spades") {
      return "\u2660\ufe0e";
    }
    if (currency == "clubs") {
      return "\u2663\ufe0e";
    }
    if (currency == "hearts") {
      return "\u2665\ufe0e";
    }
    if (currency == "diamonds") {
      return "\u2666\ufe0e";
    }
  }

  return (
    <div className="achievements-container">
      <div className="achievements dither-bg">
        <div className="title">ACHIEVEMENTS</div>
        {achievementsState == "locked" && (
          <div className="achievements-locked">
            <div className="title">UNLOCK</div>
            <button disabled={!canUnlockAchievements()} onClick={unlockAchievements}>
              &#x2660;&#xfe0e; {UNLOCK_ACHIEVEMENTS_COST}
            </button>
          </div>
        )}
        {achievementsState == "unlocked" && (
          <>
            <div className="achievements-progress-bar-container">
              <div
                className="achievements-progress-bar-fill"
                style={{ width: progress + "%" }}
              ></div>
              <div
                className="achievements-progress-bar-text"
                id="achievements-progress-bar-text"
                style={{
                  color: progress > 50 ? "white" : "black",
                  left: progress > 50 ? (90 - progress) + "%" : progress + "%",
                }}
              >
                {progress}%
              </div>
            </div>
            <div className="achievements-entries">
              {visibleAchievements.map((achievement) => {
                var claimed = claimedAchievements.includes(achievement.id);
                var achieved, progressText;
                if (achievement.type === "multiples") {
                  var multiples = getMultiplesOf(achievement.multiple);
                  var collected = multiples.filter((m) => numbers[m] !== undefined).length;
                  var total = multiples.length;
                  achieved = collected === total;
                  progressText = " (" + collected + "/" + total + ")";
                } else {
                  achieved = uniqueCount >= achievement.threshold;
                  progressText = "";
                }
                return (
                  <div
                    className={
                      "achievement-entry" +
                      (claimed ? " achievement-entry-fading" : "") +
                      (achieved && !claimed ? " can-claim" : "")
                    }
                    key={achievement.id}
                    onMouseOver={() => {
                      if (achievement.type === "multiples") {
                        setHighlightedNumbers(getMultiplesOf(achievement.multiple).map(Number));
                      }
                    }}
                    onMouseOut={() => {
                      if (achievement.type === "multiples") {
                        setHighlightedNumbers([]);
                      }
                    }}
                  >
                    <div className="achievement-entry-name">{achievement.name}{progressText}</div>
                    <button
                      className="achievement-entry-button"
                      disabled={!achieved || claimed}
                      onClick={() => handleClaim(achievement)}
                    >
                      {claimed
                        ? "Claimed"
                        : getCurrencyIcon(achievement.currency) + " " + achievement.reward_amount}
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
