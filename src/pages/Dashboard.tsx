// src/pages/Dashboard.tsx
import React, { useEffect, useMemo } from "react";
import { Box, Grid, Typography, useTheme, useMediaQuery } from "@mui/material";
import { GridColDef } from "@mui/x-data-grid";
import Overview, { OverviewItem } from "@/components/Overview";
import LinkRenderer from "@/components/ui/LinkRenderer";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchDashboardStats,
  fetchLatestProfiles,
  fetchLatestTransactions,
} from "@/redux/slices/dashboardSlice";
import ProfilesStatistics from "@/components/ProfilesStatistics";
import TransactionsStatistics from "@/components/TransactionsStatistics";
import { useTranslation } from "react-i18next";
import FixedPageDataGrid from "@/components/ui/FixedPageDataGrid";
import { useNavigate } from "react-router-dom";


export default function Dashboard() {
  const theme = useTheme();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { stats, latestProfiles, latestTransactions, status } = useAppSelector(
    (s) => s.dashboard
  );

  // load once
  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchLatestProfiles(10));
    dispatch(fetchLatestTransactions(10));
  }, [dispatch]);

  // overview
  const overviewItems: OverviewItem[] = useMemo(
    () => [
      {
        label: t("new_deposits"),
        value: stats.newDeposits,
        icon: "la la-donate",
        color: theme.palette.info.light,
        backgroundColor: theme.palette.info.main,
        onClick: () => navigate("/deposits/new"),
      },
      {
        label: t("new_withdrawals"),
        value: stats.newWithdrawals,
        icon: "la la-money-bill-alt",
        color: theme.palette.warning.light,
        backgroundColor: theme.palette.warning.main,
        onClick: () => navigate("/withdrawals/new"),
      },
      {
        label: t("new_users"),
        value: stats.newUsers,
        icon: "la la-user",
        color: theme.palette.secondary.light,
        backgroundColor: theme.palette.secondary.main,
        onClick: () => navigate("/profiles/nonactivated"),
      },
      {
        label: t("new_documents"),
        value: stats.newDocs,
        icon: "la la-toolbox",
        color: theme.palette.error.light,
        backgroundColor: theme.palette.error.main,
        onClick: () => navigate("/documents/new"),
      },
    ],
    [stats, theme, t, navigate]
  );

  // rows
  const profilesRows = useMemo(
    () => latestProfiles.map((r, i) => ({ id: i, ...r })),
    [latestProfiles]
  );
  const txnRows = useMemo(
    () => latestTransactions.map((r, i) => ({ id: i, ...r })),
    [latestTransactions]
  );

  // column factories
  const buildProfileCols = ({ mobile }: { mobile: boolean }): GridColDef[] => {
    if (mobile) {
      return [
        {
          field: "email",
          headerName: t("info"),
          flex: 2,
          renderCell: (p) => (
            <Box>
              <Typography variant="body1" fontWeight="bold">
                <LinkRenderer htmlString={p.row.email} openInNewTab={false} />
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {p.row.fullName}
              </Typography>
            </Box>
          ),
        },
        {
          field: "details",
          headerName: t("details"),
          flex: 1,
          renderCell: (p) => {
            const el = document.createElement("div");
            el.innerHTML = p.row.status;
            const txt = (el.textContent || el.innerText || "").toUpperCase();
            const key = txt.toLowerCase().replace(/\s+/g, "_");
            const bg =
              theme.palette.status[key]?.bg ?? theme.palette.status.default.bg;
            const fg =
              theme.palette.status[key]?.color ??
              theme.palette.status.default.color;
            return (
              <Box display="flex" flexDirection="column">
                <Box
                  sx={{
                    backgroundColor: bg,
                    color: fg,
                    borderRadius: 1,
                    px: 1,
                    textAlign: "center",
                  }}
                >
                  <Typography variant="body2" fontWeight="bold">
                    {txt}
                  </Typography>
                </Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  {p.row.created}
                </Typography>
              </Box>
            );
          },
        },
      ];
    }
    return [
      {
        field: "email",
        headerName: t("email"),
        flex: 2,
        renderCell: (p) => <LinkRenderer htmlString={p.value} openInNewTab={false} />,
      },
      { field: "fullName", headerName: t("name"), flex: 1 },
      { field: "country", headerName: t("country"), flex: 1 },
      { field: "created", headerName: t("created"), flex: 1 },
      {
        field: "status",
        headerName: t("status"),
        flex: 1,
        renderCell: (p) => {
          const el = document.createElement("div");
          el.innerHTML = p.value;
          const txt = (el.textContent || el.innerText || "").toUpperCase();
          const key = txt.toLowerCase().replace(/\s+/g, "_");
          const bg =
            theme.palette.status[key]?.bg ?? theme.palette.status.default.bg;
          const fg =
            theme.palette.status[key]?.color ??
            theme.palette.status.default.color;
          return (
            <Box
              sx={{
                backgroundColor: bg,
                color: fg,
                  borderRadius: "8px",
               padding: "10px 10px",
                textAlign: "center",
                minWidth: "90px",
              }}
            >
              <Typography variant="body2" fontWeight="bold">
                {txt}
              </Typography>
            </Box>
          );
        },
      },
    ];
  };

  const buildTxnCols = ({ mobile }: { mobile: boolean }): GridColDef[] => {
    if (mobile) {
      return [
        {
          field: "profile",
          headerName: t("profile"),
          flex: 2,
          renderCell: (p) => (
            <Box>
              <Typography variant="body1" fontWeight="bold">
                <LinkRenderer htmlString={p.row.profile}  openInNewTab={false}/>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {p.row.account}
              </Typography>
            </Box>
          ),
        },
        {
          field: "details",
          headerName: t("details"),
          flex: 1,
          renderCell: (p) => {
            const isDep = p.row.type === "deposit";
            return (
              <Box display="flex" flexDirection="column">
                <Typography
                  variant="body1"
                  fontWeight="bold"
                  color={
                    isDep
                      ? theme.palette.success.main
                      : theme.palette.error.main
                  }
                >
                  {p.row.amount}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  {p.row.created}
                </Typography>
              </Box>
            );
          },
        },
      ];
    }
    return [
      {
        field: "profile",
        headerName: t("profile"),
        flex: 1,
        renderCell: (p) => <LinkRenderer htmlString={p.value} openInNewTab={false} />,
      },
      { field: "account", headerName: t("account"), flex: 1 },
      {
        field: "amount",
        headerName: t("amount"),
        flex: 1,
        align: "right",
        renderCell: (p) => {
          const isDep = p.row.type === "deposit";
          return (
            <Typography
              fontWeight="bold"
              sx={{
                borderRadius: "8px",
                padding: "10px 10px",
                textAlign: "center",
                minWidth: "90px",}}
              color={
                isDep ? theme.palette.success.main : theme.palette.error.main
              }
            >
              {p.value}
            </Typography>
          );
        },
      },
      { field: "created", headerName: t("created"), flex: 1 },
      // status & processed
      ...(["status", "processed"] as const).map((f) => ({
        field: f,
        headerName: t(f),
        flex: 1,
        renderCell: (p: any) => {
          const el = document.createElement("div");
          el.innerHTML = p.value;
          const txt = (el.textContent || el.innerText || "").toUpperCase();
          const key = txt.toLowerCase().replace(/\s+/g, "_");
          const bg =
            theme.palette.status[key]?.bg ?? theme.palette.status.default.bg;
          const fg =
            theme.palette.status[key]?.color ??
            theme.palette.status.default.color;
          return (
            <Box
              sx={{
                backgroundColor: bg,
                color: fg,
                borderRadius: "8px",
                padding: "10px 10px",
                textAlign: "center",
                minWidth: "90px",
              }}
            >
              <Typography variant="body2" fontWeight="bold">
                {txt}
              </Typography>
            </Box>
          );
        },
      })),
    ];
  };

  // memoize both desktop & mobile sets
  const profileDesktopCols = useMemo(
    () => buildProfileCols({ mobile: false }),
    [theme, t]
  );
  const profileMobileCols = useMemo(
    () => buildProfileCols({ mobile: true }),
    [theme, t]
  );
  const txnDesktopCols = useMemo(
    () => buildTxnCols({ mobile: false }),
    [theme, t]
  );
  const txnMobileCols = useMemo(
    () => buildTxnCols({ mobile: true }),
    [theme, t]
  );

  // loading?
  if (status === "loading") {
    return <Typography>Loading…</Typography>;
  }

  // render
  return (
    <Box sx={{ p: theme.spacing(3) }}>
      <Overview overviewItems={overviewItems} />

      <Grid container spacing={2} mt={3}>
        <Grid item xs={12} md={6}>
          <ProfilesStatistics
            series={Object.values(stats.profileDistribution)}
            labels={Object.keys(stats.profileDistribution).map((l) => t(l))}
            colors={[
              theme.palette.status.limited.color,
              theme.palette.status.green.color,
              theme.palette.status.gray.color,
              theme.palette.status.failed.color,
              theme.palette.status.verified.color,
            ]}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TransactionsStatistics
            depositsSum={stats.depositsSum || []}
            withdrawalsSum={stats.withdrawalsSum || []}
          />
        </Grid>

        {/* latest profiles */}
        <Grid item xs={12} md={6}>
          <FixedPageDataGrid
            title={t("latest_profiles")}
            rows={profilesRows}
            columns={profileDesktopCols}
            mobileColumns={profileMobileCols}
            rowCount={profilesRows.length}
          />
        </Grid>

        {/* last transactions */}
        <Grid item xs={12} md={6}>
          <FixedPageDataGrid
            title={t("last_transactions")}
            rows={txnRows}
            columns={txnDesktopCols}
            mobileColumns={txnMobileCols}
            rowCount={txnRows.length}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
