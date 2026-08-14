// Tiny pub-sub so any component can show a "server waking up" indicator while apiRequest()
// is retrying a request that failed because Render's free-tier backend (and/or Neon's
// scale-to-zero database) is still spinning up. Avoids threading loading state through
// every individual API call site.
type Listener = (waking: boolean) => void;

const listeners = new Set<Listener>();
let waking = false;
let pending = 0;

function notify() {
  listeners.forEach((listener) => listener(waking));
}

export function subscribeColdStart(listener: Listener): () => void {
  listeners.add(listener);
  listener(waking);
  return () => listeners.delete(listener);
}

export function beginColdStartRetry() {
  pending += 1;
  if (!waking) {
    waking = true;
    notify();
  }
}

export function endColdStartRetry() {
  pending = Math.max(0, pending - 1);
  if (pending === 0 && waking) {
    waking = false;
    notify();
  }
}
