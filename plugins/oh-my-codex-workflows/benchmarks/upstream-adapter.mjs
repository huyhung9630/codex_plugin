import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const workspace = path.resolve(root, "..", "..");
const sourceBenchmarksDir = path.join(workspace, "_source", "oh-my-claudecode", "benchmarks");
const agentsDir = path.join(root, "agents");

const suites = {
  "code-reviewer": {
    sourceSuite: "code-reviewer",
    role: "code-reviewer",
    userMessage(fixture) {
      return `Review the following code for quality, security, and correctness issues:\n\n${fixture.content}`;
    },
  },
  debugger: {
    sourceSuite: "debugger",
    role: "debugger",
    userMessage(fixture) {
      return `Diagnose the following bug and recommend fixes:\n\n${fixture.content}`;
    },
  },
  executor: {
    sourceSuite: "executor",
    role: "executor",
    userMessage(fixture) {
      return `Implement the following task. Describe your approach, the files you would modify, and the changes you would make:\n\n${fixture.content}`;
    },
  },
  "harsh-critic": {
    sourceSuite: "harsh-critic",
    role: "critic",
    userMessage(fixture) {
      return `Review the following work critically and identify missing risks, weak assumptions, and concrete fixes:\n\n${fixture.content}`;
    },
  },
};

function parseArgs() {
  const result = {
    suite: "all",
    fixture: null,
    exportPrompts: false,
    outputDir: path.join(root, "benchmarks", "upstream-adapter-output"),
    json: false,
  };

  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--suite") result.suite = args[++i] ?? "all";
    else if (arg === "--fixture") result.fixture = args[++i] ?? null;
    else if (arg === "--export-prompts") result.exportPrompts = true;
    else if (arg === "--output-dir") result.outputDir = path.resolve(args[++i] ?? result.outputDir);
    else if (arg === "--json") result.json = true;
    else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (result.suite !== "all" && !suites[result.suite]) {
    throw new Error(`Unknown suite '${result.suite}'. Available: all, ${Object.keys(suites).join(", ")}`);
  }

  return result;
}

function printHelp() {
  console.log(`Usage:
  node .\\plugins\\oh-my-codex-workflows\\benchmarks\\upstream-adapter.mjs [options]

Options:
  --suite <name>       all|code-reviewer|debugger|executor|harsh-critic
  --fixture <id>       Export or validate one fixture id only
  --export-prompts     Write Codex prompt artifacts for manual/model runs
  --output-dir <path>  Output directory for exported prompts
  --json               Emit machine-readable summary
`);
}

function existsDir(dir) {
  return fs.existsSync(dir) && fs.statSync(dir).isDirectory();
}

function listFilesRecursive(dir) {
  if (!existsDir(dir)) return [];
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...listFilesRecursive(full));
    else if (entry.isFile()) files.push(full);
  }
  return files.sort();
}

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function stripFrontmatter(markdown) {
  const match = markdown.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n([\s\S]*)$/);
  return match ? match[1].trim() : markdown.trim();
}

function relativeToWorkspace(file) {
  return path.relative(workspace, file).replaceAll(path.sep, "/");
}

function loadRolePrompt(role) {
  const file = path.join(agentsDir, `${role}.md`);
  if (!fs.existsSync(file)) throw new Error(`Missing Codex role prompt: ${relativeToWorkspace(file)}`);
  return {
    path: file,
    body: stripFrontmatter(read(file)),
  };
}

function loadFixtures(sourceSuite, fixtureFilter) {
  const suiteDir = path.join(sourceBenchmarksDir, sourceSuite);
  const fixturesDir = path.join(suiteDir, "fixtures");
  const groundTruthDir = path.join(suiteDir, "ground-truth");
  if (!existsDir(fixturesDir)) throw new Error(`Missing upstream fixtures: ${relativeToWorkspace(fixturesDir)}`);

  return listFilesRecursive(fixturesDir)
    .filter((file) => /\.(md|ts)$/.test(file))
    .map((file) => {
      const id = path.basename(file).replace(/\.(md|ts)$/, "");
      const groundTruthPath = path.join(groundTruthDir, `${id}.json`);
      return {
        id,
        domain: path.basename(path.dirname(file)),
        path: file,
        content: read(file),
        groundTruthPath,
        hasGroundTruth: fs.existsSync(groundTruthPath),
      };
    })
    .filter((fixture) => fixtureFilter === null || fixture.id === fixtureFilter)
    .sort((a, b) => a.id.localeCompare(b.id));
}

