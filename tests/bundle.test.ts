import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, test } from "node:test";

describe("bundled scorer", () => {
  test("runs when installed in a repo with type: module", () => {
    const host = mkdtempSync(join(tmpdir(), "agent-friendly-skill-"));
    try {
      writeFileSync(join(host, "package.json"), '{"type":"module"}\n');
      cpSync(join(process.cwd(), "skills/agent-friendly/dist"), join(host, "dist"), { recursive: true });

      const r = spawnSync(process.execPath, [join(host, "dist/index.js"), host, "--json"], {
        encoding: "utf8",
      });

      assert.equal(r.status, 0, r.stderr);
      assert.equal(typeof JSON.parse(r.stdout).overall, "number");
    } finally {
      rmSync(host, { recursive: true, force: true });
    }
  });
});
