/*  src/pages/Admin/Marketing/MarketingMenu.tsx  */
import { Outlet, useMatch, useNavigate } from "react-router-dom";
import { Box, Grid, Paper } from "@mui/material";
import CustomTabSwitcher from "@/components/ui/CustomTabSwitcher";
import { defineTabs } from "@/utils/defineTabs";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

type TabKey = "campaigns" | "referrals" | "archived";

export default function MarketingMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const match = useMatch("/marketing/:tab");
  const matchDetails = useMatch("/marketing/campaigns/detailed/:id");
  const activeTab = (match?.params.tab as TabKey) ?? "campaigns";

  const tabs = defineTabs<TabKey>([
    { key: "campaigns", label: t("campaigns"), path: "/marketing/campaigns" },
    { key: "referrals", label: t("referrals"), path: "/marketing/referrals" },
    { key: "archived", label: t("archived"), path: "/marketing/archived" },
  ]);

  useEffect(() => {
    if (!match && !matchDetails)
      navigate("/marketing/campaigns", { replace: true });
  }, [match, navigate]);

  return (
    <Paper sx={{ p: 2, boxShadow: "none" }}>
      <Box display="flex" justifyContent="space-between" ml={2}>
        <Grid container columnSpacing={0} rowSpacing={2}>
          {" "}
          {/* ⬅︎ no left/right gutters */}
          <Grid item xs={12} sx={{ px: 0 }}>
            {" "}
            {/* ⬅︎ cancel item padding */}
            <CustomTabSwitcher
              tabs={tabs.map(({ key, label }) => ({
                key,
                label,
                iconClass: "la-icon-default",
              }))}
              activeTab={activeTab}
              onTabChange={(k) => navigate(tabs.find((t) => t.key === k)!.path)}
            />
            <Outlet />
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}
