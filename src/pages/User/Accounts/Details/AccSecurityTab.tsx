/* AccSecurityTab.tsx --------------------------------------------------- */
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  InputAdornment,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { useParams } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { updateAccountPassword } from "@/redux/slices/accountDetailSlice";
import CustomNotification from "@/components/ui/CustomNotification";
import CustomError from "@/components/ui/CustomError";

interface PasswordForm {
  newPassword: string;
  confirmPassword: string;
}

export default function AccSecurityTab() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  /* ─── route + auth -------------------------------------------------- */
  const { uid = "" } = useParams<"uid">();
  const stored = localStorage.getItem("user");
  const user = stored ? JSON.parse(stored) : null;
  const user_id = user?.userID as string;

  /* ─── snackbars ----------------------------------------------------- */
  const [ok, setOk] = useState<string | false>(false);
  const [err, setErr] = useState<string | false>(false);

  /* ─── react-hook-form ---------------------------------------------- */
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PasswordForm>();

  const [show1, set1] = useState(false);
  const [show2, set2] = useState(false);

  /* pattern: 5-15 chars, at least 1 digit + 1 letter, allow specials */
  const pwdPattern =
    /^(?=.*[0-9])(?=.*[A-Za-z])[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{5,15}$/;

  const dispatch = useAppDispatch();
  const saving =
    useAppSelector((s) => s.accountDetails.statusPwd) === "loading";

  const onSubmit = async (vals: PasswordForm) => {
    if (!user_id) {
      setErr("User not found");
      return;
    }

    try {
      await dispatch(
        updateAccountPassword({ uid, user_id, password: vals.newPassword })
      ).unwrap();
      setOk(t("password_changed_successfully"));
    } catch (e: any) {
      setErr(e?.message || t("save_failed"));
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },
        border: `1px solid ${theme.palette.divider}`,
        maxWidth: 500,
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
        {isMobile ? t("password_short") : t("set_new_password")}
      </Typography>

      {/* feedback banners */}
      {ok && <CustomNotification message={ok} onClose={() => setOk(false)} />}
      {err && <CustomError errorMessage={err} onClose={() => setErr(false)} />}

      <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
        {/* ── new password ─────────────────────────────────────────── */}
        <Controller
          name="newPassword"
          control={control}
          rules={{
            required: true,
            pattern: {
              value: pwdPattern,
              message: t("error_password_rules"), // you can localise this key
            },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              type={show1 ? "text" : "password"}
              label={t("new_password")}
              fullWidth
              margin="normal"
              error={!!errors.newPassword}
              helperText={errors.newPassword?.message as string}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton edge="end" onClick={() => set1((v) => !v)}>
                      {show1 ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}
        />

        {/* ── confirm password ─────────────────────────────────────── */}
        <Controller
          name="confirmPassword"
          control={control}
          rules={{
            required: true,
            validate: (value) =>
              value === watch("newPassword") || t("error_passwords_match"),
          }}
          render={({ field }) => (
            <TextField
              {...field}
              type={show2 ? "text" : "password"}
              label={t("confirm_password")}
              fullWidth
              margin="normal"
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message as string}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton edge="end" onClick={() => set2((v) => !v)}>
                      {show2 ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}
        />

        {/* ── submit ──────────────────────────────────────────────── */}
        <Box textAlign="right" mt={2}>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? t("saving") : t("btn_save_password")}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
