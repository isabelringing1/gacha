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

  var rarities = Object.keys(raritiesToNumber);
  rarities.reverse(); // [3, 2, 1, 0] — rarest first
  var rolledRarity = rarities[rarities.length - 1]; // common as fallback
  var roll = Math.random() * 100;
  var cumulative = 0;
  for (var i in rarities) {
    var rarity = rarities[i];
    cumulative += dropTable[rarity];
    console.log(
      "rarity roll: roll was " +
        roll +
        ", cumulative threshold is " +
        cumulative +
        " for rarity " +
        rarity,
    );
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
  console.log(rolls);
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
  //console.log(n, dropRates);
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

const rollForPack = () => {
  var rarityRoll = Math.random() * 100;
  var rarity = 0;

  var runningTotal = 0;
  for (const [r, chance] of Object.entries(packData.chances)) {
    runningTotal += chance;
    if (rarityRoll < runningTotal) {
      rarity = parseInt(r);
      break;
    }
  }

  var packsOfRarity = Object.values(packData.packs).filter(
    (p) => p.rarity == rarity,
  );

  var rolledPack =
    packsOfRarity[Math.floor(Math.random() * packsOfRarity.length)];
  return rolledPack;
};

function getNextCharm(index, purchasedCharms) {
  var path = charmData.paths[index];
  for (var i = 0; i < path.length; i++) {
    if (!purchasedCharms.includes(path[i].id)) {
      return path[i];
    }
  }
  return null;
}

function getCharmById(id) {
  for (var j = 0; j < charmData.paths.length; j++) {
    var path = charmData.paths[j];
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

function rollEventNumber(numbers) {
  var unrolled = [];
  var defaultPool = [];
  for (var i = 1; i <= 100; i++) {
    var rarity = data.drop_rates[i];
    if (rarity > 0) {
      if (!numbers[i]) {
        unrolled.push(i);
      }
      defaultPool.push(i);
    }
  }

  if (unrolled.length != 0) {
    return unrolled[Math.floor(Math.random() * unrolled.length)];
  }
  return defaultPool[Math.floor(Math.random() * defaultPool.length)];
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
  console.log(raritiesToNumber);

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
  return levelData[0];
}

function getLevel(numRolls) {
  for (var i = 0; i < levelData.length; i++) {
    if (levelData[i].rolls > numRolls) {
      return levelData[i].level - 1;
    }
  }
  console.log("ERROR: can't get for rolls " + numRolls);
}

function getMaxLevel() {
  return levelData[levelData.length - 1].level;
}

function generateCombatRewards(level, enemy) {
  var levelData = combatData.levels.find((l, i) => l.level == level);
  var min = getCombatLevelMin(level);
  var max = getCombatLevelMax(level);
  var total =
    levelData.base_total_rewards +
    linMap(enemy, min, max, levelData.base_total_rewards);
  var rewards = {};
  for (const [key, value] of Object.entries(levelData.rewards)) {
    if (key == "keys") {
      rewards[key] = value > 0 ? 1 : 0;
    } else {
      rewards[key] = Math.floor((value * total) / 100);
    }
  }
  return rewards;
}

function linMap(value, min, max, total) {
  const t = (value - min) / (max - min);
  const clampedT = Math.min(Math.max(t, 0), 1);
  return clampedT * (0.25 * total);
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
  return (combatLevel - 1) * 300;
}

function getCombatLevelMax(combatLevel) {
  return (combatLevel - 1) * 300 + 200;
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
};
