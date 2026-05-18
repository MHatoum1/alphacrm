// src/pages/User/ClientProfile/ClientOverviewTab.tsx
import { Paper, Box, Typography, Grid, Button, Stack } from "@mui/material";
import {
  AttachMoney as DepositIcon,
  MoneyOff as WithdrawIcon,
  Description as KycIcon,
  AutoStories as DemoIcon,
  BusinessCenter as LiveIcon,
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { useTranslation } from "react-i18next";
import { ReactNode } from "react";

// ← your language context

import StatusLabel from "@/components/ui/StatusLabel";
import axiosInstance from "@/api/axiosInstance";

export default function ClientOverviewTab() {
  // i18n + your LanguageContext
  const { t } = useTranslation();

  // auth + profile from Redux
  const authUser = useSelector((s: RootState) => s.auth.user);
  const client = useSelector((s: RootState) => s.clientProfile.data);

  // status badge logic (unchanged)
  const [statusKey, statusText] = client.verified
    ? ["verified", "verified"]
    : client.toverify
    ? ["info", "awaiting_verification"]
    : client.limited
    ? ["limited", "limited"]
    : client.dormant
    ? ["dormant", "dormant"]
    : client.completed
    ? ["info", "completed"]
    : ["default", "uncompleted"];

  const disabled = !client.verified;
  const userId = authUser?.userID;

  const infoRows: [string, ReactNode][] = [
    [t("status"), <StatusLabel statusKey={statusKey} label={t(statusText)} />],
    [t("name"), client.name],
    [t("email"), client.email],
    [t("phone"), client.phone],
    [t("country"), client.country_name],
  ];

  // don't render until profile loaded
  if (!client.id) return null;

  const handleKycDownload = async () => {
    try {
      const form = new URLSearchParams({
        action: "downloadKycPdf",
        user_id: String(userId),
      });

      const { data } = await axiosInstance.post("/userprofiles", form, {
        responseType: "blob", // <— IMPORTANT
      });

      /* create a temporary link */
      const url = window.URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `KYC_${userId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Paper elevation={0} sx={{ p: { xs: 2, md: 4 } }}>
      <Grid container spacing={4} alignItems="stretch">
        {/* ─── 1. Basic Info + Language Picker ─────────── */}
        <Grid item xs={12} md={6} sx={{ display: "flex" }}>
          <Paper
            component="dl"
            elevation={2}
            sx={{
              p: 2,
              flex: 1,
              display: "flex",
              flexDirection: "column",
              "& dt": { fontWeight: 500 },
              "& dd": { mb: 2, ml: 0 },
              height: "100%",
            }}
          >
            {infoRows.map(([label, value]) => (
              <Box key={label} display="flex" mb={1}>
                <Typography
                  sx={{ fontWeight: "bold", width: 150 }}
                  component="dt"
                >
                  {label}
                </Typography>
                <Typography component="dd">{value}</Typography>
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* ─── 2. Quick Actions ────────────────────────── */}

        <Grid
          item
          xs={12}
          md={6}
          sx={{ display: "flex", flexDirection: "column" }}
        >
          {/* Account Actions */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              {t("account_actions")}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button
                startIcon={<DemoIcon />}
                href="/accounts/demo"
                variant="outlined"
              >
                {t("create_demo")}
              </Button>
              <Button
                startIcon={<LiveIcon />}
                href="/accounts/live"
                variant="outlined"
                disabled={disabled}
              >
                {t("create_live")}
              </Button>
            </Stack>
          </Paper>

          {/* Transaction Actions */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              {t("transactions")}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button
                startIcon={<DepositIcon />}
                href="/deposit"
                variant="outlined"
                disabled={disabled}
              >
                {t("deposit_now")}
              </Button>
              <Button
                startIcon={<WithdrawIcon />}
                href="/withdraw"
                variant="outlined"
                disabled={disabled}
              >
                {t("withdraw_now")}
              </Button>
            </Stack>
          </Paper>

          {/* Documents */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              {t("documents")}
            </Typography>
            <Button
              startIcon={<KycIcon />}
              onClick={handleKycDownload}
              variant="outlined"
              disabled={disabled}
            >
              {t("kyc_pdf_download")}
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
}
