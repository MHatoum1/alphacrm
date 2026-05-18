// src/pages/User/ClientProfile/ResetPasswordPage.tsx
import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  IconButton,
  InputAdornment,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";

import { useTranslation } from "react-i18next";

import { useAppDispatch } from "@/redux/hooks";
import { resetPassword, resetPin } from "@/redux/slices/clientProfileSlice";
import CustomNotification from "@/components/ui/CustomNotification";
import CustomError from "@/components/ui/CustomError";
import { useOutletContext } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { useNavigate } from "react-router-dom";
interface PasswordForm {
  newPassword: string;
  confirmPassword: string;
}

interface PinForm {
  newPin: string;
  confirmPin: string;
}

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { reloadProfile } = useOutletContext<{ reloadProfile: () => void }>();
  // Snackbars
  const [openSuccess, setOpenSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [openError, setOpenError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const authUser = useSelector((s: RootState) => s.auth.user);
  /**── password form ─────────────────────────────────────────*/
  const {
    control: passControl,
    handleSubmit: handlePassSubmit,
    watch: watchPass,
    formState: { errors: passErrors },
  } = useForm<PasswordForm>();
  const [showPass, setShowPass] = useState(false);
  const [showPass2, setShowPass2] = useState(false);

  const onPasswordSubmit = async (vals: PasswordForm) => {
    try {
      if (vals.newPassword !== vals.confirmPassword) return;
      dispatch(resetPassword(vals.newPassword)).unwrap();
      setSuccessMsg(t("password_changed_successfully"));
      setOpenSuccess(true);
      reloadProfile(); // ✅ ensure ClientMenu gets fresh profile
      setTimeout(() => navigate("/userprofile", { replace: true }), 1000);
    } catch (err: any) {
      setErrorMsg(t(err.detail || err.message || "save_failed"));
      setOpenError(true);
      setTimeout(() => setOpenError(false), 3000);
    }
  };

  /**── PIN form ──────────────────────────────────────────────*/
  const {
    control: pinControl,
    handleSubmit: handlePinSubmit,
    watch: watchPin,
    formState: { errors: pinErrors },
  } = useForm<PinForm>();
  const [showPin, setShowPin] = useState(false);
  const [showPin2, setShowPin2] = useState(false);

  const onPinSubmit = async (vals: PinForm) => {
    try {
      if (!authUser?.userID) return;

      if (vals.newPin !== vals.confirmPin) return;
      await dispatch(resetPin(vals.newPin)).unwrap();
      setSuccessMsg(t("password_changed_successfully"));
      setOpenSuccess(true);
      reloadProfile(); // ✅ ensure ClientMenu gets fresh profile


      setTimeout(() => navigate("/userprofile", { replace: true }), 1000);
    } catch (err: any) {
      setErrorMsg(t(err.detail || err.message || "save_failed"));
      setOpenError(true);
      setTimeout(() => setOpenError(false), 3000);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{ p: { xs: 2, md: 3 }, border: `1px solid ${theme.palette.divider}` }}
    >
      <Typography
        variant="h6"
        sx={{
          mb: 3,
          pb: 1,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        {isMobile ? t("set_section_short") : t("set_section_full")}
      </Typography>

      {/* SNACKBARS */}
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

      <Grid container spacing={4}>
        {/* ─── Password Section ────────────────────── */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {isMobile ? t("password_short") : t("set_new_password")}
            </Typography>

            <Box
              component="form"
              noValidate
              onSubmit={handlePassSubmit(onPasswordSubmit)}
            >
              <Controller
                name="newPassword"
                control={passControl}
                rules={{ required: true, minLength: 8 }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type={showPass ? "text" : "password"}
                    label={t("new_password")} // "New Password"
                    fullWidth
                    margin="normal"
                    error={!!passErrors.newPassword}
                    helperText={
                      passErrors.newPassword
                        ? t("error_min_chars", { count: 8 }) // e.g. "Minimum 8 characters"
                        : ""
                    }
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPass((v) => !v)}
                            edge="end"
                          >
                            {showPass ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />

              <Controller
                name="confirmPassword"
                control={passControl}
                rules={{
                  required: true,
                  validate: (v) =>
                    v === watchPass("newPassword") ||
                    t("error_passwords_match"), // "Passwords must match"
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type={showPass2 ? "text" : "password"}
                    label={t("confirm_password")} // "Confirm Password"
                    fullWidth
                    margin="normal"
                    error={!!passErrors.confirmPassword}
                    helperText={passErrors.confirmPassword?.message as string}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPass2((v) => !v)}
                            edge="end"
                          >
                            {showPass2 ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />

              <Box textAlign="start" mt={2}>
                <Button type="submit" variant="contained">
                  {t("btn_save_password")} {/* "Save Password" */}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* ─── PIN Section ─────────────────────────── */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {isMobile ? t("pin_short") : t("set_withdrawal_pin")}
            </Typography>

            <Box
              component="form"
              noValidate
              onSubmit={handlePinSubmit(onPinSubmit)}
            >
              <Controller
                name="newPin"
                control={pinControl}
                rules={{ required: true, minLength: 4, maxLength: 4 }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type={showPin ? "text" : "password"}
                    label={t("new_pin")} // "New 4-digit PIN"
                    fullWidth
                    margin="normal"
                    error={!!pinErrors.newPin}
                    helperText={
                      pinErrors.newPin
                        ? t("error_pin_digits") // "4 digits required"
                        : ""
                    }
                    inputProps={{
                      inputMode: "numeric",
                      pattern: "[0-9]*",
                      maxLength: 4,
                    }}
                    onChange={(e) =>
                      field.onChange(e.target.value.replace(/\D/g, ""))
                    }
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPin((v) => !v)}
                            edge="end"
                          >
                            {showPin ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />

              <Controller
                name="confirmPin"
                control={pinControl}
                rules={{
                  required: true,
                  validate: (v) =>
                    v === watchPin("newPin") || t("error_pins_match"), // "PINs must match"
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type={showPin2 ? "text" : "password"}
                    label={t("confirm_pin")} // "Confirm PIN"
                    fullWidth
                    margin="normal"
                    error={!!pinErrors.confirmPin}
                    helperText={pinErrors.confirmPin?.message as string}
                    inputProps={{
                      inputMode: "numeric",
                      pattern: "[0-9]*",
                      maxLength: 4,
                    }}
                    onChange={(e) =>
                      field.onChange(e.target.value.replace(/\D/g, ""))
                    }
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPin2((v) => !v)}
                            edge="end"
                          >
                            {showPin2 ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />

              <Box textAlign="start" mt={2}>
                <Button type="submit" variant="contained">
                  {t("btn_save_pin")} {/* "Save PIN" */}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
}
