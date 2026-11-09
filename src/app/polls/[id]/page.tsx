import { notFound } from "next/navigation";
import { getPoll } from "@/lib/db";
import { voteAction } from "../../actions";
import PollLiveUpdates from "./live";

export const dynamic = "force-dynamic";

export default async function PollPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pollId = Number(id);
  const data = getPoll(pollId);
  if (!data) notFound();
  const { poll, options } = data;
  const total = options.reduce((sum, o) => sum + o.votes, 0);

  return (
    <main>
      <h2>{poll.question}</h2>
      <p>Total votes: {total}</p>
      <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "0.5rem" }}>
        {options.map((o) => {
          const pct = total === 0 ? 0 : Math.round((o.votes / total) * 100);
          return (
            <li key={o.id} style={{ border: "1px solid #ddd", padding: "0.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{o.label}</span>
                <span>{o.votes} ({pct}%)</span>
              </div>
              <div style={{ background: "#eee", height: 8, marginTop: 4 }}>
                <div style={{ width: `${pct}%`, height: "100%", background: "#4a7" }} />
              </div>
              <form action={voteAction.bind(null, pollId, o.id)} style={{ marginTop: "0.5rem" }}>
                <button type="submit">Vote</button>
              </form>
            </li>
          );
        })}
      </ul>
      <PollLiveUpdates pollId={pollId} />
    </main>
  );
}
