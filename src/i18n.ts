// src/i18n.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";
import { BACKEND_BASE_URL } from "./constants";

const savedLanguage =
  typeof window !== "undefined"
    ? localStorage.getItem("language") || "en"
    : "en";

i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    lng: savedLanguage,
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    react: { useSuspense: true },
    backend: {
      loadPath: `${BACKEND_BASE_URL}/admintranslations?lang={{lng}}`,
      requestOptions: () => {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const headers: Record<string, string> = {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        };
        if (token) headers.Authorization = `Bearer ${token}`;
        // body *must* be raw urlencoded text here
        const body = new URLSearchParams({ action: "get" }).toString();
        return { method: "POST", headers, body };
      },
      parse: (data: string) => {
        try {
          const json = JSON.parse(data);
          return json?.data?.keys || {};
        } catch {
          return {};
        }
      },
    },
  });

export default i18n;
