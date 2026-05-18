import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  Grid,
  Paper,
  TextField,
  Typography,
  useTheme,
  Autocomplete,
  MenuItem,
  Link,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import HomeHeader from "@/components/HomeHeader";
import HomeFooter from "@/components/HomeFooter";
import CustomError from "@/components/ui/CustomError";
import CustomNotification from "@/components/ui/CustomNotification";
import { countriesList, phoneCodesList } from "@/assets/constants/countryCodes";
import { useAppDispatch } from "@/redux/hooks";
import { registerIB } from "@/redux/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment, { Moment } from "moment";

interface Form {
  partner_account_type: "individual" | "corporate";
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  phoneCode: string;
  phone: string;
  birth_date: Moment | null;
  /* business */
  ib_experience: string;
  nbr_clients: string;
  client_source: string;
  deposits_size: string;
  termsAccepted: boolean;
}

export default function RegisterIB() {
  const { t } = useTranslation();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [ok, setOk] = useState("");
  const [error, setErr] = useState("");
  const [countryByIP, setCountryByIP] = useState("");

  /** ————————————————— form defaults */
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Form>({
    defaultValues: {
      partner_account_type: "individual",
      firstName: "",
      lastName: "",
      email: "",
      country: "",
      phoneCode: "",
      phone: "",
      birth_date: null,
      ib_experience: "no",
      nbr_clients: "0-10",
      client_source: "website",
      deposits_size: "0-10",
      termsAccepted: false,
    },
  });

  /* when country changes → fill dial-code automatically */
  const country = watch("country");

  // 🌍 Detect country by IP
  useEffect(() => {
    const detectCountryByIP = async () => {
      try {
        const res = await fetch("http://ip-api.com/json/");
        if (!res.ok) throw new Error("GeoIP fetch failed.");
        const data = await res.json();
        if (data.countryCode) {
          const code = data.countryCode.toUpperCase();
          setCountryByIP(code);
          const foundPhone = phoneCodesList.find(
            (p) => p.iso2 === code.toLowerCase()
          );
          setValue("country", code);
          if (foundPhone) setValue("phoneCode", foundPhone.phoneCode);
        }
      } catch (e) {
        console.warn("GeoIP failed", e);
      }
    };
    detectCountryByIP();
  }, [setValue]);

  // 📞 Auto-set phone code when country is selected
  useEffect(() => {
    if (country) {
      const p = phoneCodesList.find((p) => p.iso2 === country.toLowerCase());
      if (p) setValue("phoneCode", p.phoneCode);
    }
  }, [country, setValue]);

  /** ————————————————— submit */
  const onSubmit = async (vals: Form) => {
    try {
      const envelope = await dispatch(
        registerIB({
          first_name: vals.firstName,
          last_name: vals.lastName,
          country: vals.country,
          phone_code: vals.phoneCode,
          phone_number: vals.phone,
          email: vals.email,
          birth_date: vals.birth_date?.format("DD/MM/YYYY") ?? "",
          partner_account_type: vals.partner_account_type,
          ib_experience: vals.ib_experience,
          nbr_clients: vals.nbr_clients,
          client_personal_relation: vals.client_source,
          client_depositsent_personal_relation: vals.deposits_size,
          countrybyIP: countryByIP, // Add this to the payload
        })
      ).unwrap();

      setOk(t(envelope.data.message));
      navigate(envelope.data.redirect || "/");
    } catch (err: any) {
      setErr(t(err.detail || err.message || "save_failed"));
    }
  };

  /** ————————————————— UI */
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
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
        <Paper sx={{ p: { xs: 2, md: 4 } }}>
          <Typography variant="h4" mb={3} textAlign="center">
            {t("partner_account_information")}
          </Typography>

          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            sx={{ mt: 2 }}
          >
            {/* 1️⃣  Account type switch */}
            <Controller
              name="partner_account_type"
              control={control}
              render={({ field }) => (
                <Box mb={2}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={field.value === "individual"}
                        onChange={() => field.onChange("individual")}
                      />
                    }
                    label={t("individual")}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={field.value === "corporate"}
                        onChange={() => field.onChange("corporate")}
                      />
                    }
                    label={t("corporate")}
                  />
                </Box>
              )}
            />

            {/* 2️⃣  Personal info */}
            <Typography variant="h5" sx={{ my: 2 }}>
              {t("personal_information")}
            </Typography>
            {ok && (
              <CustomNotification message={ok} onClose={() => setOk("")} />
            )}
            {error && (
              <CustomError errorMessage={error} onClose={() => setErr("")} />
            )}

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="firstName"
                  control={control}
                  rules={{ required: t("first_name_is_required") }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t("first_name")}
                      error={!!errors.firstName}
                      helperText={errors.firstName?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="lastName"
                  control={control}
                  rules={{ required: t("last_name_is_required") }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t("last_name")}
                      error={!!errors.lastName}
                      helperText={errors.lastName?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="email"
                  control={control}
                  rules={{ required: t("email_is_required") }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t("email")}
                      error={!!errors.email}
                      helperText={errors.email?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="country"
                  control={control}
                  rules={{ required: t("country_is_required") }}
                  render={({ field }) => (
                    <Autocomplete
                      options={countriesList}
                      getOptionLabel={(o) => o.name}
                      value={
                        countriesList.find((c) => c.code === field.value) ??
                        null
                      }
                      onChange={(_, v) => field.onChange(v?.code ?? "")}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={t("country")}
                          error={!!errors.country}
                          helperText={errors.country?.message}
                        />
                      )}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={4} md={2}>
                <Controller
                  name="phoneCode"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t("code")}
                      disabled
                      error={!!errors.phoneCode}
                      helperText={errors.phoneCode?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={8} md={4}>
                <Controller
                  name="phone"
                  control={control}
                  rules={{ required: t("phone_number_is_required") }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t("phone")}
                      fullWidth
                      error={!!errors.phone}
                      helperText={errors.phone?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterMoment}>
                  <Controller
                    name="birth_date"
                    control={control}
                    rules={{ required: t("birth_date_is_required") }}
                    render={({ field }) => (
                      <DatePicker
                        {...field}
                        label={t("date_of_birth")}
                        maxDate={moment().subtract(18, "years")}
                        format="DD/MM/YYYY"
                        slotProps={{
                          textField: {
                            size: "small",
                            fullWidth: true,
                            error: !!errors.birth_date,
                            helperText: errors.birth_date?.message,
                          },
                        }}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>

            {/* 3️⃣  Business info */}
            <Typography variant="h5" sx={{ my: 3 }}>
              {t("business_information")}
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Controller
                  name="ib_experience"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label={t("ib_experience")}
                      fullWidth
                    >
                      <MenuItem value="no">{t("no")}</MenuItem>
                      <MenuItem value="yes">{t("yes")}</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="nbr_clients"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label={t("estimated_clients")}
                      fullWidth
                    >
                      {["0-10", "10-50", "50-100", "100+"].map((v) => (
                        <MenuItem key={v} value={v}>
                          {v}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="client_source"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label={t("client_source")}
                      fullWidth
                    >
                      {["website", "social_media", "referral", "others"].map(
                        (v) => (
                          <MenuItem key={v} value={v}>
                            {t(v)}
                          </MenuItem>
                        )
                      )}
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller
                  name="deposits_size"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label={t("client_deposits")}
                      fullWidth
                    >
                      {["0-10", "10-50", "50-100", "100+"].map((v) => (
                        <MenuItem key={v} value={v}>
                          {v}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>
            </Grid>

            {/* 4️⃣  Terms & Conditions */}
            <Box sx={{ mt: 3 }}>
              <Controller
                name="termsAccepted"
                control={control}
                rules={{
                  required: t("you_must_accept_terms_and_conditions"),
                }}
                render={({ field }) => (
                  <>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
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

                    {errors.termsAccepted && (
                      <Typography variant="body2" color="error">
                        {errors.termsAccepted.message as string}
                      </Typography>
                    )}
                  </>
                )}
              />
            </Box>

            {/* submit */}
            <Box sx={{ textAlign: "center", mt: 4, mb: 2 }}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  color: theme.palette.common.white,
                  fontSize: 16,
                  py: 1.2,
                }}
              >
                {t("register_now")}
              </Button>
            </Box>
            <Box sx={{ textAlign: "center", mb: 1 }}>
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
          </Box>
        </Paper>
      </Container>

      <HomeFooter />
    </Box>
  );
}
