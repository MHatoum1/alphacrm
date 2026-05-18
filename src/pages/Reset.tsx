import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Typography,
  Container,
  TextField,
  Button,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useAppDispatch } from "@/redux/hooks";
import { useNavigate, useParams } from "react-router-dom";

import HomeFooter from "@/components/HomeFooter";
import HomeHeader from "@/components/HomeHeader";
import CustomError from "@/components/ui/CustomError";
import CustomNotification from "@/components/ui/CustomNotification";
import { resetPasswordAction } from "@/redux/slices/authSlice";

const ResetPassword: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // token is passed as a route param, e.g. /resetpassword/:token
  const { token } = useParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [openError, setOpenError] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [openSuccess, setOpenSuccess] = useState(false);

  const [submitDisabled, setSubmitDisabled] = useState(false);

  // Simple validation
  const validatePasswords = () => {
    if (!password || !confirmPassword) {
      setErrorMessage(t("both_passwords_required"));
      setOpenError(true);
      return false;
    }
    if (password !== confirmPassword) {
      setErrorMessage(t("passwords_do_not_match"));
      setOpenError(true);
      return false;
    }
    if (password.length < 8) {
      setErrorMessage(t("password_min_length"));
      setOpenError(true);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePasswords()) return;

    setSubmitDisabled(true);

    try {
      // Dispatch new password to the server along with the token
      const response = await dispatch(
        resetPasswordAction({ token, password })
      ).unwrap();

      // If the server returns a success message, display it then redirect
      if (response.data && response.data.message) {
        setSuccessMessage(t(response.data.message));
        setOpenSuccess(true);

        // Show success for 3 seconds, then redirect (default to /login if not provided)
        setTimeout(() => {
          setOpenSuccess(false);
          navigate(response.redirect || "/login");
        }, 3000);
      } else {
        navigate(response.redirect || "/login");
      }
    } catch (error: any) {
      setSubmitDisabled(false);
      setErrorMessage(
        t(error.detail || error.message || "Error setting password")
      );
      setOpenError(true);
      setTimeout(() => setOpenError(false), 3000);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
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
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: { xs: 2, md: 4 },
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 850,
            
            borderRadius: 2,
            p: { xs: 2, md: 3 },
            backgroundColor: theme.palette.background.paper,
          }}
        >
          {/* Title */}
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography
              variant="h3"
              sx={{ fontSize: isMobile ? 24 : 32, fontWeight: "bold", mb: 1 }}
            >
              {t("reset_password")}
            </Typography>
          </Box>

          {/* Notifications */}
          {openSuccess && (
            <CustomNotification
              message={successMessage}
              onClose={() => setOpenSuccess(false)}
            />
          )}
          {openError && (
            <CustomError
              errorMessage={errorMessage}
              onClose={() => setOpenError(false)}
            />
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* New Password Field with Show/Hide */}
            <Box sx={{ mx: 4, mb: 4, position: "relative" }}>
              <TextField
                fullWidth
                type={showPassword ? "text" : "password"}
                label={t("new_password")}
                name="newPassword"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <IconButton
                onClick={() => setShowPassword(!showPassword)}
                sx={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </Box>

            {/* Confirm Password Field with Show/Hide */}
            <Box sx={{ mx: 4, mb: 4, position: "relative" }}>
              <TextField
                fullWidth
                type={showConfirmPassword ? "text" : "password"}
                label={t("confirm_password")}
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <IconButton
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                sx={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              >
                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </Box>

            <Box sx={{ mx: 4, mb: 2 }}>
              <Button
                type="submit"
                fullWidth
                disabled={submitDisabled}
                variant="contained"
                sx={{
                  color: theme.palette.common.white,
                  fontSize: 16,
                  py: 1.2,
                }}
              >
                {t("reset_password")}
              </Button>
            </Box>
            <Box sx={{ textAlign: "center", mb: 3 }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
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
          </form>
        </Box>
      </Container>
      <HomeFooter />
    </Box>
  );
};

export default ResetPassword;
