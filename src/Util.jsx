import { useEffect, useRef } from "react";
import data from "./json/data.json";
import rarityData from "./json/rarity.json";
import packData from "./json/packs.json";
import charmData from "./json/charms.json";
import betData from "./json/bets.json";
import levelData from "./json/levels.json";

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

/*const roll = (
  multiple = 1,
  min = 0,
  max = 0,
  modulo = 0,
  remainder = 0,
  pool = [],
  drop_table = data.chance,
) => {
  var totalSum = 0;
  min = min == 0 ? 1 : min;
  max = max == 0 ? 100 : max;
  for (var n in data.drop_rates) {
    n = parseInt(n);
    if (!isNumberValid(n, multiple, min, max, modulo, remainder, pool)) {
      continue;
    }
    var rarity = data.drop_rates[n];
    var dropRate = drop_table[rarity];
    totalSum += dropRate;
  }

  var random = Math.random() * totalSum;

  var counter = 0;
  for (var n in data.drop_rates) {
    n = parseInt(n);
    if (!isNumberValid(n, multiple, min, max, modulo, remainder, pool)) {
      continue;
    }

    var rarity = data.drop_rates[n];
    var dropRate = drop_table[rarity];
    counter += dropRate;
    if (counter >= random) {
      console.log(n, getRarity(n));
      return parseInt(n);
    }
  }
};*/

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
  rarities.reverse();
  console.log(rarities);
  var rolledRarity = rarities[rarities.length - 1]; // assign most basic rarity as the fallback
  for (var i in rarities) {
    var rarity = rarities[i];
    var rarityChance = dropTable[rarity];
    var roll = Math.random() * 100;
    console.log(
      "rarity roll: roll was " +
        roll +
        ", chance is " +
        rarityChance +
        " for rarity " +
        rarity,
    );
    if (roll < rarityChance) {
      rolledRarity = rarity;
      break;
    }
  }

  var rolledPool = raritiesToNumber[rolledRarity];
  if (!rolledPool) {
    console.error(rolledRarity, raritiesToNumber);
  }
  return rolledPool[Math.floor(Math.random() * rolledPool.length)];
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
    rolls.push(roll(multiple, min, max, modulo, remainder, pool));
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
  console.log("ERROR: can't get for rolls " + numRolls);
}

function getLevel(numRolls) {
  for (var i = 0; i < levelData.length; i++) {
    if (levelData[i].rolls > numRolls) {
      return levelData[i].level - 1;
    }
  }
  console.log("ERROR: can't get for rolls " + numRolls);
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
};
