import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";

const workspace = process.env.OMC_WORKSPACE
  ? path.resolve(process.env.OMC_WORKSPACE)
  : process.cwd();
const runsRoot = path.join(workspace, ".codex", "omc", "runs");

const modeStages = {
  team: ["team-plan", "team-prd", "team-exec", "team-verify", "team-fix"],
  ralph: ["ralph-prd", "ralph-story", "ralph-verify", "ralph-deslop", "ralph-regression", "ralph-close"],
  trace: ["trace-observe", "trace-lanes", "trace-rebuttal", "trace-synthesis"],
  ultrawork: ["ultrawork-plan", "ultrawork-exec", "ultrawork-verify"],
};

const teamTransitions = {
  "team-plan": new Set(["team-prd", "team-exec"]),
  "team-prd": new Set(["team-exec"]),
  "team-exec": new Set(["team-verify"]),
  "team-verify": new Set(["team-fix"]),
  "team-fix": new Set(["team-exec", "team-verify"]),
};

function usage(exitCode = 0) {
  const text = `
OMC Orchestrator V1

Usage:
  node omc-orchestrator.mjs start --mode <team|ralph|trace|ultrawork> --task "<task>" [--run <id>] [--worker-budget <n>]
  node omc-orchestrator.mjs packet --run <id> --lane <id> --role <role> --scope "<paths>" --subject "<work>" [--verification "<check>"] [--blocked-by "<lane,lane>"]
  node omc-orchestrator.mjs agent --run <id> --lane <id> --role <role> --scope "<paths>" [--status completed] [--changed "<paths>"] [--verification "<evidence>"] [--overwrite]
  node omc-orchestrator.mjs handoff --run <id> [--stage <stage>] [--next <stage>] --decided "<text>" [--risks "<text>"] [--remaining "<text>"]
  node omc-orchestrator.mjs transition --run <id> --stage <stage> [--force]
  node omc-orchestrator.mjs verify --run <id> --name <name> (--command "<command>" | --evidence "<text>") [--fail]
  node omc-orchestrator.mjs fix --run <id> --reason "<why>"
  node omc-orchestrator.mjs status --run <id> [--json]
  node omc-orchestrator.mjs close --run <id> [--status complete|blocked|failed] [--reason "<text>"]
`;
  console.log(text.trim());
  process.exit(exitCode);
}

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (!item.startsWith("--")) {
      out._.push(item);
      continue;
    }
    const key = item.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      out[key] = true;
      continue;
    }
    out[key] = next;
    i += 1;
  }
  return out;
}

function now() {
  return new Date().toISOString();
}

function slug(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64) || "run";
}

function runDir(runId) {
  return path.join(runsRoot, runId);
}

