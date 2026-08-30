import React from "react";

const STOPS = [
  { key: "MACHINE_CHECKS", label: "CHK" },
  { key: "TOOLS", label: "TL" },
  { key: "WORKPIECE", label: "WP" },
  { key: "READY_REVIEW", label: "RDY" },
  { key: "OPERATION", label: "OP" },
];

export default function StageRail({ stage, operationStatus }) {
  const activeIdx = STOPS.findIndex((s) => s.key === stage);
  const fillPct = activeIdx <= 0 ? 0 : (activeIdx / (STOPS.length - 1)) * 100;

  const beaconState =
    stage === "OPERATION" && operationStatus === "RUNNING"
      ? "green"
      : stage === "OPERATION" && operationStatus === "STOPPED"
      ? "red"
      : "amber";

  return (
    <div className="rail" aria-hidden="true">
      <div className="rail__beacon">
        <span className={`beacon-lamp ${beaconState === "red" ? "on-red" : ""}`} />
        <span className={`beacon-lamp ${beaconState === "amber" ? "on-amber" : ""}`} />
        <span className={`beacon-lamp ${beaconState === "green" ? "on-green" : ""}`} />
      </div>

      <div className="rail__track">
        <div className="rail__fill" style={{ height: `${fillPct}%` }} />
        {STOPS.map((s, i) => (
          <div
            key={s.key}
            className={
              "rail__stop " +
              (i < activeIdx ? "is-done" : i === activeIdx ? "is-active" : "")
            }
            style={{ top: `${(i / (STOPS.length - 1)) * 100}%` }}
          />
        ))}
      </div>

      <div className="rail__labels">STAGE&nbsp;&nbsp;{Math.max(activeIdx, 0) + 1}/5</div>
    </div>
  );
}
