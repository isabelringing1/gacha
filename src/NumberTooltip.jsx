import { useState } from "react";

export default function NumberTooltip(props) {
  const { n, numTimesRolled } = props;
  var cn = "number-tooltip";
  if (n <= 20) {
    cn += " top";
  }

  return (
    <div className={cn} id={"number-tooltip-" + n}>
      Rolled {numTimesRolled ?? "0"}/{n} times
    </div>
  );
}
