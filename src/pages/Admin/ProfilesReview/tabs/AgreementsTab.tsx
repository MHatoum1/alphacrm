// src/pages/Admin/ProfilesReview/tabs/AgreementTab.tsx
import {
  Box,
  Grid,
  Paper,
  Typography,
  Checkbox,
  FormControlLabel,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { useAppDispatch } from "@/redux/hooks";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { updateProfile, Profile } from "@/redux/slices/adminProfileReviewSlice";
import appearance from "@/assets/constants/appearance.json";
import { useEffect, useState } from "react";
import pdfIcon from "@/assets/images/branding/fxgrow.com/pdf.png";
import CustomNotification from "@/components/ui/CustomNotification";
import CustomError from "@/components/ui/CustomError";
import { useTranslation } from "react-i18next";

type DocTuple = [string, string];


interface AgreementForm {
  agreements: string[];
}

export default function AgreementTab() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const profile = useSelector(
    (s: RootState) => s.profileReview.data
  ) as Partial<Profile>;

  const noneuropean = profile?.noneuropean || false;
  
  // Select the proper region’s document set
  const regionDocs = noneuropean
    ? appearance.documents.NonEU
    : appearance.documents.EU;

      // Convert the selected document set into [url, label] tuples
const docs: DocTuple[] = Object.entries(
  regionDocs as Record<string, string>
);

  /* the three required checkboxes */
  const checkboxValues = [
    "over_18",
    "understand_risks",
    "accept_documents",
  ] as const;

  /* RHF setup */
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<AgreementForm>({
    defaultValues: { agreements: profile.agreements ?? [] },
  });

  useEffect(() => {
    reset({ agreements: profile.agreements ?? [] });
  }, [profile.agreements, reset]);

  /* notification state */
  const [openSuccess, setOpenSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [openError, setOpenError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  /* submit */
  const onSubmit = async ({ agreements }: AgreementForm) => {
    if (!id) return;
    try {
      await dispatch(
        updateProfile({
          id,
          section: "agreements",
          fields: { agreements },
        })
      ).unwrap();
      setSuccessMsg(t("agreements_saved"));
      setOpenSuccess(true);
    } catch (err: any) {
      setErrorMsg(t(err.detail || err.message || "save_failed"));
      setOpenError(true);
    }
  };

  return (
    <Box>
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
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            mb: 3,
            pb: 1,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          {isMobile ? t("agreements_short") : t("agreements_title")}
        </Typography>

        <Grid container spacing={2}>
          {/* ── single Controller for all three ── */}
          <Grid item xs={12}>
            <Controller
              name="agreements"
              control={control}
              rules={{
                validate: (arr: string[]) =>
                  checkboxValues.every((v) => arr.includes(v))
                    ? true
                    : t("required"),
              }}
              render={({ field }) => (
                <>
                  {checkboxValues.map((value) => (
                    <Grid item xs={12} key={value}>
                      <FormControlLabel
                        key={value}
                        control={
                          <Checkbox
                            checked={field.value.includes(value)}
                            onChange={(e) => {
                              const next = new Set(field.value);
                              if (e.target.checked) next.add(value);
                              else next.delete(value);
                              field.onChange(Array.from(next));
                            }}
                          />
                        }
                        label={t(`agreement_${value}`)}
                      />
                    </Grid>
                  ))}
                  {errors.agreements && (
                    <Typography color="error" variant="caption">
                      {errors.agreements.message as string}
                    </Typography>
                  )}
                </>
              )}
            />
          </Grid>

          {/* ── PDF list ── */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
              {t("documents_heading")}
            </Typography>
            <Grid container spacing={1}>
              {docs.map(([url, title]) => (
                <Grid item xs={12} sm={6} md={4} key={url}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <img src={pdfIcon} alt="PDF" width={18} />
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      {t(title)}
                    </a>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>

        <Box sx={{ textAlign: "right", mt: 4 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={ isSubmitting}
          >
            {t("save")}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
