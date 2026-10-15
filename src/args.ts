export type ParsedArgs = { flags: Set<string>; positional: string[] };

// One dash, not two: `-h` must reach the help check, not be scored as a path.
export function parseArgs(args: string[]): ParsedArgs {
  const flags = new Set<string>();
  const positional: string[] = [];

  for (const a of args) {
    if (a.startsWith("-")) {
      flags.add(a);
    } else {
      positional.push(a);
    }
  }

  return { flags, positional };
}
