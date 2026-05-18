// src/api/translations.ts
import axiosInstance from "@/api/axiosInstance";

export type LangCode = "en" | "ar" | (string & {});
export type TranslationsMap = Record<string, string>;

type ApiEnvelope<T> = { status: number; message: string; data: T };

// helper
const form = (obj: Record<string, string>) => {
  const p = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => p.set(k, v));
  return p;
};

// POST /admintranslations (action=get, lang)
export async function loadLang(lang: LangCode): Promise<TranslationsMap> {
  const { data } = await axiosInstance.post<
    ApiEnvelope<{ lang: string; keys: TranslationsMap }>
  >("/admintranslations", form({ action: "get", lang }));
  return data?.data?.keys ?? {};
}

// POST /admintranslations (action=patch, lang, data=<json string>)
export async function patchLang(
  lang: LangCode,
  patch: TranslationsMap
): Promise<void> {
  await axiosInstance.post(
    "/admintranslations",
    form({ action: "patch", lang, data: JSON.stringify(patch) })
  );
}

// POST /admintranslations (action=put, lang, data=<json string>)
export async function saveLang(
  lang: LangCode,
  full: TranslationsMap
): Promise<void> {
  await axiosInstance.post(
    "/admintranslations",
    form({ action: "put", lang, data: JSON.stringify(full) })
  );
}

// POST /admintranslations (action=list)
export async function listLanguages(): Promise<string[]> {
  const { data } = await axiosInstance.post<
    ApiEnvelope<{ languages: string[] }>
  >("/admintranslations", form({ action: "list" }));
  return data?.data?.languages ?? [];
}
