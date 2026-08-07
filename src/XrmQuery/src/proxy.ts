/**
 * Path capture for the picker lambdas (`x => [x.name, x.accountnumber]`).
 *
 * The legacy library did this by running a regex over `Function.prototype.toString()`, which is why
 * XrmDefinitelyTyped warned against minifying code that uses XrmQuery: renaming the lambda parameter
 * or its property accesses silently produced the wrong query. Here the lambda is simply *called* with
 * a recording Proxy, so the captured names come from the property accesses themselves and survive any
 * amount of mangling.
 */

/** Applied to the last segment of a captured path, e.g. `accountid_guid` -> `_accountid_value`. */
export type NameTransformer = (name: string) => string;

const identity: NameTransformer = (name) => name;

/** Property names that must never be treated as an attribute lookup. */
const RESERVED = new Set([
  "toString",
  "valueOf",
  "toJSON",
  "constructor",
  "then",
  "inspect",
  "__str",
]);

function render(parents: string[], leaf: string, transform: NameTransformer): string {
  // Only the leaf is transformed — matches the legacy behaviour, where `x.a.b` became `a/transform(b)`.
  return [...parents, transform(leaf)].join("/");
}

function node(path: string, parents: string[], transform: NameTransformer): unknown {
  const target = {};
  return new Proxy(target, {
    get(_t, prop) {
      if (prop === Symbol.toPrimitive) return () => path;
      if (typeof prop === "symbol") return undefined;
      if (prop === "toString" || prop === "valueOf" || prop === "toJSON") return () => path;
      if (prop === "__str") return path;
      if (RESERVED.has(prop)) return undefined;
      return node(render(parents, prop, transform), [...parents, prop], transform);
    },
    has() {
      return true;
    },
  });
}

/**
 * Runs `picker` against a recording proxy and returns whatever it returned — a tagged value, or an
 * array of them. Tagged values stringify to their OData path.
 */
export function tagged<T>(picker: (x: never) => T, transform: NameTransformer = identity): T {
  const root = new Proxy(
    {},
    {
      get(_t, prop) {
        if (typeof prop === "symbol") return undefined;
        if (RESERVED.has(prop)) return undefined;
        return node(transform(prop), [prop], transform);
      },
      has() {
        return true;
      },
    },
  );
  return picker(root as never);
}

/** A tagged value produced by {@link tagged}: anything that stringifies to an OData path. */
export function tag(name: string): unknown {
  return node(name, [name], identity);
}

/**
 * Converts an XrmQuery attribute name to its Web API form: a lookup selected as `xxx_guid` is really
 * `_xxx_value` on the wire. Attribute names that merely *contain* `_guid` are left alone.
 */
export function xrmQueryToCrm(name: string): string {
  const match = name.match(/_guid$/);
  if (!match) return name;
  return `_${name.substring(0, match.index)}_value`;
}

/** Picker execution with the `_guid` -> `_value` transform applied, for filters and orderings. */
export function taggedForCrm<T>(picker: (x: never) => T): T {
  return tagged(picker, xrmQueryToCrm);
}

/** Runs a select picker and returns the resulting attribute names. */
export function parseSelects(picker: (x: never) => readonly unknown[]): string[] {
  return taggedForCrm(picker).map((x) => String(x));
}

/** Runs a picker that returns a single value (entity set, navigation property, ordering). */
export function parseSingle(picker: (x: never) => unknown): string {
  return String(taggedForCrm(picker));
}

/** Runs a picker whose result is used verbatim, without the `_guid` transform. */
export function parseRaw(picker: (x: never) => unknown): string {
  return String(tagged(picker));
}
