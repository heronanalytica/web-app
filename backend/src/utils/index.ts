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
