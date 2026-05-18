// src/pages/User/ClientProfile/ClientMenu.tsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import {
  Tabs,
  Tab,
  Box,
  Alert,
  Button,
  Paper,
  Typography,
  useTheme,
  useMediaQuery,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircleOutline";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import LockIcon from "@mui/icons-material/Lock";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  loadClientProfile,
  requestVerification,
} from "@/redux/slices/clientProfileSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import CustomNotification from "@/components/ui/CustomNotification";
import CustomError from "@/components/ui/CustomError";

export default function ClientMenu() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const theme = useTheme();
  // <-- detect mobile
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { pathname } = useLocation();
  const navigate = useNavigate();

  // pull user ID out of localStorage
  const storedUser = localStorage.getItem("user") || "";
  const user = storedUser ? JSON.parse(storedUser) : null;
  if (!user?.userID) throw new Error("User not found in localStorage");
  const user_id = user.userID;

  // profile + status flags
  const profile = useSelector((s: RootState) => s.clientProfile.data);
  const status = useAppSelector((s) => s.clientProfile.status);

  // load / reload profile
  useEffect(() => {
    dispatch(loadClientProfile({ user_id }));
  }, [dispatch, user_id]);

  const [openSuccess, setOpenSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [openError, setOpenError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleVerify = async () => {
    try {
      await dispatch(requestVerification()).unwrap();
      setSuccessMsg(t("verification_sent_success"));
      setOpenSuccess(true);
      dispatch(loadClientProfile({ user_id }));
    } catch (err: any) {
      const msg = typeof err === "string" ? err : err.message;
      setErrorMsg(t(msg));
      setOpenError(true);
    }
  };

  const reloadProfile = useCallback(() => {
    dispatch(loadClientProfile({ user_id }));
  }, [dispatch, user_id]);

  useEffect(() => {
    if (status === "idle" || !profile.id) {
      dispatch(loadClientProfile({ user_id }));
    }
  }, [dispatch, user_id, status, profile.id]);

  // verification state
  const showRequestVerification =
    profile.completed && !profile.toverify && !profile.verified;
  const showUnderReview = profile.toverify && !profile.verified;

  // icons
  const IconFilled = <CheckCircleIcon color="success" fontSize="small" />;
  const IconPending = <HelpOutlineIcon color="warning" fontSize="small" />;
  const IconSecure = <LockIcon color="error" fontSize="small" />;
  const IconInfo = <InfoOutlinedIcon color="info" fontSize="small" />;
  const flagIcon = (done?: number | boolean) =>
    done ? IconFilled : IconPending;

  /**
   * Shorthand that tells us when we can safely read any
   * “business” fields (activated, verified, …) from `profile`.
   */
  const profileReady = status === "succeeded" && Boolean(profile.id);

  // ─── 1️⃣  decide initial tab *after* profile is ready ─────────────
  const firstTab = useMemo<string | undefined>(() => {
    if (!profileReady) return undefined; // <- de‑fer
    return profile.activated ? "overview" : "activatepage";
  }, [profileReady, profile.activated]);

  const firstLabel = useMemo<string | undefined>(() => {
    if (!profileReady) return undefined;
    return profile.activated ? t("overview") : t("activate");
  }, [profileReady, profile.activated, t]);

  // build tabs array
  const tabs = useMemo(() => {
    if (!profile.id) return [];
    const verified = !!profile.verified;
    const common = [{ key: firstTab, label: firstLabel, icon: IconInfo }];
    const password = {
      key: "password",
      label: t("password"),
      icon: IconSecure,
    };

    if (verified) {
      return [
        ...common,
        {
          key: "agreements",
          label: t("agreements"),
          icon: flagIcon(profile.agreements_details),
        },
        {
          key: "documents",
          label: t("documents"),
          icon: flagIcon(profile.documents_details),
        },
        password,
      ];
    }

    return [
      ...common,
      {
        key: "personal",
        label: t("personal"),
        icon: flagIcon(profile.personal_details),
      },
      {
        key: "employment",
        label: t("employment"),
        icon: flagIcon(profile.employment_details),
      },
      {
        key: "trading",
        label: t("trading"),
        icon: flagIcon(profile.trading_details),
      },
      {
        key: "documents",
        label: t("documents"),
        icon: flagIcon(profile.documents_details),
      },
      password,
    ];
  }, [profile, firstTab, firstLabel, t]);

  /**
   * Pick the last segment of the URL *iff* it matches one of our tab keys,
   * otherwise fall back to `firstTab`.  This guarantees we always give
   * MUI a value that exists among the children, eliminating the warning.
   */
  const currentTab = useMemo(() => {
    const slug = pathname.split("/").pop() || "";
    const validKeys = tabs.map((t) => t.key);
    return validKeys.includes(slug) ? slug : firstTab;
  }, [pathname, tabs, firstTab]);

  // ─── 2️⃣  automatic redirect only when profileReady ─────────────
  useEffect(() => {
    if (
      profileReady &&
      (pathname === "/userprofile" || pathname === "/userprofile/")
    ) {
      navigate(`/userprofile/${firstTab}`, { replace: true });
    }
  }, [profileReady, pathname, firstTab, navigate]);

  return (
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
      {/* ─── Tab Nav / Select for mobile ────────────────────────── */}
      {profileReady &&
        (isMobile ? (
          <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
            <InputLabel id="client-menu-select-label">
              {t("select_tab")}
            </InputLabel>
            <Select
              labelId="client-menu-select-label"
              value={currentTab}
              label={t("select_tab")}
              onChange={(e) => navigate(`/userprofile/${e.target.value}`)}
            >
              {tabs.map(({ key, label, icon }) => (
                <MenuItem key={key} value={key}>
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    {icon}
                    {label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <Paper
            elevation={0}
            sx={{ mb: 2, backgroundColor: theme.palette.background.paper }}
          >
            <Tabs
              variant="scrollable"
              scrollButtons="auto"
              value={currentTab}
              textColor="primary"
              indicatorColor="primary"
            >
              {tabs.map(({ key, label, icon }) => (
                <Tab
                  key={key}
                  value={key}
                  component={NavLink}
                  to={`/userprofile/${key}`}
                  sx={{ textTransform: "none", fontWeight: 600, minWidth: 120 }}
                  label={
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      {icon}
                      <span>{label}</span>
                    </Box>
                  }
                />
              ))}
            </Tabs>
          </Paper>
        ))}

      {/* ─── Notifications ─────────────────────────────────────── */}
      {openSuccess && (
        <CustomNotification
          message={successMsg}
          onClose={() => setOpenSuccess(false)}
        />
      )}
      {openError && (
        <CustomError
          errorMessage={errorMsg}
          onClose={() => setOpenError(false)}
        />
      )}

      {/* ─── Verification Alerts ───────────────────────────────── */}
      {(showRequestVerification || showUnderReview) && (
        <Paper
          elevation={1}
          sx={{
            mb: 2,
            p: { xs: 1, sm: 2 },
            backgroundColor: theme.palette.background.paper,
          }}
        >
          {showRequestVerification && (
            <Alert
              severity="info"
              variant="outlined"
              sx={{ mb: showUnderReview ? 2 : 0, p: { xs: 1, sm: 2 } }}
            >
              <Typography
                variant="h6"
                sx={{
                  pb: 1,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  color: theme.palette.text.secondary,
                }}
              >
                {t("time_to_be_verified")}
              </Typography>
              <Typography
                variant="body2"
                sx={{ mt: 1, color: theme.palette.text.secondary }}
              >
                {t("verification_prompt")}
              </Typography>
              <Box mt={2}>
                <Button
                  variant="contained"
                  size="small"
                  fullWidth={isMobile}
                  onClick={handleVerify}
                  disabled={status === "loading"}
                >
                  {t("request_verification")}
                </Button>
              </Box>
            </Alert>
          )}

          {showUnderReview && (
            <Alert
              severity="info"
              variant="outlined"
              sx={{ p: { xs: 1, sm: 2 } }}
            >
              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.secondary }}
              >
                {t("under_review_message")}
              </Typography>
            </Alert>
          )}
        </Paper>
      )}

      {/* ─── Render whichever tab is active ─────────────────────── */}
      <Outlet context={{ reloadProfile }} />
    </Box>
  );
}
