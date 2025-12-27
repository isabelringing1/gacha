import { useState, useEffect, useRef } from "react";
import data from "./json/data.json";

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

const roll = () => {
  var totalSum = 0;
  for (var n in data.drop_rates) {
    var rarity = data.drop_rates[n];
    var dropRate = data.chance[rarity];
    totalSum += dropRate;
  }

  var random = Math.random() * totalSum;

  var counter = 0;
  for (var n in data.drop_rates) {
    var rarity = data.drop_rates[n];
    var dropRate = data.chance[rarity];
    counter += dropRate;
    if (counter >= random) {
      console.log(n, getRarity(n));
      return parseInt(n);
    }
  }
};

const rollMultiple = (amount) => {
  var rolls = [];
  for (var i = 0; i < amount; i++) {
    rolls.push(roll());
  }
  return rolls;
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

export { useInterval, msToTime, roll, rollMultiple, getRarity };
