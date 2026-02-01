import { getRarityData } from "./Util";
import Timer from "./Timer";
import { DitherShader } from "./dither-shader";
export default function Event(props) {
  var { event, setCurrentEvent, isBanner, rollForEvent } = props;
  var n = event.n;

  var digits =
    n == 100 ? [1, 0, 0] : n > 9 ? [Math.floor(n / 10), n % 10] : [n];
  var data = getRarityData(n);

  const markEventAsSeen = () => {
    var newEvent = { ...event };
    newEvent.isNew = false;
    setCurrentEvent(newEvent);
  };

  return (
    <div
      className={
        "event-outer dither-bg " + (isBanner ? "event-banner" : "event-in-menu")
      }
    >
      <div className="title">{isBanner ? "NEW EVENT" : "EVENT"}</div>
      <div className="event-inner">
        <div
          className="event-inner-inner"
          style={{
            background: data.event_banner_bg,
          }}
        >
          <div className="event-bg-container">
            <DitherShader
              src={data.bg_path}
              gridSize={2}
              ditherMode="bayer"
              colorMode={data.color_mode}
              primaryColor={data.primary_color}
              secondaryColor={data.secondary_color}
              threshold={data.threshold}
              customPalette={data.custom_palette}
              className={"splash-bg-event " + data.bg_type + "-event"}
              objectFit="contain"
            />
          </div>
          <div className={"event-big-num event-big-num-" + n}>
            {digits.map((digit, i) => {
              return (
                <div
                  id={"event-big-num-" + i}
                  key={"event-big-num-" + i}
                  style={{
                    color: data.font_color,
                  }}
                >
                  {digit}
                </div>
              );
            })}
          </div>
          <div className="event-info">
            <div className="event-info-text">
              <b>Chance Up!</b>
            </div>
            <div className="event-info-text">+{event.addedChance}% to roll</div>
            <div className="event-info-text">
              Ends in{" "}
              <Timer
                endTime={event.endTime}
                onTimerEnd={() => setCurrentEvent(null)}
              />
            </div>
            {isBanner ? (
              <button className="event-button" onClick={markEventAsSeen}>
                OK
              </button>
            ) : (
              <button className="event-button" onClick={rollForEvent}>
                Roll (2&hearts;&#xfe0e;)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
