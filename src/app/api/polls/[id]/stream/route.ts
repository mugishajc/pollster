import { subscribe } from "@/lib/events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Server-Sent Events: keep the connection open and push a line whenever a vote
// comes in for this poll. The client re-fetches the page.
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const topic = `poll:${id}`;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (payload: string) => controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
      send(JSON.stringify({ type: "hello" }));
      const unsubscribe = subscribe(topic, send);

      const keepalive = setInterval(() => controller.enqueue(encoder.encode(": ping\n\n")), 15_000);
      // When the client disconnects, Next.js closes the stream.
      return () => {
        clearInterval(keepalive);
        unsubscribe();
      };
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
