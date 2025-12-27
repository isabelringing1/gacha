import { getRarity } from "./Util";

const Debug = (props) => {
  const { rolls, numbers } = props;

  return (
    <div id="debug">
      {rolls.map((roll, i) => (
        <div key={"debug-roll-" + i}>
          Rolled {roll}, {getRarity(roll)} ({numbers[roll]} times)
        </div>
      ))}
      <div>
        <input></input>
        <button>Set</button>
      </div>
    </div>
  );
};

export default Debug;
