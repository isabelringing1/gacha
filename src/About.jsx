import flower from "/flower.png";
import { isMobile } from "./constants.js";

export default function About(props) {
  var { showResetPopup, setShowResetPopup, numbers, lockedNumbers, startTime, lastDefeatedLevel, lastDefeatedEnemy, open, setOpen } = props;

  var hasAllNumbers =
    numbers && Object.keys(numbers).length === 100 && lockedNumbers && lockedNumbers.length === 0;
  var pastLevel10 = (lastDefeatedLevel || 0) >= 11;
  var canShare = hasAllNumbers || pastLevel10;

  function getElapsedTextString() {
    if (!startTime) return "";
    var elapsed = Date.now() - startTime;
    var totalMinutes = Math.floor(elapsed / 60000);
    var minutes = totalMinutes % 60;
    var totalHours = Math.floor(totalMinutes / 60);
    var hours = totalHours % 24;
    var days = Math.floor(totalHours / 24);
    var textParts = [];
    if (days > 0) textParts.push(days + " day" + (days !== 1 ? "s" : ""));
    if (hours > 0) textParts.push(hours + " hour" + (hours !== 1 ? "s" : ""));
    if (minutes > 0) textParts.push(minutes + " minute" + (minutes !== 1 ? "s" : ""));
    return textParts.join(", ");
  }

  function onShareStats() {
    var text;
    if (pastLevel10) {
      text = "I just beat " + (lastDefeatedEnemy || 0).toLocaleString() + " at Level " + lastDefeatedLevel + "!";
    } else {
      var t = getElapsedTextString();
      text = "I got all the numbers in " + t + "!";
    }
    navigator.share({
      text: text,
      url: window.location.href,
    });
  }

  return (
    <>
      {!isMobile && (
        <button
          className="about-button"
          onClick={() => setOpen(true)}
          aria-label="About"
        >
          i
        </button>
      )}
      {open && (
        <div className="win-popup-overlay" onClick={() => setOpen(false)}>
          <div
            className="win-popup dither-bg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="title">ABOUT</div>
            <div className="win-popup-body">
              <div className="win-popup-text">
                <b>Number Gacha</b> is a gacha game.
                </div>
                <div className="win-popup-text">
                When in doubt, just keep rolling.
                </div>
                <div className="win-popup-text">
                Made by <a className="flower-link" href="https://isabisabel.com" target="_blank" rel="noopener noreferrer">Isabel</a><img src={flower} alt="flower" className="flower" onClick={() => window.open('https://isabisabel.com', '_blank')}/>
                </div>
                <div className="about-popup-buttons">
                  {canShare && (
                    <button
                      className="about-popup-button share-button"
                      onClick={onShareStats}
                    >
                      SHARE STATS
                    </button>
                  )}

                  <button
                    className="about-popup-button reset-button"
                    onClick={() => {setShowResetPopup(true); setOpen(false)}}
                  >
                    RESET
                  </button>

                  <button
                    className="about-popup-button"
                    onClick={() => setOpen(false)}
                  >
                    CLOSE
                  </button>
                </div>
                <div className="about-popup-small">v0.1</div>
                
              </div>
          </div>
        </div>
      )}
    </>
  );
}
