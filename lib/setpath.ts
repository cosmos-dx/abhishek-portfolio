/**
 * Returns a copy of `obj` with `value` set at a dot path ("profile.bio", "experience.0.role").
 * An array index equal to the length (or "-") appends. Unknown keys / out-of-range indexes throw, so an LLM typo
 * can't silently create junk (the schema would strip it anyway, hiding the mistake).
 */
export function setPath<T>(obj: T, path: string, value: unknown): T {
  const [head, ...rest] = path.split(".");
  if (!head) throw new Error("Empty path");
  const next = (cur: unknown) => (rest.length ? setPath(cur, rest.join("."), value) : value);
  if (Array.isArray(obj)) {
    const i = head === "-" ? obj.length : Number(head);
    if (!Number.isInteger(i) || i < 0 || i > obj.length) throw new Error(`Bad array index "${head}" (length ${obj.length})`);
    const copy = [...obj];
    copy[i] = next(obj[i]);
    return copy as T;
  }
  if (obj && typeof obj === "object") {
    if (!(head in obj)) throw new Error(`Unknown key "${head}". Valid: ${Object.keys(obj).join(", ")}`);
    return { ...obj, [head]: next((obj as Record<string, unknown>)[head]) };
  }
  throw new Error(`Cannot go into "${head}": parent is not an object or array`);
}
