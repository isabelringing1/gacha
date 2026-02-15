import { useEffect } from "react";
import { getBet } from "./Util";
import { UNLOCK_SPORTSBOOK_COST } from "./constants.js";

import Bet from "./Bet";

export default function Sportsbook(props) {
  const {
    diamonds,
    setDiamonds,
    rolls,
    sportsbookEntries,
    setSportsbookEntries,
    numbers,
    generateBet,
    sportsbookState,
    unlockSportsbook,
    canUnlockSportsbook,
  } = props;

  // only triggers after initial mount
  useEffect(() => {
    if (sportsbookState == "locked") {
      return;
    }
    var newSportsbookEntries = [...sportsbookEntries];
    for (var i = 0; i < sportsbookEntries.length; i++) {
      if (sportsbookEntries[i].active) {
        if (
          rolls.length > sportsbookEntries[i].lastRecordedRollLength &&
          !rolls[0].fromPack
        ) {
          var newEntry = { ...sportsbookEntries[i] };
          newEntry.lastRecordedRollLength = rolls.length;
          newEntry.rolls.push(rolls[0]);
          var bet = getBet(newEntry.id);
          if (newEntry.rolls.length >= bet.rolls) {
            console.log("bet done ", bet);
            newEntry.active = false;
            newEntry.finished = true;
            if (meetsCondition(bet.id, newEntry.option, newEntry.rolls)) {
              setDiamonds(diamonds + newEntry.payout);
              newEntry.wonBet = true;
              console.log("bet won");
            } else {
              newEntry.wonBet = false;
              console.log("bet lost");
            }
          }
          newSportsbookEntries[i] = newEntry;
        }
      }
    }
    setSportsbookEntries(newSportsbookEntries);
  }, [rolls]);

  const meetsCondition = (betId, option, rolls) => {
    if (betId == "next-roll-odd") {
      console.log(rolls, option, rolls[0] % 2);
      return rolls[0] % 2 == (option == 0 ? 1 : 0);
    }
    if (betId == "next-three-rolls") {
      return rolls.reduce((acc, curr) => acc + curr, 0) >= 100;
    }
  };

  const onBetConfirmed = (index, option, cost, payout) => {
    var newSportsbookEntries = [...sportsbookEntries];
    var newBet = {
      ...newSportsbookEntries[index],
      option: option,
      payout: payout,
      cost: cost,
      lastRecordedRollLength: rolls.length,
      rolls: [],
      active: true,
    };
    setDiamonds(diamonds - cost);
    newSportsbookEntries[index] = newBet;
    setSportsbookEntries(newSportsbookEntries);
  };

  return (
    <div className="sportsbook-container">
      <div className="sportsbook dither-bg">
        <div className="title">SPORTSBOOK</div>
        {sportsbookState == "locked" && (
          <div className="bets-container-locked">
            <div className="title">UNLOCK</div>
            <button
              disabled={!canUnlockSportsbook()}
              onClick={unlockSportsbook}
            >
              &diams;&#xfe0e; {UNLOCK_SPORTSBOOK_COST}
            </button>
            <div className="text">Wait, this game has betting?</div>
          </div>
        )}
        {sportsbookState == "unlocked" && (
          <div className="bets-container">
            {sportsbookEntries &&
              sportsbookEntries.map((betEntry, i) => {
                var bet = getBet(betEntry.id);
                return bet ? (
                  <Bet
                    betEntry={betEntry}
                    diamonds={diamonds}
                    bet={bet}
                    index={i}
                    onBetConfirmed={onBetConfirmed}
                    key={"bet-" + i}
                    generateBet={generateBet}
                  />
                ) : null;
              })}
          </div>
        )}
      </div>
    </div>
  );
}
