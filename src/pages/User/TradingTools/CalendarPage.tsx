
// src\pages\User\TradingTools\CalendarPage.tsx
import { useEffect } from "react";
import { Box } from "@mui/material";

declare global {
  interface Window {
    economicCalendar: any;
  }
}

export default function CalendarPage() {
  useEffect(() => {
    const script = document.createElement("script");
    script.id = "economicCalendarWidget";
    script.src = "https://c.mql5.com/js/widgets/calendar/widget.v1.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      new window.economicCalendar({
        width: "100%",
        height: "100%",
        mode: 2,
      });
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <Box
      sx={{
        "& iframe": {
          minHeight: 1000,
        },
        height: "100%",
      }}
    >
      {/* widget will inject itself here */}
      <div id="economicCalendarWidget"></div>
    </Box>
  );
}
