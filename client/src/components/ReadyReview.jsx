import React from "react";

function Group({ title, rows }) {
  return (
    <div className="review-group">
      <div className="review-group__title">{title}</div>
      {rows.map((r) => (
        <div className="review-row" key={r.key}>
          <span className="review-row__check">✓</span>
          <span className="review-row__label">{r.label}</span>
          {r.detail && <span className="review-row__detail">{r.detail}</span>}
        </div>
      ))}
    </div>
  );
}

export default function ReadyReview({ state }) {
  const allConfirmed =
    state.machineChecks.every((i) => i.confirmed) &&
    state.tools.every((i) => i.confirmed) &&
    state.workpiece.every((i) => i.confirmed);

  return (
    <div className="stage">
      <div className="stage__eyebrow">Stage 4 of 5</div>
      <h1 className="stage__title">Ready Review</h1>
      <p className="stage__hint">
        Completed machine, tooling and workpiece checklist for {state.job.operation}.
      </p>

      {allConfirmed && (
        <div className="ready-banner">
          <span>●</span> Machine ready — all checks complete
        </div>
      )}

      <Group
        title="Machine checks"
        rows={state.machineChecks.map((i) => ({ key: i.id, label: i.label }))}
      />
      <Group
        title="Required tools"
        rows={state.tools.map((i) => ({
          key: i.id,
          label: `${i.id} — ${i.type}`,
          detail: i.programRev,
        }))}
      />
      <Group
        title="Workpiece setup"
        rows={state.workpiece.map((i) => ({ key: i.id, label: i.label, detail: i.detail }))}
      />
    </div>
  );
}
