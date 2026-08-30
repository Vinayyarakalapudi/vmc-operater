import React, { useEffect, useState, useCallback } from "react";
import { api } from "./api.js";
import Login from "./components/Login.jsx";
import StageRail from "./components/StageRail.jsx";
import ChecklistStage from "./components/ChecklistStage.jsx";
import ReadyReview from "./components/ReadyReview.jsx";
import Operation from "./components/Operation.jsx";

const STAGE_META = {
  MACHINE_CHECKS: {
    eyebrow: "Stage 1 of 5",
    title: "Machine Checks",
    hint: "Confirm each machine check before loading tools.",
    group: "machineChecks",
    actionLabel: "Confirm Check",
  },
  TOOLS: {
    eyebrow: "Stage 2 of 5",
    title: "Required Tools",
    hint: "Insert and confirm each tool required for this operation.",
    group: "tools",
    actionLabel: "Confirm Tool",
  },
  WORKPIECE: {
    eyebrow: "Stage 3 of 5",
    title: "Workpiece Setup",
    hint: "Arrange and clamp the workpiece, then confirm each item.",
    group: "workpiece",
    actionLabel: "Confirm Item",
  },
};

export default function App() {
  const [state, setState] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const s = await api.getState();
      setState(s);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function runAction(fn) {
    setBusy(true);
    setError("");
    try {
      const s = await fn();
      setState(s);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <div className="loading-screen">Connecting to VMC-04…</div>;
  }
  if (error && !state) {
    return <div className="error-screen">Could not reach the HMI server: {error}</div>;
  }
  if (!state) return null;

  if (!state.operator.loggedIn || state.stage === "POWER_ON") {
    return <Login onLoggedIn={setState} />;
  }

  const meta = STAGE_META[state.stage];
  const items = meta ? state[meta.group] : [];
  const stageComplete = meta ? items.every((i) => i.confirmed) : true;
  const confirmedCount = meta ? items.filter((i) => i.confirmed).length : 0;

  return (
    <div className="hmi">
      <StageRail stage={state.stage} operationStatus={state.operationStatus} />

      <div className="main">
        <header className="topbar">
          <div className="topbar__job">
            <span className="topbar__op">{state.job.operation}</span>
            <span className="topbar__meta">
              {state.job.partNumber} · QTY {state.job.quantity} · {state.job.material} ·{" "}
              {state.job.drawingRev} · PRG {state.job.program} · OFS {state.job.workOffset}
            </span>
          </div>
          <div className="topbar__right">
            <span className="operator-chip">{state.operator.id}</span>
            <span className="status-chip stage">{state.stage.replace("_", " ")}</span>
          </div>
        </header>

        <div className="stage-wrap">
          {meta && (
            <ChecklistStage
              eyebrow={meta.eyebrow}
              title={meta.title}
              hint={meta.hint}
              items={items}
              actionLabel={meta.actionLabel}
              renderDetail={
                state.stage === "TOOLS"
                  ? (item) => `Program ${item.programRev}`
                  : state.stage === "WORKPIECE"
                  ? (item) => item.detail
                  : undefined
              }
              onConfirm={(id) => runAction(() => api.confirm(meta.group, id))}
            />
          )}

          {state.stage === "READY_REVIEW" && <ReadyReview state={state} />}

          {state.stage === "OPERATION" && (
            <Operation
              state={state}
              busy={busy}
              onStart={() => runAction(api.start)}
              onStop={() => runAction(api.stop)}
            />
          )}
        </div>

        {meta && (
          <div className="actionbar">
            <span className="actionbar__progress">
              {confirmedCount}/{items.length} confirmed
            </span>
            <button
              className="btn btn--primary"
              disabled={!stageComplete || busy}
              onClick={() => runAction(api.advance)}
            >
              Next
            </button>
          </div>
        )}

        {state.stage === "READY_REVIEW" && (
          <div className="actionbar">
            <button className="btn btn--ghost" onClick={() => runAction(api.reset)} disabled={busy}>
              Reset demo
            </button>
            <button className="btn btn--primary" onClick={() => runAction(api.advance)} disabled={busy}>
              Proceed to Operation
            </button>
          </div>
        )}

        {state.stage === "OPERATION" && (
          <div className="actionbar">
            <button className="btn btn--ghost" onClick={() => runAction(api.reset)} disabled={busy}>
              Reset demo
            </button>
            <span className="actionbar__progress">{error}</span>
          </div>
        )}

        {error && state.stage !== "OPERATION" && (
          <div className="actionbar" style={{ borderTop: "none", paddingTop: 0 }}>
            <span className="actionbar__progress" style={{ color: "var(--red)" }}>
              {error}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
