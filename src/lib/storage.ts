const NS = 'triexpert:v1:';

function key(name: string): string {
  return NS + name;
}

export const storage = {
  get(name: string): string | null {
    try {
      return localStorage.getItem(key(name));
    } catch {
      return null;
    }
  },

  set(name: string, value: string): void {
    try {
      localStorage.setItem(key(name), value);
    } catch {
      // Quota exceeded or storage disabled — fail silently.
    }
  },

  remove(name: string): void {
    try {
      localStorage.removeItem(key(name));
    } catch {
      // ignore
    }
  },

  getJSON<T>(name: string, isValid: (v: unknown) => v is T): T | null {
    const raw = storage.get(name);
    if (raw === null) return null;
    try {
      const parsed = JSON.parse(raw) as unknown;
      return isValid(parsed) ? parsed : null;
    } catch {
      return null;
    }
  },

  setJSON(name: string, value: unknown): void {
    try {
      storage.set(name, JSON.stringify(value));
    } catch {
      // ignore
    }
  },
};

export const isStringArray = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((x) => typeof x === 'string');
