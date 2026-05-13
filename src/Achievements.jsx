import { useState, useRef, useEffect, useMemo } from "react";
import achievementData from "./json/achievements.json";
import { UNLOCK_ACHIEVEMENTS_COST } from "./constants.js";
import { getCurrencyIcon, getLevel } from "./Util";

const REACH_ACHIEVEMENTS = achievementData
  .filter((a) => a.id.startsWith("reach_"))
  .sort((a, b) => a.threshold - b.threshold);

export function hasClaimableAchievement(numbers, numPacksOpened, claimedAchievements) {
  var uniqueCount = Object.keys(numbers).length;
  var completeRows = countCompleteRows(numbers);
  var completeCols = countCompleteCols(numbers);
  var packsOpened = numPacksOpened || 0;

  function countAtLevel(targetLevel) {
    var count = 0;
    for (var i = 1; i <= 100; i++) {
      var rolls = numbers[i];
      if (rolls !== undefined && getLevel(rolls) >= targetLevel) count++;
    }
    return count;
  }

  function getCurrent(a) {
    if (a.type === "row") return completeRows;
    if (a.type === "column") return completeCols;
    if (a.type === "packs") return packsOpened;
    if (a.type === "level") return countAtLevel(a.target_level);
    return uniqueCount;
  }

  function getTarget(a) {
    if (a.type === "row" || a.type === "column" || a.type === "packs" || a.type === "level") return a.count;
    return a.threshold;
  }

  var closestReachIndex = REACH_ACHIEVEMENTS.findIndex((a) => uniqueCount < a.threshold);
  var lockedReachIds = new Set(
    closestReachIndex === -1
      ? []
      : REACH_ACHIEVEMENTS.slice(closestReachIndex + 1).map((a) => a.id)
  );

  for (var i = 0; i < achievementData.length; i++) {
    var a = achievementData[i];
    if (claimedAchievements.includes(a.id)) continue;
    if (lockedReachIds.has(a.id)) continue;
    if (a.requires && !claimedAchievements.includes(a.requires)) continue;
    if (getCurrent(a) >= getTarget(a)) return true;
  }
  return false;
}

function getRowNumbers(rowIndex) {
  var result = [];
  for (var i = 1; i <= 10; i++) {
    result.push(String((rowIndex - 1) * 10 + i));
  }
  return result;
}

function getColNumbers(colIndex) {
  var result = [];
  for (var i = 0; i < 10; i++) {
    result.push(String(colIndex + i * 10));
  }
  return result;
}

function countCompleteRows(numbers) {
  var count = 0;
  for (var r = 1; r <= 10; r++) {
    if (getRowNumbers(r).every((m) => numbers[m] !== undefined)) count++;
  }
  return count;
}

function countCompleteCols(numbers) {
  var count = 0;
  for (var c = 1; c <= 10; c++) {
    if (getColNumbers(c).every((m) => numbers[m] !== undefined)) count++;
  }
  return count;
}

export default function Achievements(props) {
  const { numbers, numPacksOpened, claimedAchievements, claimAchievement, achievementsState, canUnlockAchievements, unlockAchievements, setHighlightedNumbers } = props;
  const [fadingOut, setFadingOut] = useState([]);
  const initialClaimed = useRef(claimedAchievements);

  var uniqueCount = Object.keys(numbers).length;
  var progress = uniqueCount;
  var completeRows = countCompleteRows(numbers);
  var completeCols = countCompleteCols(numbers);
  var packsOpened = numPacksOpened || 0;
  var numbersCount = useRef(numbers.length);

  useEffect(() => {
    var progress_div = document.getElementById("achievements-progress-bar-text");
    if (!progress_div) return;
    if (numbers.length > numbersCount.current) {  
      progress_div.classList.add("pulse");
      numbersCount.current = numbers.length;
    }
    setTimeout(() => {
      progress_div.classList.remove("pulse");
    }, 1000);
  }, [numbers]);

  function handleClaim(achievement) {
    try {
      var a = new Audio("./get.wav");
      a.play().catch(() => {});
    } catch (e) {}
    claimAchievement(achievement);
    setTimeout(() => {
      setFadingOut((prev) => [...prev, achievement.id]);
    }, 1000);
  }

  function countNumbersAtLevel(targetLevel) {
    var count = 0;
    for (var i = 1; i <= 100; i++) {
      var rolls = numbers[i];
      if (rolls !== undefined && getLevel(rolls) >= targetLevel) count++;
    }
    return count;
  }

  function getCurrent(a) {
    if (a.type === "row") return completeRows;
    if (a.type === "column") return completeCols;
    if (a.type === "packs") return packsOpened;
    if (a.type === "level") return countNumbersAtLevel(a.target_level);
    return uniqueCount;
  }

  function getTarget(a) {
    if (a.type === "row" || a.type === "column" || a.type === "packs" || a.type === "level") return a.count;
    return a.threshold;
  }

  function getProgress(a) {
    return getCurrent(a) / getTarget(a);
  }

  function isAchieved(a) {
    return getCurrent(a) >= getTarget(a);
  }

  // reach_X: only the closest unachieved one is visible; all beyond are locked
  var lockedReachIds = useMemo(() => {
    var closestReachIndex = REACH_ACHIEVEMENTS.findIndex((a) => uniqueCount < a.threshold);
    return new Set(
      closestReachIndex === -1
        ? []
        : REACH_ACHIEVEMENTS.slice(closestReachIndex + 1).map((a) => a.id)
    );
  }, [uniqueCount]);

  function isLockedByRequires(a) {
    if (!a.requires) return false;
    return !claimedAchievements.includes(a.requires);
  }

  function isLocked(a) {
    return lockedReachIds.has(a.id) || isLockedByRequires(a);
  }

  var visibleAchievements = useMemo(() => {
    return achievementData
      .filter((a) => !fadingOut.includes(a.id) && !initialClaimed.current.includes(a.id))
      .sort((a, b) => {
        var aLocked = isLocked(a);
        var bLocked = isLocked(b);
        if (aLocked !== bLocked) return aLocked ? 1 : -1;
        return getProgress(b) - getProgress(a);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fadingOut, claimedAchievements, lockedReachIds, numbers, packsOpened, completeRows, completeCols]);

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
                var locked = isLocked(achievement);
                var claimed = claimedAchievements.includes(achievement.id);
                var achieved = isAchieved(achievement);
                var progressText = "";
                if (achievement.type === "row" || achievement.type === "column" || achievement.type === "packs" || achievement.type === "level") {
                  progressText = " (" + Math.min(getCurrent(achievement), getTarget(achievement)) + "/" + getTarget(achievement) + ")";
                }
                var fillPercent = Math.min(getProgress(achievement), 1) * 100;

                if (locked) {
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
                      (achieved && !claimed ? " can-claim-yellow" : "")
                    }
                    key={achievement.id}
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
                      {getCurrencyIcon(achievement.currency) + " " + achievement.reward_amount}
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
