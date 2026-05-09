export default function SuperWinPopup(props) {
  var { rolls, numPacksOpened, numRollButtonClicks, numBattles, startTime, combatLevel, onClose } = props;

  function getElapsedText(returnText = false) {
    if (!startTime) return null;
    var elapsed = Date.now() - startTime;
    var totalMinutes = Math.floor(elapsed / 60000);
    var minutes = totalMinutes % 60;
    var totalHours = Math.floor(totalMinutes / 60);
    var hours = totalHours % 24;
    var days = Math.floor(totalHours / 24);

    var parts = [];
    if (days > 0) parts.push(<span key="days"><b>{days}</b> day{days !== 1 ? "s" : ""}</span>);
    parts.push(<span key="hours"><b>{hours}</b> hour{hours !== 1 ? "s" : ""}</span>);
    if (minutes > 0) parts.push(<span key="minutes"><b>{minutes}</b> minute{minutes !== 1 ? "s" : ""}</span>);
    if (returnText) {
      var textParts = [];
      if (days > 0) textParts.push(days + " day" + (days !== 1 ? "s" : ""));
      if (hours > 0) textParts.push(hours + " hour" + (hours !== 1 ? "s" : ""));
      if (minutes > 0) textParts.push(minutes + " minute" + (minutes !== 1 ? "s" : ""));
      return textParts.join(", ");
    }
    return <>and  {parts.reduce((acc, el, i) => i === 0 ? [el] : [...acc, ", ", el], [])}</>;
  }

  var elapsedText = getElapsedText();

  function onShareStats() {
    var t = getElapsedText(true);
    var text = "I 100%ed Number Gacha in " + t + "!";
    navigator.share({
      text: text,
      url: window.location.href,
    });
  }

  return (
    <div className="win-popup-overlay" onClick={onClose}>
      <div className="win-popup dither-bg" onClick={(e) => e.stopPropagation()}>
        <div className="title">COLLECTION SUPER COMPLETE</div>
        <div className="win-popup-body">

          <div className="win-popup-text win-popup-text-top">...and it only took </div>
          <div className="win-popup-text"><b>{numRollButtonClicks.toLocaleString()}</b> rolls</div>
          <div className="win-popup-text"> <b>{numPacksOpened.toLocaleString()}</b> packs</div>
          <div className="win-popup-text"><b>{rolls.length.toLocaleString()}</b> numbers</div>
          <div className="win-popup-text"><b>{numBattles.toLocaleString()}</b> battles</div>
          {elapsedText && <div className="win-popup-text">{elapsedText}</div>}

          <div className="win-popup-text combat-level-text">You reached level <b>{combatLevel}</b> in battle. That's some serious work!</div>

      <div className="win-popup-buttons">
          <button className="win-popup-button" onClick={onShareStats}>SHARE</button>
          <button className="win-popup-button" onClick={onClose}>CLOSE</button>
          </div>
        </div>
      </div>
    </div>
  );
}
