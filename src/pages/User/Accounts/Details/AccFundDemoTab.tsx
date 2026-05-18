/* AccFundDemoTab.tsx -------------------------------------------------- */
import {
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fundDemoAccount } from "@/redux/slices/accountDetailSlice";
import CustomNotification from "@/components/ui/CustomNotification";
import CustomError from "@/components/ui/CustomError";

interface FundForm {
  amount: number;
}

export default function AccFundDemoTab() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  /* ─── route + auth -------------------------------------------------- */
  const { uid = "" } = useParams<"uid">();
  const stored = localStorage.getItem("user");
  const user = stored ? JSON.parse(stored) : null;
  const user_id = user?.userID as string | undefined;

  /* ─── react-hook-form ---------------------------------------------- */
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FundForm>();

  /* ─── feedback banners --------------------------------------------- */
  const [ok, setOk] = useState<string | false>(false);
  const [err, setErr] = useState<string | false>(false);

  const dispatch = useAppDispatch();
  const saving = useAppSelector((s) => s.accountDetails.statusFD) === "loading";

  const onSubmit = async ({ amount }: FundForm) => {
    if (!user_id) {
      setErr(t("user_not_found"));
      return;
    }

    try {
      await dispatch(fundDemoAccount({ uid, user_id, amount })).unwrap();
      setOk(t("demo_funded", { amount }));
      reset(); // clear the field
    } catch (e: any) {
      setErr(e?.message || t("save_failed"));
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 3, mb: 3 },
        border: `1px solid ${theme.palette.divider}`,
        maxWidth: 500,
      }}
    >
      <Typography
        variant="h6"
        sx={{
          mb: 1,
          pb: 1,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        {isMobile ? t("fund_demo_short") : t("fund_demo_account")}
      </Typography>

      {/* feedback */}
      {ok && <CustomNotification message={ok} onClose={() => setOk(false)} />}
      {err && <CustomError errorMessage={err} onClose={() => setErr(false)} />}

      {/* form */}
      <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="amount"
          control={control}
          rules={{
            required: true,
            min: { value: 1, message: t("error_min_amount", { min: 1 }) },
            max: {
              value: 100000,
              message: t("error_max_amount", { max: 100000 }),
            },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              type="number"
              label={t("amount")}
              fullWidth
              margin="normal"
              error={!!errors.amount}
              helperText={
                (errors.amount?.message as string) ||
                t("max_amount", { max: 100000 })
              }
              inputProps={{ min: 1, max: 100000 }}
            />
          )}
        />

        <Box textAlign="right" mt={1}>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? t("sending") : t("btn_send")}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
