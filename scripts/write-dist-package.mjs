import { writeFileSync } from "node:fs";

// ncc emits CommonJS; Node would otherwise parse the bundle as ESM inside a host repo with `"type": "module"`.
writeFileSync(new URL("../skills/agent-friendly/dist/package.json", import.meta.url), '{"type":"commonjs"}\n');
