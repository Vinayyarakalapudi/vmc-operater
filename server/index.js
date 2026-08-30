const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");

const PORT = process.env.PORT || 4000;
const DATA_DIR = path.join(__dirname, "data");
const SEED_PATH = path.join(DATA_DIR, "state.seed.json");
const STATE_PATH = path.join(DATA_DIR, "state.json");
const CLIENT_DIST = path.join(__dirname, "..", "client", "dist");

const STAGES = [
  "POWER_ON",
  "MACHINE_CHECKS",
  "TOOLS",
  "WORKPIECE",
  "READY_REVIEW",
  "OPERATION",
];
const STAGE_GROUP = {
  MACHINE_CHECKS: "machineChecks",
  TOOLS: "tools",
  WORKPIECE: "workpiece",
};

function loadSeed() {
  return JSON.parse(fs.readFileSync(SEED_PATH, "utf-8"));
}

function loadState() {
  if (!fs.existsSync(STATE_PATH)) {
    const seed = loadSeed();
    fs.writeFileSync(STATE_PATH, JSON.stringify(seed, null, 2));
    return seed;
  }
  try {
    return JSON.parse(fs.readFileSync(STATE_PATH, "utf-8"));
  } catch {
    const seed = loadSeed();
    fs.writeFileSync(STATE_PATH, JSON.stringify(seed, null, 2));
    return seed;
  }
}

function saveState(state) {
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}

function stageComplete(state, stage) {
  const group = STAGE_GROUP[stage];
  if (!group) return true; // POWER_ON / READY_REVIEW / OPERATION have no item list of their own
  return state[group].every((item) => item.confirmed);
}

function publicState(state) {
  // never leak the PIN to the client
  const { operator, ...rest } = state;
  return { ...rest, operator: { id: operator.id, name: operator.name, loggedIn: operator.loggedIn } };
}

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/state", (req, res) => {
  res.json(publicState(loadState()));
});

app.post("/api/login", (req, res) => {
  const { id, pin } = req.body || {};
  const state = loadState();
  if (id !== state.operator.id || pin !== state.operator.pin) {
    return res.status(401).json({ error: "Operator ID or PIN not recognized." });
  }
  state.operator.loggedIn = true;
  state.poweredOn = true;
  state.stage = "MACHINE_CHECKS";
  saveState(state);
  res.json(publicState(state));
});

app.post("/api/confirm", (req, res) => {
  const { group, id } = req.body || {};
  const state = loadState();
  const expectedGroup = STAGE_GROUP[state.stage];
  if (group !== expectedGroup) {
    return res.status(409).json({ error: "That item does not belong to the current stage." });
  }
  const item = state[group].find((i) => i.id === id);
  if (!item) return res.status(404).json({ error: "Item not found." });
  item.confirmed = true;
  saveState(state);
  res.json(publicState(state));
});

app.post("/api/advance", (req, res) => {
  const state = loadState();
  const idx = STAGES.indexOf(state.stage);
  if (idx === -1 || idx === STAGES.length - 1) {
    return res.status(409).json({ error: "No further stage to advance to." });
  }
  if (!stageComplete(state, state.stage)) {
    return res.status(409).json({ error: "Confirm every item on this stage first." });
  }
  state.stage = STAGES[idx + 1];
  if (state.stage === "OPERATION") {
    state.operationStatus = "READY";
  }
  saveState(state);
  res.json(publicState(state));
});

app.post("/api/start", (req, res) => {
  const state = loadState();
  if (state.stage !== "OPERATION" || state.operationStatus === "RUNNING") {
    return res.status(409).json({ error: "Operation can only start once every arrangement is complete." });
  }
  state.operationStatus = "RUNNING";
  saveState(state);
  res.json(publicState(state));
});

app.post("/api/stop", (req, res) => {
  const state = loadState();
  if (state.operationStatus !== "RUNNING") {
    return res.status(409).json({ error: "Operation is not running." });
  }
  state.operationStatus = "STOPPED";
  // stage is preserved, per spec
  saveState(state);
  res.json(publicState(state));
});

app.post("/api/reset", (req, res) => {
  const seed = loadSeed();
  saveState(seed);
  res.json(publicState(seed));
});

// Serve the built client in production, if present
if (fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));
  app.get("*", (req, res) => {
    res.sendFile(path.join(CLIENT_DIST, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`VMC Operator HMI API listening on http://localhost:${PORT}`);
});
