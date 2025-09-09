import { Prisma } from 'generated/prisma';

export function isJsonObject(
  value: Prisma.JsonValue,
): value is Prisma.JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> {
  const clone = { ...obj };
  for (const key of keys) {
    delete clone[key];
  }
  return clone;
}

export const slug = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

export const getCol = (row: Record<string, any>, ...aliases: string[]) => {
  for (const a of aliases) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const v: any = row[a];
    if (v !== undefined && v !== null && String(v).length)
      return String(v).trim();
  }
  return '';
};

export const toJsonValue = <T>(value: T): Prisma.InputJsonValue => {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
};

// Find bad leaves (optional but handy)
export function findJsonViolations(
  value: unknown,
  path: (string | number)[] = [],
): string[] {
  const problems: string[] = [];
  const add = (msg: string) =>
    problems.push(`${path.join('.') || '<root>'}: ${msg}`);

  const t = typeof value;
  if (
    value === undefined ||
    t === 'function' ||
    t === 'symbol' ||
    t === 'bigint'
  ) {
    add(`invalid type ${t}`);
    return problems;
  }
  if (value === null || t === 'string' || t === 'number' || t === 'boolean')
    return problems;

  if (Array.isArray(value)) {
    value.forEach((v, i) =>
      problems.push(...findJsonViolations(v, [...path, i])),
    );
    return problems;
  }

  if (t === 'object') {
    if (value instanceof Date) {
      add('Date object (must be ISO string)');
      return problems;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const proto = Object.getPrototypeOf(value);
    if (proto && proto !== Object.prototype && proto !== null) {
      add('non-plain object (has prototype)');
    }
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      problems.push(...findJsonViolations(v, [...path, k]));
    }
    return problems;
  }

  add(`unknown type ${t}`);
  return problems;
}

// Hard guarantee that the output is valid JSON for Prisma
export function pruneToJson<T>(value: T): Prisma.InputJsonValue {
  return JSON.parse(
    JSON.stringify(value, (_k, v) => {
      if (v === undefined) return undefined; // stripped
      if (v instanceof Date) return v.toISOString();
      if (
        typeof v === 'function' ||
        typeof v === 'symbol' ||
        typeof v === 'bigint'
      )
        return undefined;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return v;
    }),
  ) as Prisma.InputJsonValue;
}
