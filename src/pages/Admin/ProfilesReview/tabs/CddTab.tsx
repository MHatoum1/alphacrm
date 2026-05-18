import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { useAppDispatch } from "@/redux/hooks";
import {
  updateProfile,
  Profile,
} from "@/redux/slices/adminProfileReviewSlice";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import CustomNotification from "@/components/ui/CustomNotification";
import CustomError from "@/components/ui/CustomError";
import { useTranslation } from "react-i18next";

/** convenience: Yes/No radios in one place */
const YesNoRadios = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) => {
  const { t } = useTranslation();
  return (
    <RadioGroup
      row
      value={value}
      onChange={(e) => onChange(e.target.value)}
      sx={{ "& .MuiFormControlLabel-root": { mr: 2 } }}
    >
      <FormControlLabel
        value="1"
        control={<Radio size="small" />}
        label={t("yes", "Yes")}
      />
      <FormControlLabel
        value="0"
        control={<Radio size="small" />}
        label={t("no", "No")}
      />
    </RadioGroup>
  );
};

/** fixed list of docs we care about */
const docsList: Record<string, string> = {
  comp_id: "ID / Passport",
  comp_proof: "Proof of residence",
};

interface CddForm {
  comp_documents?: string[];
  comp_client_name: string;
  comp_client_docs: string;
  comp_received_docs: string;
}

export default function CddTab() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();

  // snack state
  const [openSuccess, setOpenSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [openError, setOpenError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // profile already loaded by <ReviewMenu/>
  const raw = useSelector(
    (s: RootState) => s.profileReview.data
  ) as Partial<Profile>;

  // react-hook-form setup
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<CddForm>({
    defaultValues: {
      comp_documents: raw.comp_documents ?? [],
      comp_client_name: raw.comp_client_name ?? "",
      comp_client_docs: raw.comp_client_docs ?? "",
      comp_received_docs: raw.comp_received_docs ?? "",
    },
  });

  // re-populate if the store updates
  useEffect(() => {
    reset({
      comp_documents: raw.comp_documents ?? [],
      comp_client_name: raw.comp_client_name ?? "",
      comp_client_docs: raw.comp_client_docs ?? "",
      comp_received_docs: raw.comp_received_docs ?? "",
    });
  }, [raw, reset]);

  const onSubmit = async (vals: CddForm) => {
    try {
      if (!id) return;
      await dispatch(
        updateProfile({
          id,
          section: "cdd",
          fields: vals,
        })
      ).unwrap();
      setSuccessMsg(t("saved_successfully", "Saved successfully"));
      setOpenSuccess(true);
    } catch (err: any) {
      setErrorMsg(
        t(err.detail || err.message || "save_failed", "Save failed")
      );
      setOpenError(true);
    }
  };

  return (
    <Box>
      {/* toasts */}
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

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
        }}
      >
        {/* Tab title */}
        <Typography
          variant="h6"
          sx={{
            mb: 3,
            pb: 1,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          {isMobile
            ? t("cdd", "CDD")
            : t("customer_due_diligence", "Customer Due Diligence")}
        </Typography>

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* static client info */}
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            {t("client_information", "Client information")}
          </Typography>
          <Grid container spacing={1} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <strong>{t("full_name", "Full name:")}</strong>{" "}
              {raw.name ?? "—"}
            </Grid>
            <Grid item xs={12} md={6}>
              <strong>{t("categorisation", "Categorisation:")}</strong>{" "}
              {raw.profile_risk_level ?? "—"}
            </Grid>
            <Grid item xs={12} md={6}>
              <strong>
                {t("passport_id_number", "Passport / ID #:")}
              </strong>{" "}
              {raw.passport ?? "—"}
            </Grid>
            <Grid item xs={12} md={6}>
              <strong>{t("country", "Country:")}</strong>{" "}
              {raw.country_name ?? "—"}
            </Grid>
          </Grid>

          {/* compliance section */}
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            {t("compliance", "Compliance")}
          </Typography>

          {/* documents checkboxes */}
          <Grid container spacing={1} sx={{ mb: 2 }}>
            <Grid item xs={12} md={4} sx={{ pt: "7px" }}>
              {t("documents_received", "Documents received")}
            </Grid>
            <Grid item xs={12} md={8}>
              <Controller
                name="comp_documents"
                control={control}
                render={({ field }) => (
                  <Grid container>
                    {Object.entries(docsList).map(([val, fallback]) => (
                      <Grid item xs={12} sm={6} md={4} key={val}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              size="small"
                              checked={field.value?.includes(val)}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                field.onChange(
                                  checked
                                    ? [...(field.value ?? []), val]
                                    : (field.value ?? []).filter((x) => x !== val)
                                );
                              }}
                            />
                          }
                          label={t(val, fallback)}
                        />
                      </Grid>
                    ))}
                  </Grid>
                )}
              />
            </Grid>
          </Grid>

          {/* name check */}
          <Grid container spacing={1} sx={{ mb: 2 }}>
            <Grid item xs={12} md={4} sx={{ pt: "7px" }}>
              {t("name_check", "Name check")}
            </Grid>
            <Grid item xs={12} md={8}>
              <Controller
                name="comp_client_name"
                control={control}
                rules={{ required: true }}
                render={({ field }) => <YesNoRadios {...field} />}
              />
            </Grid>
          </Grid>

          {/* passport/ID check */}
          <Grid container spacing={1} sx={{ mb: 2 }}>
            <Grid item xs={12} md={4} sx={{ pt: "7px" }}>
              {t("passport_id_check", "Passport / ID check")}
            </Grid>
            <Grid item xs={12} md={8}>
              <Controller
                name="comp_client_docs"
                control={control}
                rules={{ required: true }}
                render={({ field }) => <YesNoRadios {...field} />}
              />
            </Grid>
          </Grid>

          {/* company received docs */}
          <Grid container spacing={1} sx={{ mb: 2 }}>
            <Grid item xs={12} md={4} sx={{ pt: "7px" }}>
              {t("company_received_id_docs", "Company received ID docs")}
            </Grid>
            <Grid item xs={12} md={8}>
              <Controller
                name="comp_received_docs"
                control={control}
                rules={{ required: true }}
                render={({ field }) => <YesNoRadios {...field} />}
              />
            </Grid>
          </Grid>

          {/* save button */}
          <Box sx={{ textAlign: "right", mt: 4 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              sx={{ mr: 2 }}
            >
              {t("save", "Save")}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
