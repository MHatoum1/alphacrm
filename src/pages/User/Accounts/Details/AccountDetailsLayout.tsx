// src/pages/User/Accounts/Details/AccountDetailsLayout.tsx
import { Tab, Tabs, Box, Paper, CircularProgress } from "@mui/material";
import { useParams, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchAccountDetail } from "@/redux/slices/accountDetailSlice";

export default function AccountDetailsLayout() {
  const { uid = "" } = useParams<"uid">();
  const loc = useLocation();
  const nav = useNavigate();
  const dispatch = useAppDispatch();

  const { data, status } = useAppSelector((s) => s.accountDetails);

  /* load meta once */
  useEffect(() => {
    dispatch(fetchAccountDetail(uid));
  }, [uid, dispatch]);

  /* show spinner while loading */
  if (status === "loading" || !data)
    return (
      <Box textAlign="center" mt={4}>
        <CircularProgress />
      </Box>
    );

  /* ----- build the tab list exactly like the old PHP ----- */
  const links = data.isGlobal
    ? [
        ["internal_transfer", "Internal Transfer"],
        ["deposit", "Deposit"],
        ["withdrawals", "Withdrawals"],
      ]
    : [
        ["transactions", "Transactions"],
        ...(data.type !== "demo" ? [["trades", "Open Trades"]] : []),
        ["history", "Trades History"],
        ...(data.type === "demo" && !data.campaignIsGameOfSkills
          ? [["fund_demo_account", "Top-up Demo"]]
          : []),
        ["security", "Account Password"],
      ];

  /* keep the active tab in sync with the url */
  /* base url never changes -> avoids chained paths */
  const base = `/accounts/detailed/${uid}`;

  const current = loc.pathname.replace(base + "/", "") || links[0][0];

  return (
    <Paper sx={{ p: 2 }}>
      <b>{data.login}</b>&nbsp;|&nbsp;{data.type.toUpperCase()} ({data.currency}
      )
      <Tabs
        sx={{ mt: 1 }}
        value={current}
        onChange={(_, v) => nav(base + "/" + v, { replace: true })}
        variant="scrollable"
        allowScrollButtonsMobile
      >
        {links.map(([slug, label]) => (
          <Tab key={slug} value={slug} label={label} />
        ))}
      </Tabs>
      <Box sx={{ mt: 3 }}>
        <Outlet />
      </Box>
    </Paper>
  );
}
