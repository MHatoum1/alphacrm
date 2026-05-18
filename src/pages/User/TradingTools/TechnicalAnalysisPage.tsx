// src\pages\User\TradingTools\TechnicalAnalysisPage.tsx
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchAnalystLink } from "@/redux/slices/analystSlice";
import { RootState } from "@/redux/store";
import { Box, CircularProgress, Typography, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import CustomError from "@/components/ui/CustomError";
import appearanceJSON from "@/assets/constants/appearance.json";
import { useTranslation } from "react-i18next";

export default function TechnicalAnalysisPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const { url, status, errorCode } = useAppSelector(
    (s: RootState) => s.analyst
  );
  const uid = JSON.parse(localStorage.getItem("user") || "{}").userID as string;
  const trialDays = appearanceJSON.analyst.trial;
  const { t, i18n } = useTranslation();
  const lang = ["en", "ar"].includes(i18n.language) ? i18n.language : "en";

  useEffect(() => {
    if (uid) dispatch(fetchAnalystLink({ user_id: uid }));
  }, [dispatch, uid]);

  if (status === "loading") {
    return (
      <Box textAlign="center" py={4}>
        <CircularProgress />
        <Typography mt={2}>{t("loading_technical_analysis")}</Typography>
      </Box>
    );
  }

  if (status === "failed") {
    let msg = t("technical_analysis_error_generic");

    if (errorCode === "not_verified") {
      msg = t("technical_analysis_error_not_verified");
    } else if (errorCode === "trial_expired") {
      msg = t("technical_analysis_error_trial_expired", { days: trialDays });
    }

    return (
      <CustomError
        errorMessage={msg}
        onClose={() => navigate("/dashboard/tradingcentral")}
      />
    );
  }

  if (!url) {
    return null;
  }

  return (
    <Box
      sx={{
        "& iframe": {
          width: "100%",
          height: 1300,
          border: 0,
          backgroundColor: theme.palette.background.paper,
        },
      }}
    >
      <iframe
        src={url}
        title={t("technical_analysis_iframe_title")}
        className={`scaled scaled-${lang}`}
      >
        {t("technical_analysis_iframe_fallback")}
      </iframe>
    </Box>
  );
}
