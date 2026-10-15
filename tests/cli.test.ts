import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
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
});
