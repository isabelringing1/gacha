import { useEffect } from "react";
import Event from "./Event";
import { playSfx } from "./sfx";

export default function EventBanner(props) {
  var { event, setCurrentEvent } = props;

  useEffect(() => {
    playSfx("./event.mp3");
  }, []);

  return (
    <div className="event-banner-container">
      <Event event={event} setCurrentEvent={setCurrentEvent} isBanner={true} />
    </div>
  );
}
