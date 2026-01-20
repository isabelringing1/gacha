import { useEffect } from "react";
import { getBet } from "./Util";

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
  } = props;

  // only triggers after initial mount
  useEffect(() => {
    var newSportsbookEntries = [...sportsbookEntries];
    for (var i = 0; i < sportsbookEntries.length; i++) {
      if (sportsbookEntries[i].active) {
        if (
          rolls.length > sportsbookEntries[i].lastRecordedRollLength &&
          !rolls[rolls.length - 1].fromPack
        ) {
          var newEntry = { ...sportsbookEntries[i] };
          newEntry.lastRecordedRollLength = rolls.length;
          newEntry.rolls.push(rolls[rolls.length - 1]);
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
          console.log(newEntry);
          newSportsbookEntries[i] = newEntry;
        }
      }
    }
    setSportsbookEntries(newSportsbookEntries);
  }, [rolls]);

  const meetsCondition = (betId, option, rolls) => {
    if (betId == "next-roll-odd") {
      return rolls[0] % 2 == (option == 0 ? 1 : 0);
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
      <div className="sportsbook">
        <div className="shop-title">SPORTSBOOK</div>
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
      </div>
    </div>
  );
}
