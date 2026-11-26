import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, test } from "node:test";

const cli = (...args: string[]) =>
  spawnSync(process.execPath, ["--import", "tsx", "src/index.ts", ...args], { encoding: "utf8" });

describe("cli", () => {
  test("rejects an unknown option instead of printing JSON", () => {
    const r = cli(".", "--sumary");
    assert.equal(r.status, 2);
    assert.equal(r.stdout, "");
    assert.match(r.stderr, /unknown option --sumary/);
  });

  test("rejects a path that is not a directory", () => {
    const r = cli("package.json");
    assert.equal(r.status, 2);
    assert.match(r.stderr, /not a directory/);
  });

  test("--summary prints one line", () => {
    const r = cli(".", "--summary");
    assert.equal(r.status, 0);
    assert.match(r.stdout, /^agent-friendly: [\d.]+ \((high|mid|low)\) · best: .+\n$/);
  });

  test("-h prints usage to stdout and exits 0", () => {
    const r = cli("-h");
    assert.equal(r.status, 0);
    assert.match(r.stdout, /^Usage: /);
  });

  test("rejects more than one path instead of scoring the first", () => {
    const r = cli(".", "src");
    assert.equal(r.status, 2);
    assert.equal(r.stdout, "");
    assert.match(r.stderr, /expected one path, got 2/);
  });

  test("prints JSON by default, with improvements and warnings", () => {
    const r = cli(".");
    assert.equal(r.status, 0);
    const out = JSON.parse(r.stdout);
    assert.equal(typeof out.overall, "number");
    assert.ok(Array.isArray(out.topImprovements));
    assert.deepEqual(out.warnings, []);
  });

  test("warns when the path has no project marker", () => {
    const dir = mkdtempSync(join(tmpdir(), "agent-friendly-skill-"));
    try {
      const json = cli(dir);
      assert.equal(json.status, 0);
      assert.match(JSON.parse(json.stdout).warnings[0], /doesn't look like a project root/);

      const summary = cli(dir, "--summary");
      assert.equal(summary.status, 0);
      assert.match(summary.stderr, /doesn't look like a project root/);
      assert.match(summary.stdout, /^agent-friendly: /);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