function manifestPath(runId) {
  return path.join(runDir(runId), "manifest.json");
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function fail(message, details = []) {
  console.error(`ERROR: ${message}`);
  for (const detail of details.filter(Boolean)) console.error(`- ${detail}`);
  process.exit(1);
}

function requireArg(args, key) {
  const value = args[key];
  if (typeof value !== "string" || value.trim() === "") fail(`Missing --${key}`);
  return value.trim();
}

function splitList(value) {
  if (!value || value === true) return [];
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function ensureRunDirs(runId) {
  for (const dir of ["agents", "handoffs", "verification", "logs"]) {
    fs.mkdirSync(path.join(runDir(runId), dir), { recursive: true });
  }
}

function resolveRunFile(runId, relative) {
  const base = path.resolve(runDir(runId));
  const full = path.resolve(base, relative);
  if (full !== base && !full.startsWith(`${base}${path.sep}`)) {
    fail(`Path escapes run directory: ${relative}`);
  }
  return full;
}

function relativeToRun(runId, file) {
  return path.relative(runDir(runId), file).replaceAll(path.sep, "/");
}

function readManifest(runId) {
  const file = manifestPath(runId);
  if (!fs.existsSync(file)) fail(`Run not found: ${runId}`);
  const manifest = readJson(file);
  normalizeManifest(manifest);
  return manifest;
}

function writeManifest(manifest) {
  normalizeManifest(manifest);
  manifest.updated_at = now();
  writeJson(manifestPath(manifest.run_id), manifest);
}

function normalizeManifest(manifest) {
  manifest.schema_version ??= 1;
  manifest.runtime ??= "omc-orchestrator-v1";
  manifest.packets ??= [];
  manifest.workers ??= [];
  manifest.handoffs ??= [];
  manifest.verification ??= [];
  manifest.stage_history ??= [];
  manifest.fix_events ??= [];
  manifest.max_fix_loops ??= 3;
  manifest.fix_loop_count ??= 0;
  manifest.handoffs = manifest.handoffs.map((item) => {
    if (typeof item === "string") {
      const normalized = item.replaceAll("\\", "/");
      const marker = "/handoffs/";
      const stage = normalized.includes(marker)
        ? path.basename(normalized, ".md")
        : path.basename(normalized, ".md");
      const artifact = normalized.includes(".codex/omc/runs/")
        ? normalized.slice(normalized.indexOf("/handoffs/") + 1)
        : normalized;
      return { stage, next_stage: "unknown", artifact, created_at: "unknown" };
    }
    return item;
  });
}

function start(args) {
  const mode = requireArg(args, "mode");
  const task = requireArg(args, "task");
  if (!modeStages[mode]) fail(`Unsupported mode: ${mode}`);

  const stamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
  const runId = args.run ? slug(args.run) : `${stamp}-${mode}-${slug(task)}`;
  const file = manifestPath(runId);
  if (fs.existsSync(file)) fail(`Run already exists: ${runId}`);
  ensureRunDirs(runId);

  const manifest = {
    schema_version: 1,
    runtime: "omc-orchestrator-v1",
    run_id: runId,
    mode,
    task,
    status: "active",
    current_stage: modeStages[mode][0],
    allowed_stages: modeStages[mode],
    created_at: now(),
    updated_at: now(),
    requested_worker_budget: args["worker-budget"] ? Number(args["worker-budget"]) : null,
    actual_worker_count: 0,
    max_fix_loops: Number(args["max-fix-loops"] ?? 3),
    fix_loop_count: 0,
    packets: [],
    workers: [],
    handoffs: [],
    verification: [],
    fix_events: [],
    stage_history: [
      {
        stage: modeStages[mode][0],
        entered_at: now(),
        reason: "run started",
      },
    ],
  };

  writeManifest(manifest);
  console.log(`Started ${mode} run ${runId}`);
  console.log(`Manifest: ${path.relative(workspace, file).replaceAll(path.sep, "/")}`);
}

function upsertBy(items, key, value) {
  const index = items.findIndex((item) => item[key] === value[key]);
  if (index >= 0) items[index] = { ...items[index], ...value };
  else items.push(value);
}

function packet(args) {
  const runId = requireArg(args, "run");
  const lane = slug(requireArg(args, "lane"));
  const role = requireArg(args, "role");
  const scope = requireArg(args, "scope");
  const subject = requireArg(args, "subject");
  const manifest = readManifest(runId);
  requireActive(manifest);

  const record = {
    lane,
    role,
    subject,
    owned_paths: splitList(scope).length ? splitList(scope) : [scope],
    blocked_by: splitList(args["blocked-by"]),
    status: args.status ? String(args.status) : "pending",
    artifact: `agents/${lane}.md`,
    verification_expectation: args.verification || "not specified",
    created_at: now(),
  };
  upsertBy(manifest.packets, "lane", record);
  writeManifest(manifest);
  console.log(`Registered packet ${lane}`);
}

function requireActive(manifest) {
  if (manifest.status !== "active") fail(`Run is not active: ${manifest.status}`);
}

function agent(args) {
  const runId = requireArg(args, "run");
  const lane = slug(requireArg(args, "lane"));
  const role = requireArg(args, "role");
  const scope = requireArg(args, "scope");
  const status = args.status ? String(args.status) : "completed";
  const manifest = readManifest(runId);
  requireActive(manifest);

  ensureRunDirs(runId);
  const artifactRel = `agents/${lane}.md`;
  const artifact = resolveRunFile(runId, artifactRel);
  const changed = splitList(args.changed);
  const filesRead = splitList(args.read);
  const verification = args.verification && args.verification !== true ? String(args.verification) : "unavailable";
  const result = args.result && args.result !== true ? String(args.result) : status;
  const blockers = splitList(args.blockers);

  if (!fs.existsSync(artifact) || args.overwrite) {
    const body = [
      `# Agent Artifact: ${lane}`,
      "",
      `- Role: ${role}`,
      `- Context mode: ${args["context-mode"] || "isolated sub-agent context"}`,
      `- Owned scope: ${scope}`,
      `- Status: ${status}`,
      `- Files read: ${filesRead.length ? filesRead.join(", ") : "unavailable"}`,
      `- Files changed: ${changed.length ? changed.join(", ") : "none"}`,
      `- Verification: ${verification}`,
      `- Result: ${result}`,
      `- Blockers: ${blockers.length ? blockers.join(", ") : "none"}`,
      `- Token usage: ${args.tokens || "unavailable"}`,
      `- Latency: ${args.latency || "unavailable"}`,
      "",
    ].join("\n");
    fs.writeFileSync(artifact, body);
    console.log(`Wrote agent artifact ${relativeToRun(runId, artifact)}`);
  } else {
    console.log(`Preserved existing agent artifact ${relativeToRun(runId, artifact)}`);
  }

  const worker = {
    lane,
    role,
    scope,
    context_mode: args["context-mode"] || "isolated",
    status,
    artifact: artifactRel,
    changed_paths: changed,
    verification,
    blockers,
    updated_at: now(),
  };
  upsertBy(manifest.workers, "lane", worker);
  const packetRecord = manifest.packets.find((item) => item.lane === lane);
  if (packetRecord) {
    packetRecord.status = status === "completed" ? "completed" : status;
    packetRecord.updated_at = now();
  }
  manifest.actual_worker_count = manifest.workers.length;
  writeManifest(manifest);
}

function handoff(args) {
  const runId = requireArg(args, "run");
  const manifest = readManifest(runId);
  requireActive(manifest);

  const stage = args.stage ? String(args.stage) : manifest.current_stage;
  const next = args.next ? String(args.next) : "unspecified";
  if (!manifest.allowed_stages.includes(stage)) fail(`Invalid handoff stage: ${stage}`);
  const decided = requireArg(args, "decided");
  ensureRunDirs(runId);
  const handoffRel = `handoffs/${slug(stage)}.md`;
  const handoffFile = resolveRunFile(runId, handoffRel);
  const body = [
    `# Handoff: ${stage} to ${next}`,
    "",
    `- Decided: ${decided}`,
    `- Rejected: ${args.rejected || "none"}`,
    `- Risks: ${args.risks || "none"}`,
    `- Files: ${args.files || "none"}`,
    `- Remaining: ${args.remaining || "none"}`,
    "",
  ].join("\n");
  fs.writeFileSync(handoffFile, body);

  const record = { stage, next_stage: next, artifact: handoffRel, created_at: now() };
  upsertBy(manifest.handoffs, "stage", record);
  writeManifest(manifest);
  console.log(`Wrote handoff ${relativeToRun(runId, handoffFile)}`);
}

function hasHandoff(manifest, stage) {
  return manifest.handoffs.some((item) => {
    if (item.stage !== stage || !item.artifact) return false;
    return fs.existsSync(resolveRunFile(manifest.run_id, item.artifact));
  });
}

function transition(args) {
  const runId = requireArg(args, "run");
  const stage = requireArg(args, "stage");
  const manifest = readManifest(runId);
  requireActive(manifest);
  if (!manifest.allowed_stages.includes(stage)) {
    fail(`Stage '${stage}' is not valid for mode ${manifest.mode}`, manifest.allowed_stages);
  }
  const current = manifest.current_stage;
  if (current === stage) {
    console.log(`Already at stage ${stage}`);
    return;
  }
  if (!args.force && manifest.mode === "team") {
    const validNext = teamTransitions[current]?.has(stage);
    if (!validNext) fail(`Invalid team transition ${current} -> ${stage}. Use --force only for recovery.`);
  }
  if (!args.force && !hasHandoff(manifest, current)) {
    fail(`Missing handoff for current stage '${current}'. Use handoff first or pass --force for recovery.`);
  }
  manifest.current_stage = stage;
  manifest.stage_history.push({ stage, entered_at: now(), reason: args.reason || `transition from ${current}` });
  writeManifest(manifest);
  console.log(`Transitioned ${runId}: ${current} -> ${stage}`);
}

function verify(args) {
  const runId = requireArg(args, "run");
  const name = slug(requireArg(args, "name"));
  const manifest = readManifest(runId);
  requireActive(manifest);
  ensureRunDirs(runId);

  let record;
  if (args.command && args.command !== true) {
    const command = String(args.command);
    const startedAt = now();
    const result = spawnSync(command, {
      cwd: workspace,
      shell: true,
      encoding: "utf8",
      maxBuffer: 10 * 1024 * 1024,
    });
    const logRel = `verification/${name}.log`;
    const logFile = resolveRunFile(runId, logRel);
    fs.writeFileSync(
      logFile,
      [`$ ${command}`, "", "## stdout", result.stdout || "", "## stderr", result.stderr || ""].join("\n"),
    );
    record = {
      name,
      type: "command",
      command,
      exit_code: result.status ?? 1,
      passed: (result.status ?? 1) === 0 && !args.fail,
      log: logRel,
      started_at: startedAt,
      completed_at: now(),
    };
  } else {
    const evidence = requireArg(args, "evidence");
    record = {
      name,
      type: "evidence",
      evidence,
      passed: !args.fail,
      created_at: now(),
    };
  }

  upsertBy(manifest.verification, "name", record);
  writeManifest(manifest);
  console.log(`${record.passed ? "PASS" : "FAIL"} verification ${name}`);
  if (!record.passed) process.exitCode = 1;
}

function fix(args) {
  const runId = requireArg(args, "run");
  const reason = requireArg(args, "reason");
  const manifest = readManifest(runId);
  requireActive(manifest);
  if (manifest.mode !== "team") fail("fix command currently applies to team mode");
  if (manifest.fix_loop_count >= manifest.max_fix_loops) {
    fail(`max_fix_loops exceeded: ${manifest.fix_loop_count}/${manifest.max_fix_loops}`);
  }
  const current = manifest.current_stage;
  manifest.fix_loop_count += 1;
  manifest.current_stage = "team-fix";
  manifest.fix_events.push({ iteration: manifest.fix_loop_count, reason, created_at: now() });
  manifest.stage_history.push({ stage: "team-fix", entered_at: now(), reason: `fix: ${reason}` });
  writeManifest(manifest);
  console.log(`Entered team-fix from ${current}; fix_loop_count=${manifest.fix_loop_count}`);
}

function stageNames(manifest) {
  return manifest.stage_history.map((item) => item.stage);
}

function teamGateDetails(manifest) {
  if (manifest.mode !== "team") return [];
  const stages = new Set(stageNames(manifest));
  const missing = [];
  for (const required of ["team-plan", "team-exec", "team-verify"]) {
    if (!stages.has(required)) missing.push(`missing required stage: ${required}`);
  }
  if (manifest.current_stage !== "team-verify") {
    missing.push(`current_stage must be team-verify for complete closeout, got ${manifest.current_stage}`);
  }
  if (manifest.packets.length === 0) missing.push("missing work packets");
  const incompletePackets = manifest.packets
    .filter((item) => !["completed", "skipped"].includes(String(item.status)))
    .map((item) => `${item.lane}:${item.status}`);
  if (incompletePackets.length) missing.push(`incomplete packets: ${incompletePackets.join(", ")}`);
  for (const stage of ["team-plan", "team-exec"]) {
    if (stages.has(stage) && !hasHandoff(manifest, stage)) missing.push(`missing handoff for ${stage}`);
  }
  if (manifest.fix_loop_count > manifest.max_fix_loops) {
    missing.push(`fix_loop_count exceeds max_fix_loops: ${manifest.fix_loop_count}/${manifest.max_fix_loops}`);
  }
  return missing;
}

function gates(manifest) {
  const runId = manifest.run_id;
  const missingArtifacts = manifest.workers
    .filter((worker) => !worker.artifact || !fs.existsSync(resolveRunFile(runId, worker.artifact)))
    .map((worker) => worker.lane || "(missing lane)");
  const failedWorkers = manifest.workers
    .filter((worker) => ["failed", "blocked", "stale", "partial"].includes(String(worker.status)))
    .map((worker) => `${worker.lane}:${worker.status}`);
  const passedVerification = manifest.verification.filter((item) => item.passed);
  const failedVerification = manifest.verification.filter((item) => !item.passed).map((item) => item.name);
  const hasVerification = passedVerification.length > 0;
  const teamDetails = teamGateDetails(manifest);
  const ok = missingArtifacts.length === 0
    && failedWorkers.length === 0
    && failedVerification.length === 0
    && hasVerification
    && teamDetails.length === 0;

  return {
    ok,
    missingArtifacts,
    failedWorkers,
    failedVerification,
    hasVerification,
    teamDetails,
  };
}

function status(args) {
  const runId = requireArg(args, "run");
  const manifest = readManifest(runId);
  const gate = gates(manifest);
  if (args.json) {
    console.log(JSON.stringify({ manifest, gates: gate }, null, 2));
    return;
  }
  console.log(`${manifest.run_id} [${manifest.mode}] ${manifest.status}`);
  console.log(`Stage: ${manifest.current_stage}`);
  console.log(`Packets: ${manifest.packets.length}`);
  console.log(`Workers: ${manifest.workers.length}`);
  console.log(`Handoffs: ${manifest.handoffs.length}`);
  console.log(`Verification: ${manifest.verification.length}`);
  console.log(`Fix loops: ${manifest.fix_loop_count}/${manifest.max_fix_loops}`);
  console.log(`Closeable as complete: ${gate.ok ? "yes" : "no"}`);
  if (!gate.ok) {
    if (gate.missingArtifacts.length) console.log(`Missing artifacts: ${gate.missingArtifacts.join(", ")}`);
    if (gate.failedWorkers.length) console.log(`Non-passing workers: ${gate.failedWorkers.join(", ")}`);
    if (gate.failedVerification.length) console.log(`Failed verification: ${gate.failedVerification.join(", ")}`);
    if (!gate.hasVerification) console.log("Missing passing verification");
    for (const detail of gate.teamDetails) console.log(detail);
  }
}

function close(args) {
  const runId = requireArg(args, "run");
  const manifest = readManifest(runId);
  requireActive(manifest);
  const finalStatus = args.status ? String(args.status) : "complete";
  if (!["complete", "blocked", "failed"].includes(finalStatus)) fail(`Invalid close status: ${finalStatus}`);
  const gate = gates(manifest);
  if (finalStatus === "complete" && !gate.ok) {
    fail("Completion gates failed", [
      gate.missingArtifacts.length ? `missing artifacts: ${gate.missingArtifacts.join(", ")}` : "",
      gate.failedWorkers.length ? `non-passing workers: ${gate.failedWorkers.join(", ")}` : "",
      gate.failedVerification.length ? `failed verification: ${gate.failedVerification.join(", ")}` : "",
      !gate.hasVerification ? "missing passing verification" : "",
      ...gate.teamDetails,
    ]);
  }

  manifest.status = finalStatus;
  manifest.closed_at = now();
  manifest.close_reason = args.reason || "";
  writeManifest(manifest);
  const closeout = resolveRunFile(runId, "closeout.md");
  fs.writeFileSync(
    closeout,
    [
      `# OMC Closeout: ${runId}`,
      "",
      `- Mode: ${manifest.mode}`,
      `- Status: ${finalStatus}`,
      `- Stage: ${manifest.current_stage}`,
      `- Packets: ${manifest.packets.length}`,
      `- Workers: ${manifest.workers.length}`,
      `- Handoffs: ${manifest.handoffs.length}`,
      `- Verification: ${manifest.verification.length}`,
      `- Fix loops: ${manifest.fix_loop_count}/${manifest.max_fix_loops}`,
      `- Reason: ${manifest.close_reason || "none"}`,
      "",
    ].join("\n"),
  );
  console.log(`Closed ${runId} as ${finalStatus}`);
}

const [command, ...rest] = process.argv.slice(2);
const args = parseArgs(rest);

if (!command || command === "help" || command === "--help") usage(0);

const commands = { start, packet, agent, handoff, transition, verify, fix, status, close };
if (!commands[command]) usage(1);
commands[command](args);
