import { useState } from "react";
import flower from "/flower.png";

export default function About(props) {
  var { showResetPopup, setShowResetPopup } = props;
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="about-button"
        onClick={() => setOpen(true)}
        aria-label="About"
      >
        i
      </button>
      {open && (
        <div className="win-popup-overlay" onClick={() => setOpen(false)}>
          <div
            className="win-popup dither-bg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="title">ABOUT</div>
            <div className="win-popup-body">
              <div className="win-popup-buttons">
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
                <div className="about-popup-small">v 0.1</div>
                
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
