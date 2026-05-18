// src/pages/ClientActivationPage.tsx
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  resendCode,
  activateProfile,
  clearMsg,
} from "@/redux/slices/activationSlice";
import CustomNotification from "@/components/ui/CustomNotification";
import CustomError from "@/components/ui/CustomError";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export default function ClientActivationPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  /* ---------------------------------------------------------------- */
  /* ▸ logged-in user                                                 */
  /* ---------------------------------------------------------------- */
  const stored = localStorage.getItem("user");
  const user = stored ? JSON.parse(stored) : null;
  const uid = user?.userID as string | undefined;
  const email = user?.email as string | undefined;

  /* ---------------------------------------------------------------- */
  /* ▸ local state                                                   */
  /* ---------------------------------------------------------------- */
  const [code, setCode] = useState("");

  /* ---------------------------------------------------------------- */
  /* ▸ redux                                                         */
  /* ---------------------------------------------------------------- */
  const dispatch = useAppDispatch();
  const { status, msg, error, redirect } = useAppSelector((s) => s.activation);

  /* ---------------------------------------------------------------- */
  /* ▸ redirect after successful activation                           */
  /*    show the notification first → wait 1 s, then navigate         */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    if (redirect) {
      const id = setTimeout(() => navigate(redirect, { replace: true }), 1000);
      return () => clearTimeout(id);
    }
  }, [redirect, navigate]);

  /* ---------------------------------------------------------------- */
  /* ▸ guard – no logged-in user                                      */
  /* ---------------------------------------------------------------- */
  if (!uid || !email) {
    return (
      <Box mt={4} textAlign="center">
        <Typography color="error">{t("user_not_logged_in")}</Typography>
      </Box>
    );
  }

  /* ---------------------------------------------------------------- */
  /* ▸ render                                                         */
  /* ---------------------------------------------------------------- */
  return (
    <Paper elevation={0} sx={{ p: { xs: 2, md: 4 } }}>
      <Box sx={{ p: { xs: 2 } }}>
        <Typography variant="h6" mb={3}>
          {t("activate_your_profile")}
        </Typography>

        {/* global toasts */}
        {msg && (
          <CustomNotification
            message={t(msg)}
            onClose={() => dispatch(clearMsg())}
          />
        )}
        {error && (
          <CustomError
            errorMessage={t(error)}
            onClose={() => dispatch(clearMsg())}
          />
        )}

        {/* email row -------------------------------------------------- */}
        <Grid container spacing={2} mb={2} alignItems="center">
          <Grid item xs={12} md={9}>
            <TextField
              fullWidth
              label={t("email")}
              size="small"
              value={email}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="contained"
              disabled={status === "loading"}
              onClick={() => dispatch(resendCode({ user_id: uid, email }))}
            >
              {t("resend_code")}
            </Button>
          </Grid>
        </Grid>

        {/* activation-code row ---------------------------------------- */}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={9}>
            <TextField
              fullWidth
              label={t("activation_code")}
              size="small"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/[^a-z0-9]/gi, ""))
              }
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="contained"
              disabled={status === "loading" || !code.trim()}
              onClick={() =>
                dispatch(activateProfile({ user_id: uid, code: code.trim() }))
              }
            >
              {status === "loading" ? (
                <CircularProgress size={24} />
              ) : (
                t("activate")
              )}
            </Button>
          </Grid>
        </Grid>

        {/* helper notes ----------------------------------------------- */}
        <Box component="ul" sx={{ mt: 3, pl: 3 }}>
          <li>{t("activation_hint_1")}</li>
          <li>{t("activation_hint_2")}</li>
          <li>{t("activation_hint_3")}</li>
        </Box>
      </Box>
    </Paper>
  );
}
