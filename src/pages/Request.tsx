import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Typography,
  Container,
  TextField,
  Button,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useAppDispatch } from "@/redux/hooks";
import { useNavigate } from "react-router-dom";
import HomeFooter from "@/components/HomeFooter";
import HomeHeader from "@/components/HomeHeader";
import CustomError from "@/components/ui/CustomError";
import CustomNotification from "@/components/ui/CustomNotification";
import { requestPasswordReset } from "@/redux/slices/authSlice";

interface FormData {
  email: string;
}

const RequestPassword: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [errorMessage, setErrorMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [resetDisabled, setResetDisabled] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false);

  const [formData, setFormData] = useState<FormData>({ email: "" });
  const [formError, setFormError] = useState({ email: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError((prev) => ({ ...prev, [name]: "" }));
  };

  const validateInput = () => {
    let errors = { email: "" };
    let isValid = true;

    if (!formData.email.trim()) {
      errors.email = t("email_is_required");
      isValid = false;
    } else {
      const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
      if (!emailRegex.test(formData.email)) {
        errors.email = t("invalid_email");
        isValid = false;
      }
    }

    setFormError(errors);
    return isValid;
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!validateInput()) return;
      setResetDisabled(true);

      // Dispatch the password reset request thunk
      const response = await dispatch(
        requestPasswordReset({
          email: formData.email,
          action: "requestPasswordReset",
        })
      ).unwrap();

      // Instead of immediate redirection, display a success notification
      if (response.data && response.data.message) {
        setSuccessMessage(t(response.data.message));
        setOpenSuccessSnackbar(true);
        // After 3 seconds, close the notification and redirect (adjust redirect as needed)
        setTimeout(() => {
          setOpenSuccessSnackbar(false);
          navigate(response.redirect || "/login");
        }, 3000);
      } else {
        navigate(response.redirect || "/login");
      }
    } catch (error: any) {
      setResetDisabled(false);
      setErrorMessage(t(error.detail || error.message));
      setOpenSnackbar(true);
      setTimeout(() => setOpenSnackbar(false), 3000);
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
      {/* MAIN CONTENT - RESET PASSWORD FORM */}
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

          {openSuccessSnackbar && (
            <CustomNotification
              message={successMessage}
              onClose={() => setOpenSuccessSnackbar(false)}
            />
          )}

          {openSnackbar && (
            <CustomError
              errorMessage={errorMessage}
              onClose={handleCloseSnackbar}
            />
          )}

          <form onSubmit={handleSubmit}>
            {/* Email Field Only */}
            <Box sx={{ mx: 4, mb: 4 }}>
              <TextField
                value={formData.email}
                error={!!formError.email}
                onChange={handleChange}
                fullWidth
                name="email"
                label={t("email_address")}
                aria-label={t("email_address")}
                variant="outlined"
                type="text"
              />
              {formError.email && (
                <Typography
                  variant="body2"
                  color="error"
                  sx={{ textAlign: "start" }}
                >
                  {formError.email}
                </Typography>
              )}
            </Box>

            {/* Submit Button */}
            <Box sx={{ mx: 4, mb: 2 }}>
              <Button
                type="submit"
                fullWidth
                disabled={resetDisabled}
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

export default RequestPassword;
