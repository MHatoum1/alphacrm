// src/pages/Admin/Transactions/DepositsMenu.tsx

import { Outlet, useMatch, useNavigate } from "react-router-dom";
import { Box, Grid } from "@mui/material";
import CustomTabSwitcher from "@/components/ui/CustomTabSwitcher";

import { useTranslation } from "react-i18next";
import { defineTabs } from "@/utils/defineTabs";

type TabKey =
  | "all_deposits"
  | "new"
  | "approved"
  | "declined"
  | "successful"
  | "failed"
  | "pending";

export default function DepositsMenu() {
  const { t } = useTranslation();

  const navigate = useNavigate();

  // 2️⃣ figure out which tab is active from the URL
  // matches /detailed/:tab/:id
  const match = useMatch("/depdetails/:tab/:id");
  const activeTab = (match?.params.tab as TabKey) || "all_deposits";

  // 3️⃣ build your tab definitions to match `/detailed/<tabKey>/<id>`
  const depositsTabs = defineTabs<TabKey>([
    {
      key: "all_deposits",
      label: t("all_deposits"),
      path: "/transactions/all_deposits",
    },
    { key: "new", label: t("new_deposits"), path: "/deposits/new" },
    { key: "approved", label: t("approved"), path: "/deposits/approved" },
    { key: "declined", label: t("declined"), path: "/deposits/declined" },
    { key: "successful", label: t("successful"), path: "/deposits/successful" },
    { key: "failed", label: t("failed"), path: "/deposits/failed" },
    { key: "pending", label: t("platform_pending"), path: "/deposits/pending" },
  ]);

  return (
    <Box sx={{ flexGrow: 1, p: 2 }}>
      <Grid container spacing={2}>
        {/* Main content + custom tab switcher */}
        <Grid item xs={12} md={12}>
          <CustomTabSwitcher
            tabs={depositsTabs.map(({ key, label }) => ({
              key,
              label,
              iconClass: "la-icon-default", // or map a real icon per tab if you like
            }))}
            activeTab={activeTab}
            onTabChange={(key) => {
              const next = depositsTabs.find((t) => t.key === key);
              if (next) navigate(next.path);
            }}
          />
          {/* Outlet will render StatusesPage, OverviewPage, etc., based on the route */}
          <Outlet />
        </Grid>
      </Grid>
    </Box>
  );
}
