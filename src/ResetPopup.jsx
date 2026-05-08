export default function ResetPopup({ setShowResetPopup }) {
  function onYes() {
    localStorage.clear();
    window.location.reload();
  }

  function onNo() {
    setShowResetPopup(false);
  }

  return (
    <div className="win-popup-overlay reset-popup-overlay" onClick={onNo}>
      <div
        className="win-popup dither-bg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="title">ARE YOU SURE?</div>
        <div className="win-popup-body">
          <div className="win-popup-text win-popup-text-top">
            You will lose all progress.
          </div>
          <div className="win-popup-buttons reset-popup-buttons-row">
          <button className="win-popup-button" onClick={onNo}>
              NEVER MIND
            </button>
            <button className="win-popup-button" onClick={onYes}>
              YES
            </button>
            
          </div>
        </div>
      </div>
    </div>
  );
}
