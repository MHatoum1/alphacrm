// src/utils/defineTabs.ts
export function defineTabs<K extends string>(
  tabs: Array<{ key: K; label: string; path: string }>
): Array<{ key: K; label: string; path: string }> {
  return tabs;
}
