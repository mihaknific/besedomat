/**
 * Senior: tipiziran EventBus — decoupled komunikacija med store ↔ UI ↔ orodja.
 * Prej: direktni `store.subscribe` + global `document.addEventListener` razpršeno.
 * Zdaj: `bus.emit('tool:open', {id})`, `bus.on('tool:open', fn)` — tipizirano, unsubscribe, brez memory leak.
 */
type Events = {
  'tool:open': { id: string };
  'tool:close': Record<string, never>;
  'search:query': { query: string };
  'theme:change': { theme: string };
  'lang:change': { lang: string };
  'toast:show': { msg: string };
};

type Handler<K extends keyof Events> = (payload: Events[K]) => void;

export class EventBus {
  private map = new Map<string, Set<Handler<keyof Events>>>();

  on<K extends keyof Events>(event: K, fn: Handler<K>): () => void {
    let set = this.map.get(event);
    if (!set) {
      set = new Set();
      this.map.set(event, set);
    }
    set.add(fn as Handler<keyof Events>);
    return () => set!.delete(fn as Handler<keyof Events>);
  }

  once<K extends keyof Events>(event: K, fn: Handler<K>): () => void {
    const off = this.on(event, p => {
      off();
      (fn as Handler<K>)(p);
    });
    return off;
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    const set = this.map.get(event);
    if (!set) return;
    for (const fn of [...set]) (fn as Handler<K>)(payload);
  }

  clear(event?: keyof Events): void {
    if (event) this.map.delete(event);
    else this.map.clear();
  }
}

export const bus = new EventBus();
