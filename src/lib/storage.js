// localStorage can throw (private mode, blocked storage) — never let it break the page.
export const KEYS = { theme: "hk.theme", lang: "hk.lang", music: "hk.music" };

export function read(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function write(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}
