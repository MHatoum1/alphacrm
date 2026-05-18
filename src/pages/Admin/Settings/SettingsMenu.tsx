/*  src\pages\Admin\Settings\SettingsMenu.tsx  */
import { Outlet, useMatch, useNavigate } from "react-router-dom";
import { Box, Grid, Paper } from "@mui/material";
import CustomTabSwitcher from "@/components/ui/CustomTabSwitcher";
import { defineTabs } from "@/utils/defineTabs";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

// Types
type TabKey =
  | "relationships"
  | "customized_report"
  | "account_report"
  | "mt5_add_account"
  | "queue"
  | "translations";

export default function SettingsMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const match = useMatch("/settings/:tab");

  const user = useSelector((state: RootState) => state.auth.user);
  const userRole = user?.acl;
  const isTranslator = userRole === "translators";

  // Define all tabs once
  const ALL_TABS = defineTabs<TabKey>([
    {
      key: "relationships",
      label: t("relationships"),
      path: "/settings/relationships",
    },
    {
      key: "customized_report",
      label: t("customized_report"),
      path: "/settings/customized_report",
    },
    {
      key: "account_report",
      label: t("account_report"),
      path: "/settings/account_report",
    },
    {
      key: "mt5_add_account",
      label: t("add_mt5_account"),
      path: "/settings/mt5_add_account",
    },
    { key: "queue", label: t("queue"), path: "/settings/queue" },
    {
      key: "translations",
      label: t("translations"),
      path: "/settings/translations",
    },
  ]);

  // Show only translations for translators
  const tabs = isTranslator
    ? ALL_TABS.filter((tab) => tab.key === "translations")
    : ALL_TABS;

  // Active tab logic
  const routeTab = match?.params.tab as TabKey | undefined;
  const activeTab: TabKey = isTranslator
    ? "translations"
    : routeTab ?? "relationships";

  // Hard-redirect translators to /settings/translations,
  // and keep existing fallback for others.
  useEffect(() => {
    if (isTranslator) {
      if (routeTab !== "translations") {
        navigate("/settings/translations", { replace: true });
      }
      return; // don't run the non-translator fallback
    }

    if (!match) {
      navigate("/settings/relationships", { replace: true });
    }
  }, [isTranslator, routeTab, match, navigate]);

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
