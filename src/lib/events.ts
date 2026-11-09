// A tiny in-process pub/sub for Server-Sent Events. Good enough for a single
// Node process. For multi-replica deployments swap this out for Redis pub/sub.

type Listener = (payload: string) => void;

const listeners = new Map<string, Set<Listener>>();

export function subscribe(topic: string, fn: Listener): () => void {
  let set = listeners.get(topic);
  if (!set) {
    set = new Set();
    listeners.set(topic, set);
  }
  set.add(fn);
  return () => set!.delete(fn);
}

export function publish(topic: string, payload: unknown): void {
  const set = listeners.get(topic);
  if (!set) return;
  const data = JSON.stringify(payload);
  for (const fn of set) fn(data);
}
