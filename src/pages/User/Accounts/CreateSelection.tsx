// src/pages/User/Accounts/CreateSelection.tsx
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  // useMediaQuery,
  // useTheme,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useEffect } from "react";
import { fetchAccountTemplates } from "@/redux/slices/accountTemplatesSlice";
import type { Template } from "@/redux/slices/accountTemplatesSlice";
import { Link as RouterLink, useParams } from "react-router-dom";
export default function CreateSelection() {
  const { mode } = useParams<"mode">(); // 'live' | 'demo' | undefined
  const showLive = mode !== "demo"; // no param  ⇒  both true
  const showDemo = mode !== "live";

  const { t } = useTranslation();
  // const theme = useTheme();
  // const downMd = useMediaQuery(theme.breakpoints.down("md"));
  const dispatch = useAppDispatch();

  /* ── 2. fetch & select templates (unchanged fetch) ── */
  const {
    live = [],
    demo = [],
    status = "idle",
  } = useAppSelector((s) => s.accountTemplates ?? {});

  /* slice **before** rendering */
  const liveCards = showLive ? live : [];
  const demoCards = showDemo ? demo : [];

  // get current userID from localStorage (or from auth slice)
  const stored = localStorage.getItem("user");
  const authUser = stored ? JSON.parse(stored) : null;
  const user_id = authUser?.userID;

  useEffect(() => {
    if (!user_id || status !== "idle") return;
    dispatch(fetchAccountTemplates({ user_id }));
  }, [user_id, status, dispatch]);

  /* ---------- NEW: split once, memoised ---------- */

  /* ------- tiny card helper ------- */
  const Card = ({ tpl }: { tpl: Template }) => (
    <Paper
      sx={{
        p: 2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Box>
        <Typography variant="h6" gutterBottom textTransform="uppercase">
          {tpl.className}
        </Typography>
        <Typography variant="h6" gutterBottom textTransform="uppercase">
          {t("initial_deposit_from")} {tpl.initial}
        </Typography>
        <ul style={{ marginLeft: 16, marginTop: 8, paddingLeft: 0 }}>
          <li>
            {t("spreads_from")} {tpl.spread}
          </li>
          <li>
            {t("commission_from")} {tpl.commission}$
          </li>
          <li>
            {t("leverage_up_to")} {tpl.leverage}:1
          </li>
            <li>
            {t("mt5_vps_hosting")} {tpl.hosting}/ {t("month")}
          </li>
            <li>
            {t("no_limitations_strategies")} 
          </li>
        </ul>
      </Box>

      <Button
        component={RouterLink} // ✅ use the router
        to={`/accounts/create/${tpl.type}/${tpl.shortval}/${tpl.className}/${tpl.platform}`}
        variant={tpl.type === "demo" ? "outlined" : "contained"}
        fullWidth
        sx={{ mt: 2 }}
      >
        {tpl.type === "demo" ? t("open_demo") : t("open_live")}
      </Button>
    </Paper>
  );

  /* ------- whole grid ------- */
  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Paper
        sx={{
          p: 2,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h5" align="center">
          {t("choose_your_trading_account")}
        </Typography>
      </Paper>

      {/* LIVE  ───────────────────────────────────── */}
      {liveCards.length > 0 && (
        <Paper
          sx={{
            p: 2,
            mt: 2,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6" mb={1} align="center">
            {t("live_accounts")}
          </Typography>

          <Grid container spacing={2} mb={4}>
            {liveCards.map((tpl) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                key={tpl.shortval + tpl.platform}
              >
                <Card tpl={tpl} />
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* DEMO ───────────────────────────────────── */}
      {demoCards.length > 0 && (
        <Paper
          sx={{
            p: 2,
            mt: 2,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6" mb={1} align="center">
            {t("demo_accounts")}
          </Typography>

          <Grid container spacing={2}>
            {demoCards.map((tpl) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                key={tpl.shortval + tpl.platform}
              >
                <Card tpl={tpl} />
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {status === "loading" && (
        <Typography align="center" mt={4}>
          {t("loading")}…
        </Typography>
      )}
      {status === "failed" && (
        <Typography color="error" align="center" mt={4}>
          {t("failed_to_load_templates")}
        </Typography>
      )}
    </Box>
  );
}
