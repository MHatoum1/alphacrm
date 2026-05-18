// src/contexts/LanguageContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
} from "react";
import { useTranslation } from "react-i18next";
import { Language } from "../types"; // Import Language type from a separate types file

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { i18n } = useTranslation();

  // Initialize language state from i18n's current language
  const [language, setLanguageState] = useState<Language>(
    () => (i18n.language as Language) || "en"
  );

  const setLanguage = (lang: Language) => {
    if (lang !== language) {
      i18n.changeLanguage(lang);
      setLanguageState(lang);
      localStorage.setItem("language", lang);
    }
  };

  // Memoize context value to optimize performance
  const value = useMemo(() => ({ language, setLanguage }), [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
