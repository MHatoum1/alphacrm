// src/pages/User/Partners/PartnersLayout.tsx
import { Tabs, Tab, Box } from "@mui/material";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

export default function PartnersLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const loc = useLocation();

  // Grab last segment: "links" | "referrals" | "account"
  let tab = loc.pathname.split("/").pop() || "links";
  const validTabs = ["links", "referrals", "account"];
  if (!validTabs.includes(tab)) tab = "links";

  // Redirect "/partners" → "/partners/links"
  useEffect(() => {
    if (loc.pathname === "/partners" || loc.pathname === "/partners/") {
      navigate("/partners/links", { replace: true });
    }
  }, [loc.pathname, navigate]);

  return (
    <Box sx={{ p: 3 }}>
      <Tabs
        value={tab}
        onChange={(_, v) => navigate(`/partners/${v}`)}
        aria-label="Partners tabs"
      >
        <Tab label={t("Registration Links")} value="links" />
        <Tab label={t("Referrals by Name")} value="referrals" />
        <Tab label={t("Referrals by Account")} value="account" />
      </Tabs>

      <Box sx={{ mt: 2 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