function renderPromptArtifact({ suiteName, role, rolePromptPath, systemPrompt, fixture, userMessage }) {
  const groundTruthLine = fixture.hasGroundTruth
    ? `- Ground truth: ${relativeToWorkspace(fixture.groundTruthPath)}`
    : "- Ground truth: missing";

  return `# Upstream Benchmark Prompt

- Suite: ${suiteName}
- Codex role: ${role}
- Source fixture: ${relativeToWorkspace(fixture.path)}
${groundTruthLine}
- Role prompt: ${relativeToWorkspace(rolePromptPath)}

## Instructions

Run the Codex role against the user task below. Return findings in a structured
review/debug/implementation format so the result can be compared with the
upstream ground truth.

## System Prompt

${systemPrompt}

## User Task

${userMessage}
`;
}

function runSuite(suiteName, config, args) {
  const rolePrompt = loadRolePrompt(config.role);
  const fixtures = loadFixtures(config.sourceSuite, args.fixture);
  const missingGroundTruth = fixtures.filter((fixture) => !fixture.hasGroundTruth);

  const suiteResult = {
    suite: suiteName,
    sourceSuite: config.sourceSuite,
    role: config.role,
    rolePrompt: relativeToWorkspace(rolePrompt.path),
    fixtures: fixtures.length,
    groundTruth: fixtures.length - missingGroundTruth.length,
    missingGroundTruth: missingGroundTruth.map((fixture) => fixture.id),
    exportedPrompts: [],
  };

  if (fixtures.length === 0) {
    suiteResult.error = args.fixture
      ? `Fixture '${args.fixture}' not found`
      : "No fixtures found";
    return suiteResult;
  }

  if (args.exportPrompts) {
    for (const fixture of fixtures) {
      const outDir = path.join(args.outputDir, suiteName);
      fs.mkdirSync(outDir, { recursive: true });
      const outPath = path.join(outDir, `${fixture.id}.md`);
      fs.writeFileSync(
        outPath,
        renderPromptArtifact({
          suiteName,
          role: config.role,
          rolePromptPath: rolePrompt.path,
          systemPrompt: rolePrompt.body,
          fixture,
          userMessage: config.userMessage(fixture),
        }),
        "utf8",
      );
      suiteResult.exportedPrompts.push(relativeToWorkspace(outPath));
    }
  }

  return suiteResult;
}

function main() {
  const args = parseArgs();
  const selectedSuites = args.suite === "all" ? Object.keys(suites) : [args.suite];
  const startedAt = Date.now();

  const results = selectedSuites.map((suiteName) => runSuite(suiteName, suites[suiteName], args));
  const totals = results.reduce(
    (acc, result) => {
      acc.suites += result.error ? 0 : 1;
      acc.fixtures += result.fixtures ?? 0;
      acc.groundTruth += result.groundTruth ?? 0;
      acc.exportedPrompts += result.exportedPrompts?.length ?? 0;
      acc.errors += result.error ? 1 : 0;
      return acc;
    },
    { suites: 0, fixtures: 0, groundTruth: 0, exportedPrompts: 0, errors: 0 },
  );

  const summary = {
    benchmark: "oh-my-codex-upstream-benchmark-adapter",
    status: totals.errors === 0 && totals.fixtures > 0 ? "pass" : "fail",
    elapsedMs: Date.now() - startedAt,
    source: relativeToWorkspace(sourceBenchmarksDir),
    outputDir: args.exportPrompts ? relativeToWorkspace(args.outputDir) : null,
    totals,
    suites: results,
    controls: {
      apiKeysRequired: false,
      modelCalls: false,
      dependencies: "Node built-ins only",
      usesUpstreamAssets: true,
    },
  };

  if (args.exportPrompts) {
    fs.mkdirSync(args.outputDir, { recursive: true });
    fs.writeFileSync(path.join(args.outputDir, "manifest.json"), JSON.stringify(summary, null, 2), "utf8");
  }

  if (args.json) {
    console.log(JSON.stringify(summary, null, 2));
  } else {
    console.log(`Benchmark: ${summary.benchmark}`);
    console.log(`Status: ${summary.status}`);
    console.log(`Source: ${summary.source}`);
    console.log(`Suites: ${totals.suites}/${selectedSuites.length}`);
    console.log(`Fixtures: ${totals.fixtures}`);
    console.log(`Ground truth: ${totals.groundTruth}/${totals.fixtures}`);
    if (args.exportPrompts) console.log(`Exported prompts: ${totals.exportedPrompts} -> ${summary.outputDir}`);
    console.log("");
    for (const result of results) {
      const status = result.error ? `fail: ${result.error}` : "pass";
      console.log(`- ${result.suite}: ${status}`);
      console.log(`  - role: ${result.role}`);
      console.log(`  - fixtures: ${result.fixtures}`);
      console.log(`  - ground truth: ${result.groundTruth}/${result.fixtures}`);
      if (result.missingGroundTruth.length > 0) {
        console.log(`  - missing ground truth: ${result.missingGroundTruth.join(", ")}`);
      }
    }
  }

  if (summary.status !== "pass") process.exitCode = 1;
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
