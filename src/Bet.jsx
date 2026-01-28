import { useState, useRef, useEffect } from "react";
import Markdown from "react-markdown";
import { isMobile } from "./constants.js";
import { getChances, getPayout } from "./Util.jsx";

const Bet = (props) => {
  const { betEntry, bet, diamonds, onBetConfirmed, index, generateBet } = props;

  const [betButtonPressed, setBetButtonPressed] = useState(-1);
  const [betInputClassName, setBetInputClassName] = useState("");
  const [payout, setPayout] = useState(0);
  const [confirmedBet, setConfirmedBet] = useState(-1);
  const [betInputInteracted, setBetInputInteracted] = useState(false);
  const [betResult, setBetResult] = useState(null);

  const setBetInputRef = useRef(null);

  useEffect(() => {
    if (betEntry.payout) {
      setPayout(betEntry.payout);

      setConfirmedBet(betEntry.cost);
    } else {
      var p = getPayout(bet, bet.options[betButtonPressed], diamonds / 2);
      setPayout(Math.floor(p)); // replace with whatever formula
      setConfirmedBet(-1);
    }
    setBetButtonPressed(betEntry.option ?? -1);
    console.log("bet entry updated, ", betEntry);

    if (betEntry.finished) {
      setBetResult(betEntry.wonBet ? "YOU WON!" : "YOU LOST!");
      setTimeout(() => {
        generateBet([index]);
      }, 800);
    } else {
      setBetResult(null);
    }
  }, [betEntry]);

  const onBetButtonPressed = (i) => {
    setBetButtonPressed(i);
  };

  const onInput = () => {
    setBetInputInteracted(true);
    if (setBetInputRef.current.value.length > 4) {
      setBetInputClassName("bet-input-smaller");
    } else if (setBetInputRef.current.value.length > 3) {
      setBetInputClassName("bet-input-small");
    } else {
      setBetInputClassName("");
    }
    if (!isSetBetButtonDisabled()) {
      var p = getPayout(
        bet,
        bet.options[betButtonPressed],
        parseInt(setBetInputRef.current.value),
      );
      setPayout(Math.floor(p));
    } else {
      setPayout(0);
    }
  };

  const isSetBetButtonDisabled = () => {
    if (!betInputInteracted && diamonds > 1) {
      return false;
    }
    if (
      setBetInputRef.current &&
      setBetInputRef.current.value &&
      !isNaN(parseInt(setBetInputRef.current.value)) &&
      setBetInputRef.current.value % 1 == 0
    ) {
      var input = parseInt(setBetInputRef.current.value);
      return input > diamonds || input <= 0;
    }
    return true;
  };

  const onConfirmPressed = () => {
    var bet = parseInt(setBetInputRef.current.value);
    setConfirmedBet(bet);
    onBetConfirmed(index, betButtonPressed, bet, payout);
  };

  return (
    <div className={"bet entry-" + index}>
      {confirmedBet != -1 && (
        <svg className="animated-border" viewBox="0 0 100 100">
          <rect
            x="1"
            y="1"
            width="98"
            height={isMobile ? "37" : "35"}
            rx={1}
            ry={1}
            pathLength={1}
            style={{
              stroke: "#e2e2e2",
              strokeWidth: isMobile ? `0.25dvh` : `0.15dvh`,
              animationDuration: `2s`,
            }}
          />
        </svg>
      )}

      <div className="bet-title">
        <Markdown>
          {betButtonPressed != -1 ? bet.text_after[betButtonPressed] : bet.text}
        </Markdown>
      </div>
      {confirmedBet == -1 && (
        <div className="bet-options">
          {betButtonPressed == -1 && (
            <div className="bet-option" id="bet-option-0">
              <button
                className={
                  "bet-button bet-green" +
                  (betButtonPressed == 0 ? " bet-button-confirmed" : "")
                }
                onClick={() => onBetButtonPressed(0)}
              >
                {bet.options[0]}
              </button>
              <span
                className={
                  "bet-odds " +
                  (getChances(bet, bet.options[0]) >= 50
                    ? " bet-good"
                    : " bet-bad")
                }
              >
                {getChances(bet, bet.options[0])}%
              </span>
            </div>
          )}

          {betButtonPressed == -1 && (
            <div className="bet-option" id="bet-option-1">
              <button
                className={
                  "bet-button bet-red" +
                  (betButtonPressed == 1 ? " bet-button-confirmed" : "")
                }
                onClick={() => onBetButtonPressed(1)}
              >
                {bet.options[1]}
              </button>
              <span
                className={
                  "bet-odds " +
                  (getChances(bet, bet.options[1]) >= 50
                    ? " bet-good"
                    : " bet-bad")
                }
              >
                {getChances(bet, bet.options[1])}%
              </span>
            </div>
          )}
        </div>
      )}

      {betButtonPressed != -1 && confirmedBet == -1 && (
        <div className="bet-left-column">
          <div className={"set-bet-container " + betInputClassName}>
            &diams;&#xfe0e;
            <input
              type="number"
              onInput={onInput}
              id="set-bet-input"
              className={betInputClassName}
              ref={setBetInputRef}
              defaultValue={Math.floor(diamonds / 2)}
              autoFocus={true}
            ></input>
          </div>
          {betButtonPressed != -1 &&
            confirmedBet == -1 &&
            payout > 0 &&
            betResult != "YOU LOST!" && (
              <div className="bet-payout-container">
                Payout: &diams;&#xfe0e;{payout.toLocaleString()}
              </div>
            )}
        </div>
      )}

      {betButtonPressed != -1 && confirmedBet == -1 && (
        <div className="bet-right-column">
          {betButtonPressed != -1 && (
            <div className="bet-option" id="bet-option-confirm">
              <button
                className="bet-button"
                id="bet-button-confirm"
                disabled={isSetBetButtonDisabled()}
                onClick={onConfirmPressed}
              >
                CONFIRM
              </button>
            </div>
          )}

          {betButtonPressed != -1 && (
            <div className="bet-option">
              <button
                className="bet-button"
                id="bet-button-cancel"
                onClick={() => setBetButtonPressed(-1)}
              >
                CANCEL
              </button>
            </div>
          )}
        </div>
      )}

      {/* AFTER BET CONFIRMED */}
      {confirmedBet != -1 && (
        <div className="bet-left-column bet-confirmed-left">
          {!betResult && (
            <div
              className={
                "bet-odds-big " +
                (getChances(bet, bet.options[betButtonPressed]) >= 50
                  ? " bet-good"
                  : " bet-bad")
              }
            >
              {getChances(bet, bet.options[betButtonPressed])}%
            </div>
          )}
          {betResult && (
            <div
              className={
                "bet-result " + (betEntry.wonBet ? " bet-good" : " bet-bad")
              }
            >
              {betResult}
            </div>
          )}
          <div className="confirmed-payout-container">
            Pays out &diams;&#xfe0e;{payout.toLocaleString()}{" "}
          </div>
        </div>
      )}

      {betButtonPressed != -1 && (
        <div className="bet-right-column bet-confirmed-right">
          <div>
            {confirmedBet != -1 && (
              <span className="bet-rolls-container">
                {betEntry.rolls.length}/{bet.rolls}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Bet;
