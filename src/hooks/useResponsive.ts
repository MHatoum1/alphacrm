// src/hooks/useResponsive.ts

import { useEffect, useState } from "react";

const useResponsive = () => {
  const getIsMobile = (): boolean => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 768;
    }
    return false; // Default to desktop view in SSR
  };

  const [isMobile, setIsMobile] = useState<boolean>(getIsMobile());

  useEffect(() => {
    if (typeof window === "undefined") return;

    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsMobile(getIsMobile());
      }, 150); // Adjust the delay as needed
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return { isMobile };
};

export default useResponsive;
