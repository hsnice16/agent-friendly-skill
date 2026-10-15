import { strict as assert } from "node:assert";
import { test } from "node:test";

import { parseArgs } from "../src/args";

test("parseArgs treats short flags as flags, so -h reaches the help check", () => {
  const { flags, positional } = parseArgs(["-h"]);
  assert.ok(flags.has("-h"));
  assert.deepEqual(positional, []);
});

test("parseArgs separates long flags from the path", () => {
  const { flags, positional } = parseArgs(["./repo", "--summary", "--json"]);
  assert.deepEqual([...flags].sort(), ["--json", "--summary"]);
  assert.deepEqual(positional, ["./repo"]);
});
