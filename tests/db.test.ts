import { describe, it, expect, beforeAll } from "vitest";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

beforeAll(() => {
  process.env.DB_PATH = join(mkdtempSync(join(tmpdir(), "polls-")), "test.db");
});

describe("db", () => {
  it("creates a poll and lists it, then records a vote", async () => {
    const { createPoll, listPolls, getPoll, voteOnce } = await import("../src/lib/db");
    const id = createPoll("Best stack?", ["Go", "Rust", "Python"]);
    expect(id).toBeGreaterThan(0);
    const polls = listPolls();
    expect(polls.find((p) => p.id === id)?.question).toBe("Best stack?");

    const data = getPoll(id)!;
    expect(data.options).toHaveLength(3);

    const ok = voteOnce(data.options[1].id);
    expect(ok).toBe(true);
    expect(getPoll(id)!.options[1].votes).toBe(1);
  });
});
