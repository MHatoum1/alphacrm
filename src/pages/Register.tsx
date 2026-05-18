import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Typography,
  Container,
  TextField,
  Button,
  useMediaQuery,
  useTheme,
  FormControl,
  Autocomplete,
  Checkbox,
  FormControlLabel,
  Link,
} from "@mui/material";
import { useAppDispatch } from "@/redux/hooks";
import { useNavigate } from "react-router-dom";
import HomeFooter from "@/components/HomeFooter";
import HomeHeader from "@/components/HomeHeader";
import { countriesList, phoneCodesList } from "@/assets/constants/countryCodes";
import { registerUser } from "@/redux/slices/authSlice";
import CustomError from "@/components/ui/CustomError";
import Cookies from "js-cookie";
import { trackMeta, trackGtag, trackTwitter, trackTikTok } from "@/utils/analytics";

interface CountryData {
  name: string;
  code: string; // e.g. "LB"
}

interface FormData {
  firstName: string;
  lastName: string;
  country: string;
  phoneCode: string;
  phoneNumber: string;
  email: string;
  termsAccepted: boolean;
}
const Register: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [countryByIP, setCountryByIP] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [registerDisabled, setRegisterDisabled] = useState(false);
  const partnerId = Cookies.get("partnerid") || "";
  const campaign = Cookies.get("cid") || "";
  // INITIAL FORM DATA

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    country: "",
    phoneCode: "",
    phoneNumber: "",
    email: "",
    termsAccepted: false,
  });
  // FORM ERRORS
  const [formError, setFormError] = useState({
    firstName: "",
    lastName: "",
    country: "",
    phoneCode: "",
    phoneNumber: "",
    email: "",
    termsAccepted: "",
  });

  useEffect(() => {
    const detectCountryByIP = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        if (!res.ok) throw new Error("GeoIP fetch failed.");
        const data = await res.json();

        if (data.country_code) {
          const detectedCode = data.country_code.toUpperCase();
          setCountryByIP(detectedCode); // store original IP-based code

          const foundCountry = countriesList.find(
            (c) => c.code === detectedCode
          );
          if (foundCountry) {
            const foundPhone = phoneCodesList.find(
              (p) => p.iso2 === detectedCode.toLowerCase()
            );
            const phoneCode = foundPhone ? foundPhone.phoneCode : "";

            setFormData((prev) => ({
              ...prev,
              country: detectedCode,
              phoneCode: phoneCode,
            }));
          }
        }
      } catch (error) {
        console.log("Error detecting country by IP:", error);
      }
    };

    detectCountryByIP();
  }, []);
  // HANDLE STANDARD INPUT CHANGES
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

  // When user selects a country from Autocomplete, find phone code
  const handleCountrySelect = (
    _event: React.SyntheticEvent<Element, Event>,
    newValue: CountryData | null
  ) => {
    if (newValue) {
      // newValue.code is something like "LB"
      const foundPhone = phoneCodesList.find(
        (p) => p.iso2 === newValue.code.toLowerCase()
      );
      const phoneCode = foundPhone ? foundPhone.phoneCode : "";

      setFormData((prevData) => ({
        ...prevData,
        country: newValue.code,
        phoneCode: phoneCode,
      }));

      // Clear errors related to country/phone code
      setFormError((prevError) => ({
        ...prevError,
        country: "",
        phoneCode: "",
      }));
    } else {
      // If user clears or picks nothing
      setFormData((prevData) => ({
        ...prevData,
        country: "",
        phoneCode: "",
      }));
    }
  };

  // VALIDATION
  const validateInput = () => {
    const errors = {
      firstName: "",
      lastName: "",
      country: "",
      phoneCode: "",
      phoneNumber: "",
      email: "",
      termsAccepted: "",
    };
    let isValid = true;

    if (!formData.firstName.trim()) {
      errors.firstName = t("first_name_is_required");
      isValid = false;
    }
    if (!formData.lastName.trim()) {
      errors.lastName = t("last_name_is_required");
      isValid = false;
    }
    if (!formData.country.trim()) {
      errors.country = t("country_is_required");
      isValid = false;
    }
    if (!formData.phoneCode.trim()) {
      errors.phoneCode = t("phone_code_is_required");
      isValid = false;
    }
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = t("phone_number_is_required");
      isValid = false;
    }
    if (!formData.email.trim()) {
      errors.email = t("email_is_required");
      isValid = false;
    } else {
      const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
      if (!emailRegex.test(formData.email)) {
        errors.email = t("invalid_email");
        isValid = false;
      }
    }

    if (!formData.termsAccepted) {
      // you can localize this key as you wish
      errors.termsAccepted = t("you_must_accept_terms_and_conditions");
      isValid = false;
    }

    setFormError(errors);
    return isValid;
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  // FORM SUBMIT HANDLER
  // FORM SUBMIT HANDLER
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!validateInput()) return;
      setRegisterDisabled(true);
      // 2. Include the "countrybyIP" in the final data to the backend
      const payload = {
        ...formData,
        countrybyIP: countryByIP, // hidden field
        partnerid: partnerId,
        campaign: campaign,
      };
      // Dispatch our registerUser thunk:
      const envelope = await dispatch(registerUser(payload)).unwrap();
      const data = envelope.data; // <- safe to access

      // Registration was successful. You can now store any token if provided.
      if (data.token) {
        localStorage.setItem("user", JSON.stringify(data));
        localStorage.setItem("token", data.token);

        // Meta (all initialized pixels will receive this)
        trackMeta("CompleteRegistration", { currency: "USD", value: 0.0 });

        // Google Ads conversion (from your legacy snippet)
        trackGtag("conversion", {
          send_to: "AW-788132993/D4AlCO6bxaIBEIHp5_cC",
        });

        // Floodlight (from your legacy snippet)
        trackGtag("conversion", {
          allow_custom_scripts: true,
          send_to: "DC-10120747/invmedia/fxgro0+standard",
        });

        // Twitter (you only had base; add an event name if you have one configured)
        trackTwitter("SignUp"); // or any event key you've set in Twitter

        // TikTok Pixel
        trackTikTok("CompleteRegistration");
      }
      // Perform a client-side redirect based on the response

      if (data.redirect) {
        navigate(data.redirect);
      } else {
        navigate("/"); // Fallback redirect
      }
    } catch (error: any) {
      setRegisterDisabled(false);
      setErrorMessage(t(error.message));
      setOpenSnackbar(true);
      setTimeout(() => setOpenSnackbar(false), 3000);
    }
  };

  // Find Autocomplete "value" from formData.country
  const selectedCountryObj =
    countriesList.find((c) => c.code === formData.country) || null;

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
      {/* MAIN CONTENT - REGISTRATION FORM */}
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
              {t("setup_profile")}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {t("access_never_sleep")}
            </Typography>
          </Box>

          {openSnackbar && (
            <CustomError
              errorMessage={errorMessage}
              onClose={handleCloseSnackbar}
            />
          )}
          {/* HIDDEN input for "countrybyIP" */}
          <input type="hidden" name="countrybyIP" value={countryByIP} />

          <form onSubmit={handleSubmit}>
            {/* First Name */}
            <Box sx={{ mx: 4, mb: 2 }}>
              <TextField
                fullWidth
                name="firstName"
                label={t("first_name")}
                aria-label={t("first_name")}
                variant="outlined"
                value={formData.firstName}
                onChange={handleChange}
                error={!!formError.firstName}
              />
              {formError.firstName && (
                <Typography variant="body2" color="error">
                  {formError.firstName}
                </Typography>
              )}
            </Box>

            {/* Last Name */}
            <Box sx={{ mx: 4, mb: 2 }}>
              <TextField
                fullWidth
                name="lastName"
                label={t("last_name")}
                aria-label={t("last_name")}
                variant="outlined"
                value={formData.lastName}
                onChange={handleChange}
                error={!!formError.lastName}
              />
              {formError.lastName && (
                <Typography variant="body2" color="error">
                  {formError.lastName}
                </Typography>
              )}
            </Box>

            {/* Country with Autocomplete */}
            <Box sx={{ mx: 4, mb: 2 }}>
              <FormControl fullWidth error={!!formError.country}>
                <Autocomplete
                  // full list to choose from
                  options={countriesList}
                  // how to show each option
                  getOptionLabel={(option) => option.name}
                  // which value is selected
                  value={selectedCountryObj}
                  onChange={handleCountrySelect}
                  // let users search by name
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t("country")}
                      variant="outlined"
                      sx={{ backgroundColor: theme.palette.background.paper }}
                      error={!!formError.country}
                    />
                  )}
                  // Optional: style the dropdown
                  ListboxProps={{
                    style: {
                      backgroundColor: theme.palette.background.paper,
                      maxHeight: "250px", // Limit height, if desired
                    },
                  }}
                />
              </FormControl>
              {formError.country && (
                <Typography variant="body2" color="error">
                  {formError.country}
                </Typography>
              )}
            </Box>

            {/* Phone Code + Phone Number side by side */}
            <Box sx={{ mx: 4, mb: 2, display: "flex", gap: 2 }}>
              <TextField
                label={t("phone_code")}
                name="phoneCode"
                variant="outlined"
                value={formData.phoneCode}
                onChange={handleChange}
                error={!!formError.phoneCode}
                disabled
                sx={{ width: "35%" }}
              />
              <TextField
                label={t("phone_number")}
                name="phoneNumber"
                variant="outlined"
                value={formData.phoneNumber}
                onChange={handleChange}
                error={!!formError.phoneNumber}
                sx={{ width: "65%" }}
              />
            </Box>

            {/* Errors for phoneCode / phoneNumber */}
            <Box sx={{ mx: 4, mb: 2 }}>
              {formError.phoneCode && (
                <Typography variant="body2" color="error">
                  {formError.phoneCode}
                </Typography>
              )}
              {formError.phoneNumber && (
                <Typography variant="body2" color="error">
                  {formError.phoneNumber}
                </Typography>
              )}
            </Box>

            {/* Email Address */}
            <Box sx={{ mx: 4, mb: 2 }}>
              <TextField
                fullWidth
                name="email"
                label={t("email_address")}
                aria-label={t("email_address")}
                variant="outlined"
                value={formData.email}
                onChange={handleChange}
                error={!!formError.email}
              />
              {formError.email && (
                <Typography variant="body2" color="error">
                  {formError.email}
                </Typography>
              )}
            </Box>

            {/* Terms & Conditions */}
            <Box sx={{ mx: 4, mb: 2 }}>
              <FormControl
                error={!!formError.termsAccepted}
                component="fieldset"
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.termsAccepted}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          termsAccepted: e.target.checked,
                        }));
                        setFormError((prev) => ({
                          ...prev,
                          termsAccepted: "",
                        }));
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2">
                      {t("i_accept_the")}{" "}
                      <Link
                        href="https://fxgrow.com/pdf/terms-and-conditions-for-the-use-of-the-website.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        underline="always"
                      >
                        {t("terms_and_conditions")}
                      </Link>{" "}
                    </Typography>
                  }
                />

                {formError.termsAccepted && (
                  <Typography variant="body2" color="error">
                    {formError.termsAccepted}
                  </Typography>
                )}
              </FormControl>
            </Box>

            {/* SUBMIT BUTTON */}
            <Box sx={{ mx: 4, mb: 2 }}>
              <Button
                type="submit"
                fullWidth
                disabled={registerDisabled}
                variant="contained"
                sx={{
                  color: theme.palette.common.white,
                  fontSize: 16,
                  py: 1.2,
                }}
              >
                {t("submit")}
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

export default Register;
