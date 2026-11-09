"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Subscribes to the poll's SSE stream and asks the router to refresh on each event. */
export default function PollLiveUpdates({ pollId }: { pollId: number }) {
  const router = useRouter();
  useEffect(() => {
    const es = new EventSource(`/api/polls/${pollId}/stream`);
    es.onmessage = () => router.refresh();
    return () => es.close();
  }, [pollId, router]);
  return null;
}
