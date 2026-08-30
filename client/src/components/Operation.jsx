import React from "react";

const COPY = {
  READY: { word: "READY", sub: "All arrangements complete. Start when ready." },
  RUNNING: { word: "RUNNING", sub: "Simulated operation in progress." },
  STOPPED: { word: "STOPPED", sub: "Operation stopped. Stage is preserved." },
};

export default function Operation({ state, onStart, onStop, busy }) {
  const status = state.operationStatus;
  const copy = COPY[status];

  return (
    <div className="stage">
      <div className="stage__eyebrow">Stage 5 of 5</div>
      <h1 className="stage__title">Operation</h1>
      <p className="stage__hint">{state.job.operation}</p>

      <div className="op-panel">
        <div className={`op-ring ${status === "RUNNING" ? "spin" : ""}`}>
          {state.job.partNumber}
        </div>
        <div className={`op-status status-${status.toLowerCase()}`}>{copy.word}</div>
        <div className="op-sub">{copy.sub}</div>

        <div className="op-actions">
          {status !== "RUNNING" ? (
            <button className="btn btn--go" disabled={busy} onClick={onStart}>
              {status === "STOPPED" ? "Restart Operation" : "Start Operation"}
            </button>
          ) : (
            <button className="btn btn--stop" disabled={busy} onClick={onStop}>
              Stop Operation
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
