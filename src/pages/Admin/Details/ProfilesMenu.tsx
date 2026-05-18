// src/pages/Admin/Details/ProfilesMenu.tsx
import { useEffect } from "react";
import { useParams, Outlet, useMatch, useNavigate } from "react-router-dom";
import { Box, Grid, Paper } from "@mui/material";
import { useTranslation } from "react-i18next";
import CustomTabSwitcher from "@/components/ui/CustomTabSwitcher";
import { defineTabs } from "@/utils/defineTabs";

type TabKey =
  | "statuses"
  | "personal"
  | "accounts"
  | "transactions"
  | "purses"
  | "messenger"
  | "secure"
  | "logs"
  | "queue"
  | "review"
  | "permissions"
  | "referrals"
  | "payment_transactions";

export default function ProfilesMenu() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Active tab logic
  const detailedMatch = useMatch("/detailed/:tab/:id");
  const reviewMatch = useMatch("/detailed/review/:id/*");

  const activeTab = reviewMatch
    ? "review"
    : (detailedMatch?.params.tab as TabKey) || "personal";

  const tabs = defineTabs<TabKey>([
    { key: "statuses", label: t("statuses"), path: `/detailed/statuses/${id}` },
    { key: "personal", label: t("overview"), path: `/detailed/personal/${id}` },
    { key: "accounts", label: t("accounts"), path: `/detailed/accounts/${id}` },
    {
      key: "transactions",
      label: t("transactions"),
      path: `/detailed/transactions/${id}`,
    },
    { key: "purses", label: t("purses"), path: `/detailed/purses/${id}` },
    {
      key: "messenger",
      label: t("messenger"),
      path: `/detailed/messenger/${id}`,
    },
    { key: "secure", label: t("secure"), path: `/detailed/secure/${id}` },
    { key: "logs", label: t("action_logs"), path: `/detailed/logs/${id}` },
    { key: "queue", label: t("emails_sent"), path: `/detailed/queue/${id}` },
    { key: "review", label: t("update_info"), path: `/detailed/review/${id}` },
    {
      key: "permissions",
      label: t("permissions"),
      path: `/detailed/permissions/${id}`,
    },
    {
      key: "referrals",
      label: t("referrals"),
      path: `/detailed/referrals/${id}`,
    },
    {
      key: "payment_transactions",
      label: t("payment_transactions"),
      path: `/detailed/payment_transactions/${id}`,
    },
  ]);

  useEffect(() => {
    if (!detailedMatch && !reviewMatch) {
      navigate(`/detailed/personal/${id}`, { replace: true });
    }
  }, [detailedMatch, reviewMatch, navigate, id]);

  return (
    <Paper sx={{ p: 2, boxShadow: "none" }}>
      <Box display="flex" justifyContent="space-between" ml={2}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={12}>
            <CustomTabSwitcher
              tabs={tabs.map(({ key, label }) => ({
                key,
                label,
                iconClass: "la-icon-default",
              }))}
              activeTab={activeTab}
              onTabChange={(key) => {
                const next = tabs.find((t) => t.key === key);
                if (!next) return;
                navigate(next.path);
              }}
            />
            <Outlet />
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}
