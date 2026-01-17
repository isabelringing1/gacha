import { useState, useEffect, useRef } from "react";
import data from "./json/data.json";
import rarityData from "./json/rarity.json";
import packData from "./json/packs.json";
import charmData from "./json/charms.json";

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
  showMs = false
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
  pool = []
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
    var dropRate = data.chance[rarity];
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
    var dropRate = data.chance[rarity];
    counter += dropRate;
    if (counter >= random) {
      console.log(n, getRarity(n));
      return parseInt(n);
    }
  }
};

const rollMultiple = (
  amount,
  multiple = 1,
  min = 0,
  max = 0,
  modulo = 0,
  remainder = 0,
  pool = []
) => {
  var rolls = [];
  for (var i = 0; i < amount; i++) {
    rolls.push(roll(multiple, min, max, modulo, remainder, pool));
  }
  return rolls;
};

function getNumbersInPack(pack) {
  var numbers = [];
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
        pack.pool
      )
    ) {
      continue;
    }
    numbers.push(n);
  }
  return numbers;
}

function isNumberValid(
  n,
  multiple = 1,
  min = 1,
  max = 100,
  modulo = 0,
  remainder = 0,
  pool = []
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
    (p) => p.rarity == rarity
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
};
