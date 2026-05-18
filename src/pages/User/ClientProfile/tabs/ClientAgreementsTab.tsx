// src/pages/Admin/ProfilesReview/tabs/ClientAgreementsTab.tsx
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
  TextField,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useAppDispatch } from "@/redux/hooks";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { Profile } from "@/redux/slices/adminProfileReviewSlice";
import appearance from "@/assets/constants/appearance.json";
import { useEffect, useMemo, useState } from "react";
import pdfIcon from "@/assets/images/branding/alphatrust.ai/pdf.png";
import CustomNotification from "@/components/ui/CustomNotification";
import CustomError from "@/components/ui/CustomError";
import { useTranslation } from "react-i18next";
import { updateClientProfile } from "@/redux/slices/clientProfileSlice";
import { useNavigate, useOutletContext } from "react-router-dom";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

type DocTuple = [string, string];

const STORAGE = {
  downloads: "agreements_downloaded_v1",
  locked: "agreements_locked_v1",
} as const;

interface AgreementForm {
  agreements: string[];
  typedName: string;
}

const readJSON = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};
const writeJSON = (key: string, val: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
};

const norm = (s: string) => s.replace(/\s+/g, " ").trim().toLowerCase();

export default function ClientAgreementsTab() {
  const { reloadProfile } = useOutletContext<{ reloadProfile: () => void }>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const authUser = useSelector((s: RootState) => s.auth.user);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const profile = useSelector(
    (s: RootState) => s.clientProfile.data
  ) as Partial<Profile>;
  const navigate = useNavigate();


const noneuropean = authUser?.noneuropean || false;

// Select the proper region’s document set
const regionDocs = noneuropean
  ? appearance.documents.NonEU
  : appearance.documents.EU;

  // Convert the selected document set into [url, label] tuples
const docs: DocTuple[] = Object.entries(
  regionDocs as Record<string, string>
);

  const checkboxValues = [
    "over_18",
    "understand_risks",
    "accept_documents",
  ] as const;

  const [downloaded, setDownloaded] = useState<Record<string, boolean>>(() =>
    readJSON(STORAGE.downloads, {})
  );
  const [locked, setLocked] = useState<Set<string>>(
    () => new Set(readJSON<string[]>(STORAGE.locked, []))
  );

  const profileName = useMemo(() => {
    const p: any = profile || {};
    const candidates = [
      p.full_name,
      p.fullName,
      [p.first_name, p.last_name].filter(Boolean).join(" "),
      [p.firstName, p.lastName].filter(Boolean).join(" "),
      (authUser as any)?.fullName,
      (authUser as any)?.name,
    ]
      .map((v) => (v ? String(v).trim() : ""))
      .filter((v) => v.length > 0);
    return (candidates[0] || "").trim();
  }, [profile, authUser]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
    watch,
  } = useForm<AgreementForm>({
    defaultValues: {
      agreements: Array.from(
        new Set([...(profile.agreements ?? []), ...Array.from(locked)])
      ),
      typedName: "",
    },
    mode: "onTouched",
  });

  useEffect(() => {
    reset((prev) => ({
      agreements: Array.from(
        new Set([...(profile.agreements ?? []), ...Array.from(locked)])
      ),
      typedName: prev.typedName ?? "",
    }));
  }, [profile.agreements, locked, reset]);

  const [openSuccess, setOpenSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [openError, setOpenError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const allDownloaded = useMemo(
    () => docs.every(([url]) => downloaded[url]),
    [downloaded]
  );
  const checked = watch("agreements");
  const typedName = watch("typedName") || "";
  const isNameRequired = Boolean(profileName);

  const markDownloaded = (url: string) => {
    setDownloaded((prev) => {
      const next = { ...prev, [url]: true };
      writeJSON(STORAGE.downloads, next);
      return next;
    });
  };

  const lockAgreement = (value: string) => {
    setLocked((prev) => {
      if (prev.has(value)) return prev;
      const next = new Set(prev);
      next.add(value);
      writeJSON(STORAGE.locked, Array.from(next));
      return next;
    });
  };

  /** Build a friendly checklist of what’s missing */
  /** Return only the highest-priority error message (or null) */
  const getFirstError = (vals: AgreementForm): string | null => {
    // 1) Require downloads first
    if (!allDownloaded) {
      const firstMissing = docs.find(([url]) => !downloaded[url]);
      const docName = firstMissing ? t(firstMissing[1]) : undefined;
      const base =
        (t("please_download_all_documents_first") as string) ||
        "Please download all documents first.";
      return docName ? `${base} (${docName})` : base;
    }

    // 2) Then require the three checkboxes
    const firstMissingCheck = checkboxValues.find(
      (v) => !vals.agreements.includes(v)
    );
    if (firstMissingCheck) {
      return `${
        t("please_check_required_agreements") ||
        "Please check the required agreements"
      }: ${t(`agreement_${firstMissingCheck}`)}`;
    }

    // 3) Finally, signature name must match profile
    if (isNameRequired && norm(vals.typedName) !== norm(profileName)) {
      return (
        (t("name_must_match_profile") as string) ||
        `Please enter your name exactly as on your profile (${profileName}).`
      );
    }

    return null;
  };

  /** onValid → proceed only if no extra guards fail; else show popup */
  const onValid = async (vals: AgreementForm) => {
    const first = getFirstError(vals);
    if (first) {
      setErrorMsg(first);
      setOpenError(true);
      return;
    }

    if (!authUser?.userID) return;
    try {
      await dispatch(
        updateClientProfile({
          user_id: authUser.userID,
          section: "agreements",
          fields: {
            agreements: vals.agreements,
            // signature_name: vals.typedName,
          },
        })
      ).unwrap();
      setSuccessMsg(t("agreements_saved"));
      setOpenSuccess(true);
      reloadProfile();
      setTimeout(() => navigate("/userprofile", { replace: true }), 1000);
    } catch (err: any) {
      setErrorMsg(t(err.detail || err.message || "save_failed"));
      setOpenError(true);
    }
  };

  /** onInvalid → show popup summarizing issues (plus field-level errors stay visible) */
  const onInvalid = () => {
    const first = getFirstError({ agreements: checked ?? [], typedName });
    if (first) {
      setErrorMsg(first);
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
        onSubmit={handleSubmit(onValid, onInvalid)}
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
          {/* Checkboxes */}
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
                  {checkboxValues.map((value) => {
                    const isLocked = locked.has(value);
                    const isChecked = field.value.includes(value);
                    const gatedByDownloads =
                      value === "accept_documents" &&
                      !allDownloaded &&
                      !isLocked &&
                      !isChecked;

                    return (
                      <Grid item xs={12} key={value}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={isChecked}
                              disabled={isLocked || gatedByDownloads}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  const next = new Set(field.value);
                                  next.add(value);
                                  field.onChange(Array.from(next));
                                  lockAgreement(value);
                                } else {
                                  if (isLocked || isChecked) return;
                                  const next = new Set(field.value);
                                  next.delete(value);
                                  field.onChange(Array.from(next));
                                }
                              }}
                            />
                          }
                          label={
                            value === "accept_documents" &&
                            !allDownloaded &&
                            !isLocked &&
                            !isChecked
                              ? `${t(`agreement_${value}`)} — ${
                                  t("please_download_all_documents_first") ||
                                  "please download all documents first"
                                }`
                              : t(`agreement_${value}`)
                          }
                        />
                      </Grid>
                    );
                  })}
                  {errors.agreements && (
                    <Typography color="error" variant="caption">
                      {errors.agreements.message as string}
                    </Typography>
                  )}
                </>
              )}
            />
          </Grid>

          {/* Signature name */}
          <Grid item xs={12} md={8}>
            <Controller
              name="typedName"
              control={control}
              rules={{
                validate: (v) =>
                  !Boolean(profileName) ||
                  (norm(v).length > 0 && norm(v) === norm(profileName)) ||
                  t("name_must_match_profile") ||
                  "Please enter your name exactly as on your profile",
              }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  label={
                    t("signature_name_label") ||
                    "Type your full name as your signature"
                  }
                  placeholder={
                    profileName ||
                    t("your_profile_name_placeholder") ||
                    "Your profile name"
                  }
                  InputLabelProps={{ shrink: true }}
                  error={!!fieldState.error}
                  helperText={
                    fieldState.error
                      ? (fieldState.error.message as string)
                      : t("signature_name_hint") ||
                        "Enter your name exactly as it appears on your profile"
                  }
                />
              )}
            />
          </Grid>

          {/* PDF list */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
              {t("documents_heading")}
            </Typography>
            <Grid container spacing={1}>
              {docs.map(([url, title]) => {
                const done = !!downloaded[url];
                return (
                  <Grid item xs={12} sm={6} md={3} key={url}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        opacity: done ? 0.9 : 1,
                      }}
                    >
                      <img src={pdfIcon} alt="PDF" width={18} />
                      <Box
                        component="span"
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          onClick={() => markDownloaded(url)}
                        >
                          {t(title)}
                        </a>
                        {done && (
                          <CheckCircleIcon
                            color="success"
                            fontSize="small"
                            titleAccess={t("downloaded") || "Downloaded"}
                            aria-label={t("downloaded") || "Downloaded"}
                          />
                        )}
                      </Box>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </Grid>
        </Grid>

        <Box sx={{ textAlign: "start", mt: 4 }}>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {t("save")}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
