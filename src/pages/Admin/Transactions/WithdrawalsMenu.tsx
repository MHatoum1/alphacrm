// src/pages/Admin/Transactions/WithdrawalsMenu.tsx

import { Outlet, useMatch, useNavigate } from "react-router-dom";
import { Box, Grid } from "@mui/material";
import CustomTabSwitcher from "@/components/ui/CustomTabSwitcher";

import { useTranslation } from "react-i18next";
import { defineTabs } from "@/utils/defineTabs";

type TabKey =
  | "all_withdrawals"
  | "new"
  | "approved"
  | "declined"
  | "successful"
  | "failed";

export default function WithdrawalsMenu() {
  const { t } = useTranslation();

  const navigate = useNavigate();

  // 2️⃣ figure out which tab is active from the URL
  // matches /detailed/:tab/:id
  const match = useMatch("/depdetails/:tab/:id");
  const activeTab = (match?.params.tab as TabKey) || "all_withdrawals";

  // 3️⃣ build your tab definitions to match `/detailed/<tabKey>/<id>`
  const withdrawalsTabs = defineTabs<TabKey>([
    {
      key: "all_withdrawals",
      label: t("all_withdrawals"),
      path: "/transactions/all_withdrawals",
    },
    { key: "new", label: t("new_withdrawals"), path: "/withdrawals/new" },
    { key: "approved", label: t("approved"), path: "/withdrawals/approved" },
    { key: "declined", label: t("declined"), path: "/withdrawals/declined" },
    {
      key: "successful",
      label: t("successful"),
      path: "/withdrawals/successful",
    },
    { key: "failed", label: t("failed"), path: "/withdrawals/failed" },
  ]);

  return (
    <Box sx={{ flexGrow: 1, p: 2 }}>
      <Grid container spacing={2}>
        {/* Main content + custom tab switcher */}
        <Grid item xs={12} md={12}>
          <CustomTabSwitcher
            tabs={withdrawalsTabs.map(({ key, label }) => ({
              key,
              label,
              iconClass: "la-icon-default", // or map a real icon per tab if you like
            }))}
            activeTab={activeTab}
            onTabChange={(key) => {
              const next = withdrawalsTabs.find((t) => t.key === key);
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
