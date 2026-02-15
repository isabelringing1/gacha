import { getRarity } from "./Util";

export default function History(props) {
  var { rolls } = props;
  return (
    <div className="history">
      {rolls.map((r, i) => {
        return (
          <span
            className={"history-num " + getRarity(r)}
            key={"history-num-" + i}
          >
            {r}
          </span>
        );
      })}
    </div>
  );
}
