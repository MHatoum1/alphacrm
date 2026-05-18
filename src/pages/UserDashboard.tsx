// src/pages/User/Dashboard/UserDashboard.tsx

import { Box, Grid, Paper, Typography, useTheme } from "@mui/material";
import { Outlet, useMatch } from "react-router-dom";
import { useTranslation } from "react-i18next";

import TradingCentralPage from "@/pages/User/TradingTools/TradingCentralPage";
import AccountsTablePreview from "./User/Dashboard/AccountsTablePreview";
import WalletsTablePreview from "./User/Dashboard/WalletsTablePreview";
import ReferAFriendPreview from "./User/Dashboard/ReferAFriendPreview";
import TransactionsTablePreview from "./User/Dashboard/TransactionsTablePreview";
import MessagesPreview from "./User/Dashboard/MessagesPreview";

export default function UserDashboard() {
  const theme = useTheme();
  const { t } = useTranslation();
  const isDetail = useMatch("/dashboard/:tab");

  // if we're on a nested tab (like /dashboard/analyst), render it
  if (isDetail) {
    return <Outlet />;
  }

  return (
    <Box
      sx={{
        p: theme.spacing(3),
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
      }}
    >
      {/* first row: Accounts + TradingTools */}
      <Grid container spacing={3} alignItems="stretch">
        <Grid item xs={12} md={6} >
          <AccountsTablePreview limit={5} />
        </Grid>
         <Grid item xs={12} md={6} >
           <Paper elevation={2} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              {t("trading_tools")}
            </Typography>
            <TradingCentralPage />
          </Paper>
        </Grid>
      </Grid>

      {/* second row: Wallets + Refer a Friend */}
      <Grid container spacing={3} mt={1} alignItems="stretch">
        <Grid item xs={12} md={6}  >  
          <WalletsTablePreview limit={3} />
        </Grid>
        <Grid item xs={12} md={6} >
          <TransactionsTablePreview limit={5} />
        </Grid>
      </Grid>

      <Grid container spacing={3} mt={1} alignItems="stretch">
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              {t("refer_a_friend")}
            </Typography>
            <ReferAFriendPreview />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <MessagesPreview limit={2} />
        </Grid>
      </Grid>
    </Box>
  );
}
