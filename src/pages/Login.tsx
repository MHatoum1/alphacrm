import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Typography,
  Container,
  TextField,
  Button,
  IconButton,
  Checkbox,
  FormControlLabel,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useAppDispatch } from "@/redux/hooks";
import { useNavigate } from "react-router-dom";
import {
  login,
  resendLogin2FA,
  verifyLogin2FA,
} from "@/redux/slices/authSlice";
import HomeFooter from "@/components/HomeFooter";
import HomeHeader from "@/components/HomeHeader";
import CustomError from "@/components/ui/CustomError";

interface FormData {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [errorMessage, setErrorMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [loginDisabled, setLoginDisabled] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [phase, setPhase] = useState<"creds" | "code">("creds");
  const [twofa, setTwofa] = useState<{ challengeToken: string; code: string }>({
    challengeToken: "",
    code: "",
  });
  const [resendCooldown, setResendCooldown] = useState(0);

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });

  const [formError, setFormError] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setFormError((prevError) => ({
      ...prevError,
      [name]: "",
    }));
  };

  const validateInput = () => {
    let errors = {
      email: "",
      password: "",
    };
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

    if (!formData.password.trim()) {
      errors.password = t("password_is_required");
      isValid = false;
    }

    setFormError(errors);
    return isValid;
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phase === "creds") {
      try {
        if (!validateInput()) return;
        setLoginDisabled(true);
        const response = await dispatch(
          login({
            email: formData.email,
            password: formData.password,
            action: "login",
          })
        ).unwrap();

        if (response.data?.twofa) {
          setPhase("code");
          setTwofa({ challengeToken: response.data.challengeToken, code: "" });
          setLoginDisabled(false);
          return;
        }

        const acl = response.data.acl;
        if (acl == "sales") navigate("/clients");
        else if (response.data.redirect) navigate(response.data.redirect);
        else navigate("/");
      } catch (error: any) {
        setLoginDisabled(false);
        setErrorMessage(t(error.message));
        setOpenSnackbar(true);
        setTimeout(() => setOpenSnackbar(false), 3000);
      }
    } else {
      // phase === "code"
      try {
        setLoginDisabled(true);
        const res = await dispatch(
          verifyLogin2FA({
            challengeToken: twofa.challengeToken,
            code: twofa.code,
          })
        ).unwrap();
        const acl = res.data.acl;
        if (acl == "sales") navigate("/clients");
        else if (res.data.redirect) navigate(res.data.redirect);
        else navigate("/");
      } catch (err: any) {
        setLoginDisabled(false);
        setErrorMessage(t(err?.message || "invalid_code"));
        setOpenSnackbar(true);
      }
    }
  };
  const handleResend = async () => {
    if (!twofa.challengeToken || resendCooldown > 0) return;
    try {
      const resp = await dispatch(
        resendLogin2FA({ challengeToken: twofa.challengeToken })
      ).unwrap();

      // ⬇️ Use the new token returned by the backend for the fresh code
      if (resp?.data?.challengeToken) {
        setTwofa({
          challengeToken: resp.data.challengeToken,
          code: "", // clear the old code
        });
      }

      setResendCooldown(30);
      const tmr = setInterval(() => {
        setResendCooldown((s) => {
          if (s <= 1) {
            clearInterval(tmr);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } catch (e: any) {
      setErrorMessage(t(e?.message || "twofa_resend_failed"));
      setOpenSnackbar(true);
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
      {/* MAIN CONTENT - LOGIN FORM */}
      <Container
        maxWidth="md"
        sx={{
          paddingLeft: "0 !important",
          "@media (min-width:1340px)": { paddingLeft: "0 !important" },
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
          {/* Title & Link to register */}
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography
              variant="h3"
              sx={{ fontSize: isMobile ? 24 : 32, fontWeight: "bold", mb: 1 }}
            >
              {phase === "creds" ? t("login_now") : t("verify_your_login")}
            </Typography>
            {phase === "creds" ? (
              <Typography variant="body1" sx={{ mb: 2 }}>
                {t("dont_have_account")}{" "}
                <Box
                  component="span"
                  sx={{
                    color: theme.palette.primary.main,
                    cursor: "pointer",
                    fontWeight: "bold",
                    textDecoration: "underline",
                  }}
                  onClick={() => navigate("/register")}
                >
                  {t("register_now")}
                </Box>
              </Typography>
            ) : (
              <Typography variant="body1" sx={{ mb: 2 }}>
                {t("we_sent_you_code")} <strong>{formData.email}</strong>
              </Typography>
            )}
          </Box>

          {openSnackbar && (
            <CustomError
              errorMessage={errorMessage}
              onClose={handleCloseSnackbar}
            />
          )}

          <form onSubmit={handleSubmit}>
            {phase === "creds" ? (
              <>
                {/* Email Field */}
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

                {/* Password Field (with Toggle) */}
                <Box sx={{ mx: 4, position: "relative", mb: 2 }}>
                  <TextField
                    fullWidth
                    error={!!formError.password}
                    label={t("password")}
                    aria-label={t("password")}
                    onChange={handleChange}
                    variant="outlined"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
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
                  {formError.password && (
                    <Typography
                      variant="body2"
                      color="error"
                      sx={{ textAlign: "start" }}
                    >
                      {formError.password}
                    </Typography>
                  )}
                </Box>

                {/* Stay Signed In + Forgot Password */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mx: 4,
                    mb: 3,
                  }}
                >
                  <FormControlLabel
                    control={<Checkbox />}
                    label={t("stay_signed_in")}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.primary.main,
                      cursor: "pointer",
                    }}
                    onClick={() => navigate("/request")}
                  >
                    {t("forgot_password")}
                  </Typography>
                </Box>

                {/* Submit Button */}
                <Box sx={{ mx: 4, mb: 2 }}>
                  <Button
                    type="submit"
                    fullWidth
                    disabled={loginDisabled}
                    variant="contained"
                    sx={{
                      color: theme.palette.common.white,
                      fontSize: 16,
                      py: 1.2,
                    }}
                  >
                    {t("login")}
                  </Button>
                </Box>

                {/* Optional: "Become a Partner" on mobile */}
                {isMobile && (
                  <Box sx={{ mx: 4, mb: 2 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() =>
                        navigate(
                          "/partner_register"
                        )
                      }
                      sx={{
                        backgroundColor: "#ee222b !important",
                        color: theme.palette.common.white,
                        fontSize: 16,
                        py: 1.2,
                      }}
                    >
                      {t("header_become_partner")}
                    </Button>
                  </Box>
                )}
              </>
            ) : (
              // ===== 2FA CODE PHASE =====
              <>
                {/* Code input */}
                <Box sx={{ mx: 4, mb: 2 }}>
                  <TextField
                    fullWidth
                    label={t("verification_code")}
                    aria-label={t("verification_code")}
                    variant="outlined"
                    value={twofa.code}
                    onChange={(e) =>
                      setTwofa({
                        ...twofa,
                        code: e.target.value.replace(/\D/g, "").slice(0, 6),
                      })
                    }
                    inputProps={{
                      inputMode: "numeric",
                      pattern: "[0-9]*",
                      maxLength: 6,
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{ mt: 1, display: "block" }}
                  >
                    {t("code_expires_in_10_min")}
                  </Typography>
                </Box>

                {/* Verify button */}
                <Box sx={{ mx: 4, mb: 1 }}>
                  <Button
                    type="submit"
                    fullWidth
                    disabled={loginDisabled || twofa.code.length !== 6}
                    variant="contained"
                    sx={{
                      color: theme.palette.common.white,
                      fontSize: 16,
                      py: 1.2,
                    }}
                  >
                    {t("verify")}
                  </Button>
                </Box>

                {/* Resend + Back */}
                <Box
                  sx={{
                    mx: 4,
                    display: "flex",
                    gap: 2,
                    flexDirection: isMobile ? "column" : "row",
                    mb: 2,
                  }}
                >
                  <Button
                    fullWidth
                    onClick={handleResend}
                    disabled={resendCooldown > 0}
                    variant="text"
                  >
                    {resendCooldown > 0
                      ? t("resend_in_seconds", { s: resendCooldown })
                      : t("resend_code")}
                  </Button>
                  <Button
                    fullWidth
                    variant="text"
                    onClick={() => {
                      setPhase("creds");
                      setTwofa({ challengeToken: "", code: "" });
                      setLoginDisabled(false);
                    }}
                  >
                    {t("go_back")}
                  </Button>
                </Box>
              </>
            )}
          </form>
        </Box>
      </Container>
      <HomeFooter />
    </Box>
  );
};

export default Login;
