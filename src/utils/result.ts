/**
 * Senior: Result<T,E> — eksplicitne napake namesto `throw`/`null`.
 * Prej: `formatJson` vrže, `colorInfo` vrne `null` tiho, `findReplace` meša.
 * Zdaj: `Ok`/`Err` prisili k obravnavi, tipizirano, brez try/catch razpršenosti.
 */
export type Result<T, E = string> = { ok: true; value: T } | { ok: false; error: E };
export const Ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const Err = <E>(error: E): Result<never, E> => ({ ok: false, error });
export const isOk = <T, E>(r: Result<T, E>): r is { ok: true; value: T } => r.ok;
export const isErr = <T, E>(r: Result<T, E>): r is { ok: false; error: E } => !r.ok;
export const unwrap = <T, E>(r: Result<T, E>): T => {
  if (r.ok) return r.value;
  throw new Error(String(r.error));
};
export const mapResult = <T, U, E>(r: Result<T, E>, fn: (v: T) => U): Result<U, E> =>
  r.ok ? Ok(fn(r.value)) : r;
