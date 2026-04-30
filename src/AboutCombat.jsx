import { useState } from "react";

export default function AboutCombat() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="about-combat-button"
        onClick={() => setOpen(true)}
        aria-label="About combat"
      >
        i
      </button>
      {open && (
        <div className="win-popup-overlay" onClick={() => setOpen(false)}>
          <div
            className="win-popup dither-bg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="title">BATTLE TIPS</div>
            <div className="win-popup-body">
              <div className="win-popup-text win-popup-text-top">
                Winning is all about picking the right team.
              </div><br />
              <div className="win-popup-text">
                Numbers that are <b>factors</b> of the enemy are buffed.
              </div><br />
              <div className="win-popup-text">
                Stuck? Keep rolling numbers to unlock new abilities.
              </div>
              <div className="win-popup-buttons">
                <button
                  className="win-popup-button"
                  onClick={() => setOpen(false)}
                >
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
