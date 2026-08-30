import React, { useState } from "react";
import { api } from "../api.js";

export default function Login({ onLoggedIn }) {
  const [id, setId] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const state = await api.login(id.trim(), pin.trim());
      onLoggedIn(state);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login">
      <div className="login__card">
        <div className="login__mark">VMC-04 &middot; Control Station</div>
        <h1 className="login__title">Power On</h1>
        <p className="login__sub">Sign in to begin the startup checklist.</p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="op-id">Operator ID</label>
            <input
              id="op-id"
              autoComplete="username"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="OP-204"
              autoFocus
            />
          </div>
          <div className="field">
            <label htmlFor="op-pin">PIN</label>
            <input
              id="op-pin"
              type="password"
              inputMode="numeric"
              autoComplete="current-password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
            />
          </div>

          {error && <div className="login__error">{error}</div>}

          <button type="submit" className="btn btn--primary" style={{ width: "100%" }} disabled={busy}>
            {busy ? "Checking…" : "Power On"}
          </button>
        </form>

        <div className="login__hint">
          Demo login &mdash; Operator ID <strong>OP-204</strong>, PIN <strong>4471</strong>
        </div>
      </div>
    </div>
  );
}
