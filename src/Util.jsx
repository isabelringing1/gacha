import { useEffect, useRef } from "react";
import data from "./json/data.json";
import rarityData from "./json/rarity.json";
import packData from "./json/packs.json";
import charmData from "./json/charms.json";
import betData from "./json/bets.json";
import levelData from "./json/levels.json";
import combatData from "./json/combat.json";
import { PYRAMID_LEVELS } from "./constants.js";
import keyIcon from "/key.png";
//https://www.joshwcomeau.com/snippets/react-hooks/use-interval/
function useInterval(callback, delay) {
  const intervalRef = useRef(null);
  const savedCallback = useRef(callback);
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  useEffect(() => {
    const tick = () => savedCallback.current();
    if (typeof delay === "number") {
      intervalRef.current = window.setInterval(tick, delay);
      return () => window.clearInterval(intervalRef.current);
    }
  }, [delay]);
  return intervalRef;
}

//https://stackoverflow.com/a/19700358
function msToTime(
  duration,
  clipZeroes = false,
  noSeconds = false,
  showMs = false,
) {
  var milliseconds = Math.floor((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  var strhours = hours;
  var strminutes = minutes;
  var strseconds = seconds;
  var strtime = "";
  if (!clipZeroes || hours != 0) {
    strtime += strhours + "h ";
  }
  if (!clipZeroes || minutes != 0) {
    strtime += strminutes + "m ";
  }
  if (!noSeconds || strtime == "") {
    strtime += strseconds + "s";
  }
  if (showMs) {
    strtime += " " + milliseconds + "ms";
  }

  return strtime;
}

const roll = (
  multiple = 1,
  min = 0,
  max = 0,
  modulo = 0,
  remainder = 0,
  pool = [],
  dropTable = data.chance,
  dropRates = data.drop_rates,
) => {
  min = min == 0 ? 1 : min;
  max = max == 0 ? 100 : max;
  // sort by each rarity
  var raritiesToNumber = {};
  for (var n in dropRates) {
    n = parseInt(n);
    if (!isNumberValid(n, multiple, min, max, modulo, remainder, pool)) {
      continue;
    }
    var rarity = dropRates[n];
    if (raritiesToNumber[rarity]) {
      raritiesToNumber[rarity].push(n);
    } else {
      raritiesToNumber[rarity] = [n];
    }
  }

  var adjusted = { ...dropTable };
  var totalCount = 0;
  for (var r in raritiesToNumber) totalCount += raritiesToNumber[r].length;

  if (totalCount > 0) {
    var presentRarities = Object.keys(raritiesToNumber)
      .map(function (x) { return parseInt(x); })
      .sort(function (a, b) { return a - b; });
    var absorbRarity = presentRarities[0];
    var excess = 0;
    for (var pi = 0; pi < presentRarities.length; pi++) {
      var pr = presentRarities[pi];
      if (pr === absorbRarity) continue;
      var trueRandom = (raritiesToNumber[pr].length / totalCount) * 100;
      var baseChance = adjusted[pr] || 0;
      if (trueRandom < baseChance) {
        excess += baseChance - trueRandom;
        adjusted[pr] = trueRandom;
      }
    }
    adjusted[absorbRarity] = (adjusted[absorbRarity] || 0) + excess;
  }

  var rarities = Object.keys(raritiesToNumber);
  rarities.reverse(); // [3, 2, 1, 0] — rarest first
  var rolledRarity = rarities[rarities.length - 1]; // common as fallback
  var roll = Math.random() * 100;
  var cumulative = 0;
  for (var i in rarities) {
    var rarity = rarities[i];
    cumulative += adjusted[rarity];
    if (roll < cumulative) {
      rolledRarity = rarity;
      break;
    }
  }

  var rolledPool = raritiesToNumber[rolledRarity];
  if (!rolledPool) {
    console.error(rolledRarity, raritiesToNumber);
  }
  var index = Math.floor(Math.random() * rolledPool.length);
  return rolledPool[index];
};

const rollMultiple = (
  amount,
  multiple = 1,
  min = 0,
  max = 0,
  modulo = 0,
  remainder = 0,
  pool = [],
) => {
  var rolls = [];
  for (var i = 0; i < amount; i++) {
    var newRoll = roll(multiple, min, max, modulo, remainder, pool);
    rolls.push(newRoll);
  }
  return rolls;
};

const rollEvent = (event) => {
  var dropTable = { ...data.chance };
  var dropRates = { ...data.drop_rates };
  var n = event.n;
  var normalNumberRarity = dropRates[n];

  // sort by each rarity
  var raritiesToNumber = {};
  for (var i in dropRates) {
    i = parseInt(n);
    var rarity = dropRates[n];
    if (raritiesToNumber[rarity]) {
      raritiesToNumber[rarity].push(i);
    } else {
      raritiesToNumber[rarity] = [i];
    }
  }
  // chance = chance to roll number's rarity * chance to roll that number within rarity
  var regularChances =
    dropTable[normalNumberRarity] *
    (1 / raritiesToNumber[normalNumberRarity].length);

  dropTable[4] = event.addedChance + regularChances; // add extra category for event number
  dropTable[0] -= event.addedChance + regularChances; // take the % gained from the most common pool

  // replace number's normal rarity with special rarity
  dropRates[n] = 4;
  return roll(1, 0, 0, 0, 0, [], dropTable, dropRates);
};

function getNumbersInPack(packId) {
  var pack = packData.packs[packId];
  var numbers = [];
  if (pack.id == "copycat") {
    return [];
  }
  for (var n in data.drop_rates) {
    n = parseInt(n);
    if (
      !isNumberValid(
        n,
        pack.multiple,
        pack.min,
        pack.max,
        pack.modulo,
        pack.remainder,
        pack.pool,
      )
    ) {
      continue;
    }
    numbers.push(n);
  }
  return numbers;
}

function getPackRarity(pack) {
  if (pack.rarity == 0) {
    return "COMMON";
  } else if (pack.rarity == 1) {
    return "RARE";
  } else if (pack.rarity == 2) {
    return "EPIC";
  } else if (pack.rarity == 3) {
    return "LEGENDARY";
  }
  return "ERROR";
}

function isNumberValid(
  n,
  multiple = 1,
  min = 1,
  max = 100,
  modulo = 0,
  remainder = 0,
  pool = [],
) {
  if (n % multiple != 0) {
    return false;
  }
  if (n < min || n > max) {
    return false;
  }
  if (modulo != 0 && n % modulo != remainder) {
    return false;
  }
  if (pool.length > 0 && !pool.includes(n)) {
    return false;
  }
  return true;
}

const getRarityIndex = (n) => {
  return data.drop_rates[n];
};

const getRarity = (n) => {
  var r = data.drop_rates[n];
  if (r == 1) {
    return "rare";
  } else if (r == 2) {
    return "epic";
  } else if (r == 3) {
    return "legendary";
  }
  return "common";
};

const getRarityData = (n) => {
  var index = data.drop_rates[n];
  return rarityData[index];
};

const factors = (number) =>
  [...Array(number + 1).keys()].filter((i) => number % i === 0);

const rollForPack = (forceRarity) => {
  var rarity = 0;

  if (forceRarity != null) {
    rarity = forceRarity;
  } else {
    var rarityRoll = Math.random() * 100;
    var runningTotal = 0;
    for (const [r, chance] of Object.entries(packData.chances)) {
      runningTotal += chance;
      if (rarityRoll < runningTotal) {
        rarity = parseInt(r);
        break;
      }
    }
  }

  var packsOfRarity = Object.values(packData.packs).filter(
    (p) => p.rarity == rarity,
  );

  var rolledPack =
    packsOfRarity[Math.floor(Math.random() * packsOfRarity.length)];
  return rolledPack;
};

const MAX_HEARTS_SLOT_INDEX = 2;

function toRoman(num) {
  if (num <= 0 || !isFinite(num)) return String(num);
  var romans = [
    ["M", 1000], ["CM", 900], ["D", 500], ["CD", 400],
    ["C", 100], ["XC", 90], ["L", 50], ["XL", 40],
    ["X", 10], ["IX", 9], ["V", 5], ["IV", 4], ["I", 1],
  ];
  var n = Math.floor(num);
  var result = "";
  for (var i = 0; i < romans.length; i++) {
    while (n >= romans[i][1]) {
      result += romans[i][0];
      n -= romans[i][1];
    }
  }
  return result;
}

function getMaxHeartsCost(n) {
  return 15 + (5 * n * (n + 1)) / 2;
}

function getMaxHeartsCharm(n) {
  return {
    id: "max-hearts-increase-" + n,
    category: "max-hearts-increase",
    name: "Heart Container " + toRoman(n),
    desc: "+1 Max \u2665\uFE0E",
    cost: getMaxHeartsCost(n),
    heart_upgrade: 1,
    consumable: true,
    art: "./heart-container.png",
  };
}

function getNextMaxHeartsIndex(purchasedCharms) {
  var maxIdx = 0;
  for (var i = 0; i < purchasedCharms.length; i++) {
    var m = /^max-hearts-increase-(\d+)$/.exec(purchasedCharms[i]);
    if (m) {
      var idx = parseInt(m[1], 10);
      if (idx > maxIdx) maxIdx = idx;
    }
  }
  return maxIdx + 1;
}

function isMaxHeartsUnlocked(purchasedCharms) {
  return (
    purchasedCharms.includes("speed-up-6") ||
    purchasedCharms.includes("diamond-upgrade-5")
  );
}

const TEN_PULL_SLOT_INDEX = 3;

function isTenPullUnlocked(purchasedCharms) {
  return (
    purchasedCharms.includes("speed-up-6") &&
    purchasedCharms.includes("diamond-upgrade-5")
  );
}

function findPathByCategory(category) {
  for (var p = 0; p < charmData.paths.length; p++) {
    var path = charmData.paths[p];
    if (path && path.length > 0 && path[0].category === category) {
      return path;
    }
  }
  return null;
}

function nextUnpurchasedInPath(path, purchasedCharms) {
  if (!path) return null;
  for (var i = 0; i < path.length; i++) {
    if (!purchasedCharms.includes(path[i].id)) {
      return path[i];
    }
  }
  return null;
}

function getNextCharm(index, purchasedCharms) {
  if (index === MAX_HEARTS_SLOT_INDEX) {
    if (!isMaxHeartsUnlocked(purchasedCharms)) return null;
    return getMaxHeartsCharm(getNextMaxHeartsIndex(purchasedCharms));
  }
  if (index === TEN_PULL_SLOT_INDEX) {
    if (!isTenPullUnlocked(purchasedCharms)) return null;
    return nextUnpurchasedInPath(findPathByCategory("ten-pull"), purchasedCharms);
  }
  var path = charmData.paths[index];
  if (!path) return null;
  return nextUnpurchasedInPath(path, purchasedCharms);
}

function getCharmById(id) {
  if (!id) return null;
  var match = /^max-hearts-increase-(\d+)$/.exec(id);
  if (match) {
    return getMaxHeartsCharm(parseInt(match[1], 10));
  }
  for (var j = 0; j < charmData.paths.length; j++) {
    var path = charmData.paths[j];
    if (!path) continue;
    for (var i = 0; i < path.length; i++) {
      if (path[i].id == id) {
        return path[i];
      }
    }
  }
  return null;
}

function getPackCost(pack) {
  return packData.cost[pack.rarity];
}

function rollForBet(index) {
  return betData[index];
}

function getBet(id) {
  for (var i = 0; i < betData.length; i++) {
    if (betData[i].id == id) {
      return betData[i];
    }
  }
}

function getChancesForNextRollOdd(option) {
  var totalSum = 0;
  var chances = 0;
  for (var n in data.drop_rates) {
    n = parseInt(n);
    var rarity = data.drop_rates[n];
    var dropRate = data.chance[rarity];
    totalSum += dropRate;
    if (n % 2 == (option == "YES" ? 1 : 0)) {
      chances += dropRate;
    }
  }
  return (100 * chances) / totalSum;
}

function getChances(bet, option) {
  if (bet.id == "next-roll-odd") {
    return getChancesForNextRollOdd(option).toFixed(1);
  }
  if (bet.id == "next-three-rolls") {
    return bet.chances[option == "YES" ? 0 : 1];
  }
  return 0;
}

function getPayout(bet, option, stake) {
  var chances = getChances(bet, option);
  return (stake / chances) * 100;
}

function rollEventNumber(numbers, lockedNumbers) {
  var locked = lockedNumbers || [];
  var byLevel = {};
  for (var i = 1; i <= 100; i++) {
    var rarity = data.drop_rates[i];
    if (rarity > 0 && !locked.includes(i)) {
      var rolls = numbers[i] || 0;
      var lvl = rolls > 0 ? (getLevel(rolls) ?? getMaxLevel()) : 0;
      if (!byLevel[lvl]) byLevel[lvl] = [];
      byLevel[lvl].push(i);
    }
  }

  var levels = Object.keys(byLevel)
    .map(function (k) { return parseInt(k); })
    .sort(function (a, b) { return a - b; });
  if (levels.length === 0) return null;
  var pool = byLevel[levels[0]];
  return pool[Math.floor(Math.random() * pool.length)];
}

function chance3SumGreaterThan(goal = 100) {
  let chance = 0;

  var raritiesToNumber = {};
  for (var n in data.drop_rates) {
    n = parseInt(n);
    var rarity = data.drop_rates[n];
    if (raritiesToNumber[rarity]) {
      raritiesToNumber[rarity].push(n);
    } else {
      raritiesToNumber[rarity] = [n];
    }
  }

  var probabilites = {
    0: data.chance[0] / raritiesToNumber[0].length / 100,
    1: data.chance[1] / raritiesToNumber[1].length / 100,
    2: data.chance[2] / raritiesToNumber[2].length / 100,
    3: data.chance[3] / raritiesToNumber[3].length / 100,
  };

  var probMap = {};
  for (var i = 1; i <= 100; i++) {
    probMap[i] = probabilites[data.drop_rates[i]];
  }
  const values = Object.keys(probMap).map(Number);

  for (let a of values) {
    for (let b of values) {
      for (let c of values) {
        const sum = a + b + c;
        if (sum > goal) {
          chance += probMap[a] * probMap[b] * probMap[c];
        }
      }
    }
  }

  return chance;
}

function getLevelData(numRolls) {
  for (var i = 0; i < levelData.length; i++) {
    if (levelData[i].rolls > numRolls) {
      return levelData[i - 1];
    }
  }
  return levelData[levelData.length - 1];
}

function getLevel(numRolls) {
  for (var i = 0; i < levelData.length; i++) {
    if (levelData[i].rolls > numRolls) {
      return levelData[i].level - 1;
    }
  }
  return levelData[levelData.length - 1].level;
}

function getMaxLevel() {
  return levelData[levelData.length - 1].level;
}

function generateCombatRewards(level, enemy) {
  var levelData = combatData.levels.find((l, i) => l.level == level);
  var rewards = {};
  for (const [key, value] of Object.entries(levelData.rewards)) {
    rewards[key] = value;
  }
  return rewards;
}

function countFactorsInRange(n) {
  var count = 0;
  for (var f = 1; f <= 100; f++) {
    if (n % f === 0) count++;
  }
  return count;
}

function generateEnemyValue(min, max, uniqueValues) {
  // Build enemies from random prime combos so factors span all of 1-100,
  // not just even numbers. Picks 2-3 distinct primes, multiplies them
  // into a base, then finds a random multiple in [min, max].
  var primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
  for (var attempt = 0; attempt < 300; attempt++) {
    // Shuffle and pick 2-3 distinct primes
    var shuffled = primes.slice().sort(function () {
      return Math.random() - 0.5;
    });
    var numPicks = 2 + Math.floor(Math.random() * 2);
    var base = 1;
    for (var p = 0; p < numPicks; p++) {
      if (base * shuffled[p] > max) break;
      base *= shuffled[p];
    }
    if (base < 2) continue;

    var minMult = Math.ceil(min / base);
    var maxMult = Math.floor(max / base);
    if (minMult > maxMult) continue;

    var mult = Math.floor(Math.random() * (maxMult - minMult + 1)) + minMult;
    var value = mult * base;
    if (value > 0 && value >= min && value <= max && countFactorsInRange(value) >= 4 && !uniqueValues.has(value)) {
      return value;
    }
  }
  // Fallback: nearest multiple of 15 (odd) or 60 in range
  var odd = Math.ceil(min / 15) * 15;
  if (odd >= min && odd <= max && countFactorsInRange(odd) >= 4 && !uniqueValues.has(odd)) return odd;
  var fallback = Math.ceil(min / 60) * 60;
  if (fallback >= min && fallback <= max && countFactorsInRange(fallback) >= 4 && !uniqueValues.has(fallback)) return fallback;
  
  // fallback fallback
  var num = null;
  while (num == null) {
    num = Math.floor(Math.random() * (max - min + 1)) + min;
    if (uniqueValues.has(num)) {
      num = null;
    }
  }
  return num;
}

function getCombatLevelData(combatLevel) {
  return combatData.levels.find((l) => l.level == combatLevel) || {};
}

function getCombatLevelMin(combatLevel) {
  if (combatLevel == 2){
    return 250;
  }
  if (combatLevel < 7) {
    return (combatLevel - 1) * 400;
  }
  // From level 7 through 10, each level's min is double the previous.
  // Level 6 min = 1500 → level 7 min = 3000, level 8 min = 6000, etc.
  if (combatLevel <= 10) {
    return 1500 * Math.pow(2, combatLevel - 6);
  }
  // After level 10, each level's min is 3x the previous (instead of 2x).
  var level10Min = 1500 * Math.pow(2, 4);
  return level10Min * Math.pow(3, combatLevel - 10);
}

function getCombatLevelMax(combatLevel) {
  if (combatLevel == 2){
    return 350;
  }
  if (combatLevel < 7) {
    return (combatLevel - 1) * 400 + 200;
  }
  return Math.floor(getCombatLevelMin(combatLevel) * 1.2);
}

function generateEnemyForLevel(combatLevel) {
  var min = getCombatLevelMin(combatLevel);
  var max = getCombatLevelMax(combatLevel);
  var uniqueValues = new Set();
  return generateEnemyValue(min, max, uniqueValues);
}

function generateEnemies() {
  var pyramid = [];
  for (var level = 0; level < PYRAMID_LEVELS; level++) {
    var row = [];
    var numEnemies = PYRAMID_LEVELS - level;
    var levelConfig = combatData.levels[level];
    var min = levelConfig.min;
    var max = levelConfig.max;
    var uniqueValues = new Set();
    while (row.length < numEnemies) {
      var value = generateEnemyValue(min, max, uniqueValues);
      if (!uniqueValues.has(value)) {
        uniqueValues.add(value);
        //row.push({ value: value, isDefeated: false });
      }
      row.push({ value: value, isDefeated: false });
    }
    row.sort((a, b) => a.value - b.value);
    pyramid.push(row);
  }
  return pyramid;
}

function getCurrencyIcon(id) {
  if (id == "hearts") {
    return "\u{2665}\u{FE0E}";
  }
  if (id == "diamonds") {
    return "\u{2666}\u{FE0E}";
  }
  if (id == "clubs") {
    return "\u{2663}\u{FE0E}";
  }
  if (id == "spades") {
    return "\u{2660}\u{FE0E}";
  }
  if (id == "keys") {
    return <img src={keyIcon} alt="key" className="key-icon" />;
  }
}


function rollFudged(rollIndex) {
  var commonNumbers = [];
  var commonUnder15 = [];
  var nonCommonNumbers = [];

  for (var n in data.drop_rates) {
    n = parseInt(n);
    var rarity = data.drop_rates[n];
    if (rarity === 0) {
      commonNumbers.push(n);
      if (n < 15) {
        commonUnder15.push(n);
      }
    } else {
      nonCommonNumbers.push(n);
    }
  }

  var pick = function (arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  };

  if (rollIndex === 0) {
    return pick(commonNumbers); 
    
  } else if (rollIndex === 1) {
    return pick(commonUnder15);
  } else {
    return pick(nonCommonNumbers);
  }
}

function getFactors(number) {
 var factors = [];
 for (var i = 1; i <= 100; i++) {
  if (number % i == 0) {
    factors.push(i);
  }
 }
 return factors;
}

function getNumToUpgrade(numTimesRolled) {
  var level = getLevel(numTimesRolled);
  if (level == getMaxLevel()) {
    return 0;
  }
  var nextLevel = levelData[level + 1];
  return nextLevel.rolls - numTimesRolled;
}

function spawnDoober({ from, to, label, onLand, duration = 230 }) {
  if (!from || !to) {
    if (onLand) onLand();
    return;
  }
  var fromRect = from.getBoundingClientRect();
  var toRect = to.getBoundingClientRect();
  var sx = fromRect.left + fromRect.width / 2;
  var sy = fromRect.top + fromRect.height / 2;
  var tx = toRect.left + toRect.width / 2;
  var ty = toRect.top + toRect.height / 2;

  var doober = document.createElement("div");
  doober.className = "doober";
  doober.textContent = label;
  doober.style.left = sx + "px";
  doober.style.top = sy + "px";
  document.body.appendChild(doober);

  var dx = tx - sx;
  var dy = ty - sy;

  var anim = doober.animate(
    [
      { transform: "translate(-50%, -50%)", opacity: 1, offset: 0 },
      {
        transform:
          "translate(calc(-50% + " + dx + "px), calc(-50% + " + dy + "px))",
        opacity: 1,
        offset: 1,
      },
    ],
    { duration: duration, easing: "ease-in", fill: "forwards" },
  );

  anim.onfinish = function () {
    doober.remove();
    if (onLand) onLand();
  };
}

function getLevelProgress(numTimesRolled) {
  var rolls = numTimesRolled || 0;
  var level = getLevel(rolls);
  var current = levelData[level];
  var next = levelData[level + 1];
  var min = current ? current.rolls : 0;
  var max = next ? next.rolls : rolls;
  return { min: min, max: max, current: rolls, isMax: !next };
}

export {
  useInterval,
  msToTime,
  roll,
  rollMultiple,
  getRarity,
  getRarityIndex,
  getRarityData,
  factors,
  rollForPack,
  getNextCharm,
  getCharmById,
  getNumbersInPack,
  getPackCost,
  rollForBet,
  getBet,
  getChances,
  getPayout,
  getPackRarity,
  rollEventNumber,
  rollEvent,
  chance3SumGreaterThan,
  getLevelData,
  getLevel,
  getMaxLevel,
  generateCombatRewards,
  generateEnemies,
  generateEnemyForLevel,
  getCombatLevelData,
  getCurrencyIcon,
  getFactors,
  rollFudged,
  getNumToUpgrade,
  getLevelProgress,
  spawnDoober,
};
