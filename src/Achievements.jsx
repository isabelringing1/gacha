import { useState, useRef, useEffect } from "react";
import achievementData from "./json/achievements.json";
import { UNLOCK_ACHIEVEMENTS_COST } from "./constants.js";
import { getCurrencyIcon } from "./Util";

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

  // For reach_X: only the first unclaimed one is visible; all beyond it are locked
  var reachAchievements = achievementData
    .filter((a) => a.id.startsWith("reach_"))
    .sort((a, b) => a.threshold - b.threshold);

  // "Closest" = first reach achievement not yet achieved (progress < 100%)
  var closestReachIndex = reachAchievements.findIndex(
    (a) => uniqueCount < a.threshold
  );

  // All reach achievements beyond the closest are locked
  var lockedReachIds = new Set(
    closestReachIndex === -1
      ? []
      : reachAchievements.slice(closestReachIndex + 1).map((a) => a.id)
  );

  var visibleAchievements = achievementData
    .filter((a) => !fadingOut.includes(a.id) && !initialClaimed.current.includes(a.id))
    .sort((a, b) => {
      var aLocked = lockedReachIds.has(a.id);
      var bLocked = lockedReachIds.has(b.id);
      if (aLocked !== bLocked) return aLocked ? 1 : -1;
      return getProgress(b) - getProgress(a);
    });

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
                  left: progress > 50 ? (progress- 18) + "%" : progress + "%",
                }}
              >
                {progress}%
              </div>
            </div>
            <div className="achievements-entries">
              {visibleAchievements.map((achievement) => {
                var isLocked = lockedReachIds.has(achievement.id);
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
                var fillPercent = Math.min(getProgress(achievement), 1) * 100;

                if (isLocked) {
                  return (
                    <div className="achievement-entry achievement-entry-locked" key={achievement.id}>
                      <div className="achievement-entry-name">LOCKED</div>
                    </div>
                  );
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
                    {!achieved && (
                      <div className="achievement-progress-fill" style={{ width: fillPercent + "%" }} />
                    )}
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
