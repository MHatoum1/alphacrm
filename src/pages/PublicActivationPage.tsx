// src/pages/PublicActivationPage.tsx
import {
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Container,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  resendActivationCode,
  activateAccount,
  clearMessage,
} from "@/redux/slices/publicActivationSlice";
import CustomNotification from "@/components/ui/CustomNotification";
import CustomError    from "@/components/ui/CustomError";
import HomeHeader     from "@/components/HomeHeader";   // 👈 NEW
import HomeFooter     from "@/components/HomeFooter";   // 👈 NEW

export default function PublicActivationPage() {
  const { t }          = useTranslation();
  const dispatch       = useAppDispatch();
  const navigate       = useNavigate();

  const { token }      = useParams<{ token?: string }>();
  const { status, msg, error, redirect } = useAppSelector(
    (s) => s.publicActivation
  );

  /* theme helpers for responsive paddings (same as login / register) */
  const theme     = useTheme();
  const isMobile  = useMediaQuery(theme.breakpoints.down("md"));

  /* -------------------------------------------------------------- */
  /* local form state (email still editable – code auto-filled)     */
  /* -------------------------------------------------------------- */
  const [email, setEmail] = useState("");
  const [code,  setCode]  = useState("");

  /* automatic activation once a /:token is present ---------------- */
  useEffect(() => {
    if (token) {
      setCode(token);
      dispatch(activateAccount({ acode: token }));
      /* strip token from the address bar, purely cosmetic */
      navigate("/activate", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  /* redirect after success --------------------------------------- */
  useEffect(() => {
    if (redirect) {
      const id = setTimeout(() => navigate(redirect, { replace: true }), 1000);
      return () => clearTimeout(id);
    }
  }, [redirect, navigate]);

  /* -------------------------------------------------------------- */
  /* UI                                                             */
  /* -------------------------------------------------------------- */
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.palette.background.default,
        color:           theme.palette.text.primary,
      }}
    >
      <HomeHeader />

      <Container
        maxWidth="md"
            sx={{
          paddingLeft: "0 !important",
          "@media (min-width:1340px)": {
            paddingLeft: "0 !important",
          },
 
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: { xs: 2, md: 4 },
        }}
      >
        {/* main card */}
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 850,
            
            borderRadius: 2,
            p: { xs: 2, md: 3 },
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <Typography
            variant="h3"
            textAlign={"center"}
            sx={{ fontSize: isMobile ? 24 : 32, fontWeight: "bold", mb: 3 }}
          >
            {t("activate_your_profile")}
          </Typography>

          {/* global toasts */}
          {msg && (
            <CustomNotification
              message={t(msg)}
              onClose={() => dispatch(clearMessage())}
            />
          )}
          {error && (
            <CustomError
              errorMessage={t(error)}
              onClose={() => dispatch(clearMessage())}
            />
          )}

          {/* 1️⃣ e-mail + resend ------------------------------------------------ */}
          <Grid container spacing={2} alignItems="left" mb={3}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label={t("email")}
                size="small"
                value={email}
                onChange={(e) => setEmail(e.target.value.trim())}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                variant="contained"
                disabled={!email}
                onClick={() => dispatch(resendActivationCode({ email }))}
              >
                {t("resend_code")}
              </Button>
            </Grid>
          </Grid>

          {/* 2️⃣ code input + activate ---------------------------------------- */}
          <Grid container spacing={2} alignItems="left">
            <Grid item xs={12} md={8}>
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
            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                variant="contained"
                disabled={!code}
                onClick={() => dispatch(activateAccount({ acode: code }))}
              >
                {status === "loading" ? (
                  <CircularProgress size={24} />
                ) : (
                  t("activate")
                )}
              </Button>
            </Grid>
          </Grid>

          {/* helper list ------------------------------------------------------ */}
          <Box component="ul" sx={{ mt: 3, pl: 3 }}>
            <li>{t("activation_hint_1")}</li>
            <li>{t("activation_hint_2")}</li>
            <li>{t("activation_hint_3")}</li>
          </Box>
          <Box sx={{ textAlign: "center", mt: 3 }}>
                        <Typography variant="body1">
                          {t("already_have_account")}{" "}
                          <Box
                            component="span"
                            sx={{
                              color: theme.palette.primary.main,
                              cursor: "pointer",
                              fontWeight: "bold",
                              textDecoration: "underline",
                            }}
                            onClick={() => navigate("/login")}
                          >
                            {t("login")}
                          </Box>
                        </Typography>
                      </Box>
        </Paper>
        
      </Container>

      <HomeFooter />
    </Box>
  );
}
