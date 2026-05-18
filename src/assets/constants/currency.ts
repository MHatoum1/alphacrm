// currency.ts   (⇠ rename to .js if you’re not using TypeScript)

/** Single-source currency “enum” */
export const Currency = {
  USD:  'USD',
  EUR:  'EUR',
  GBP:  'GBP',
  CHF:  'CHF',
  JPY:  'JPY',
  PLN:  'PLN',
  LBP:  'LBP',
  TRY:  'TRY',
  USDT: 'USDT',
} as const;                      // keeps literal string types in TS

/* ------------------------------------------------------------------
   Pre-built collections (exactly mirroring the PHP arrays)
------------------------------------------------------------------ */
export const ALL_CURRENCIES       = [
  Currency.USD,
  Currency.EUR,
  Currency.GBP,
  Currency.CHF,
  Currency.JPY,
  Currency.PLN,
  Currency.LBP,
  Currency.USDT,
] as const;

export const AVAILABLE_CURRENCIES = [
  Currency.USD,
  Currency.EUR,
  Currency.PLN,
  Currency.GBP,
  Currency.USDT,
] as const;

export const GLOBAL_CURRENCIES    = [
  Currency.USD,
  Currency.EUR,
  Currency.USDT,
] as const;

export const BANK_NO_EU_CURRENCIES = [
  'Select Currency',   // kept exactly as in the PHP array
  Currency.EUR,
  Currency.TRY,
  Currency.USD,
] as const;

/* ------------------------------------------------------------------
   Helpers you might find handy
------------------------------------------------------------------ */

/** Convenient iterable of the single-currency codes */
export const currencyList = Object.values(Currency);   // ["USD", "EUR", …]

/** Type-guard (TS only) to ensure a value is one of our currencies */
export type CurrencyCode = typeof Currency[keyof typeof Currency];
export const isCurrency = (v: unknown): v is CurrencyCode => {
  return typeof v === 'string' && (currencyList as readonly string[]).includes(v);
};
