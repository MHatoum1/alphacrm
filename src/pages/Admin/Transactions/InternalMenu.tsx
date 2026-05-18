// src/pages/Admin/Transactions/InternalMenu.tsx

import { Outlet, useMatch, useNavigate } from "react-router-dom";
import { Box, Grid } from "@mui/material";
import CustomTabSwitcher from "@/components/ui/CustomTabSwitcher";

import { useTranslation } from "react-i18next";
import { defineTabs } from "@/utils/defineTabs";

type TabKey = "all_internals" | "pending";

export default function InternalMenu() {
  const { t } = useTranslation();

  const navigate = useNavigate();

  // 1️⃣ fetch the profile payload

  // 2️⃣ figure out which tab is active from the URL
  // matches /detailed/:tab/:id
  const match = useMatch("/intdetails/:tab/:id");

  const activeTab = (match?.params.tab as TabKey) || "all_internals";

  // 3️⃣ build your tab definitions to match `/detailed/<tabKey>/<id>`
  const internalTabs = defineTabs<TabKey>([
    {
      key: "all_internals",
      label: t("all_internals"),
      path: "/transactions/all_internals",
    },
    { key: "pending", label: t("pending"), path: "/internals/pending" },
  ]);

  return (
    <Box sx={{ flexGrow: 1, p: 2 }}>
      <Grid container spacing={2}>
        {/* Main content + custom tab switcher */}
        <Grid item xs={12} md={12}>
          <CustomTabSwitcher
            tabs={internalTabs.map(({ key, label }) => ({
              key,
              label,
              iconClass: "la-icon-default", // or map a real icon per tab if you like
            }))}
            activeTab={activeTab}
            onTabChange={(key) => {
              const next = internalTabs.find((t) => t.key === key);
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
