import Event from "./Event";

export default function EventBanner(props) {
  var { event, setCurrentEvent } = props;
  return (
    <div className="event-banner-container">
      <Event event={event} setCurrentEvent={setCurrentEvent} isBanner={true} />
    </div>
  );
}
