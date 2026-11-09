import Link from "next/link";
import { listPolls } from "@/lib/db";
import { createPollAction } from "./actions";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const polls = listPolls();
  return (
    <main>
      <section style={{ marginBottom: "2rem" }}>
        <h2>Start a poll</h2>
        <form action={createPollAction} style={{ display: "grid", gap: "0.75rem" }}>
          <input name="question" placeholder="What should we call the team?" required minLength={3} />
          <textarea name="options" placeholder={"One option per line\nAnother option\nAnd one more"} rows={5} required />
          <button type="submit">Create</button>
        </form>
      </section>
      <section>
        <h2>Recent polls</h2>
        <ul>
          {polls.map((p) => (
            <li key={p.id}>
              <Link href={`/polls/${p.id}`}>{p.question}</Link>
            </li>
          ))}
          {polls.length === 0 && <li>No polls yet. Create the first one above.</li>}
        </ul>
      </section>
    </main>
  );
}
