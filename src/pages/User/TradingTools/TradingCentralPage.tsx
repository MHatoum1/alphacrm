// src\pages\User\TradingTools\TradingCentralPage.tsx
import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchTradingCentralStatus } from "@/redux/slices/tradingCentralSlice";
import { RootState } from "@/redux/store";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Link,
  Paper,
  useTheme,
} from "@mui/material";
import appearanceJSON from "@/assets/constants/appearance.json";
import { useTranslation } from "react-i18next";

export default function TradingCentralPage() {
  const dispatch = useAppDispatch();
  const { verified, deposited, accessFlag, status } = useAppSelector(
    (s: RootState) => s.tradingCentral
  );
  const theme = useTheme();
  const user = useAppSelector((s: RootState) => s.auth.user);
  const uid = user?.userID;
  const { t } = useTranslation();

  const trialDays = appearanceJSON.tradingcentral.trial;

  useEffect(() => {
    if (uid) {
      dispatch(fetchTradingCentralStatus({ user_id: uid }));
    }
  }, [dispatch, uid]);

  if (status === "loading") {
    return (
      <Box textAlign="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!verified && !accessFlag) {
    return (
      <Typography color="error">
        {t("tradingcentral_verification_required")}
      </Typography>
    );
  }

  let notice: React.ReactNode = null;
  if (!accessFlag) {
    if (!deposited) {
      notice = (
        <Typography>
          {t("tradingcentral_trial_notice", { days: trialDays })}{" "}
          <Link href="/deposit">{t("fund")}</Link>{" "}
          {t("tradingcentral_trial_notice_end")}
        </Typography>
      );
    } else {
      notice = <Typography>{t("tradingcentral_unlimited_access")}</Typography>;
    }
  }

  return (
    <Paper
      elevation={3}
      sx={{
          borderRadius: "12px",
   backgroundColor: theme.palette.background.paper,
   color: theme.palette.text.primary,
   height: '100%',
   display: 'flex',
   flexDirection: 'column',
      }}
    >
      <Box sx={{ p: 3 }}>
        {notice}
        <Box
          sx={{
            mt: 2,
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Button variant="contained" href="/dashboard/analyst">
            {t("technical_analysis")}
          </Button>
          <Button variant="contained" href="/dashboard/calendar">
            {t("economic_calendar")}
          </Button>
          <Button
            variant="contained"
            href="https://mt.tradingcentral.com/download"
            target="TradingCentral"
          >
            {t("mt5_alpha_generation")}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
