/*  src/pages/Admin/Accounts/AccountsMenu.tsx  */
import { Outlet, useMatch, useNavigate } from "react-router-dom";
import { Box, Grid, Paper } from "@mui/material";
import CustomTabSwitcher from "@/components/ui/CustomTabSwitcher";
import { defineTabs } from "@/utils/defineTabs";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

type TabKey = "accounts" | "online_users";

export default function AccountsMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const match = useMatch("/accounts/:tab");
  const activeTab = (match?.params.tab as TabKey) ?? "accounts";

  const tabs = defineTabs<TabKey>([
    { key: "accounts", label: t("accounts"), path: "/accounts/accounts" },
    { key: "online_users", label: t("online_users"), path: "/accounts/online_users" },
    
  ]);

  useEffect(() => {
    if (!match )
      navigate("/accounts/accounts", { replace: true });
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
