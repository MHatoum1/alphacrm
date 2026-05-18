// src/pages/User/Accounts/CreateAccountPage.tsx
import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Stack,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchCreateOptions,
  createAccount,
  resetAccountCreate,
} from "@/redux/slices/accountCreateSlice";
import CustomNotification from "@/components/ui/CustomNotification";
import CustomError from "@/components/ui/CustomError";
import appearanceJSON from "@/assets/constants/appearance.json";
import { fetchAccounts } from "@/redux/slices/userAccountsSlice";

export default function CreateAccountPage() {
  const { t } = useTranslation();

  const dispatch = useAppDispatch();
  const nav = useNavigate();

  /* ─── url params ─── */
  const { type, shortval, className, platform } = useParams<
    "type" | "shortval" | "className" | "platform"
  >();

  const safeShort = shortval as string;
  const accountName =
    (appearanceJSON.account_names as Record<string, string>)[safeShort] ??
    safeShort;

  const stored = localStorage.getItem("user");
  const user = stored ? JSON.parse(stored) : null;
  const user_id = user?.userID;

  const { options, status, error } = useAppSelector((s) => s.accountCreate);

  /* ─── local state ─── */
  const [currency, setCurrency] = useState("");
  const [leverage, setLeverage] = useState<number | "">("");
  const [demoFund, setDemoFund] = useState<number>(0);

  /* notifications */
  const [ok, setOk] = useState<string | false>(false);
  const [ko, setKo] = useState<string | false>(false);

  /* ─── load options once ─── */
  useEffect(() => {
    if (!user_id || !type || !shortval || !className || !platform) return;

    dispatch(
      fetchCreateOptions({
        user_id,
        type: type as any,
        shortval,
        className,
        platform: platform as any,
      })
    );
    return () => {
      dispatch(resetAccountCreate());
    };
  }, [dispatch, user_id, type, shortval, className, platform]);

  useEffect(() => {
    if (!options) return;
    setCurrency(options.defaultCurrency);
    setLeverage(options.defaultLeverage);
    if (options.showDemoFund) setDemoFund(options.demoFunds[0]);
  }, [options]);

  /* ─── submit ─── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user_id || !type || !shortval || !className || !platform) return;

    try {
      const { uid } = await dispatch(
        createAccount({
          params: {
            user_id,
            type: type as any,
            shortval,
            className,
            platform: platform as any,
          },
          currency,
          leverage: Number(leverage),
          demoFund: type === "demo" ? demoFund : undefined,
        })
      ).unwrap();
      dispatch(fetchAccounts({ user_id }));
      setOk(t("account_created_successfully"));
      setTimeout(() => nav(`/accounts/detailed/${uid}/transactions`), 2000);
    } catch (err: any) {
      setKo(err?.message || t("save_failed"));
    }
  };

  /* ─── render ─── */
  if (status === "loading" && !options)
    return (
      <Box textAlign="center" mt={4}>
        <CircularProgress />
      </Box>
    );

  if (status === "failed" && !options)
    return <CustomError errorMessage={error || "Error"} onClose={() => {}} />;

  if (!options) return null; // safeguard

  return (
    <Paper sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h6" mb={3}>
        {type === "demo"
          ? `${t("create_demo_title")} : ${accountName}`
          : `${t("create_live_title")} : ${accountName}`}
      </Typography>

      {ok && <CustomNotification message={ok} onClose={() => setOk(false)} />}
      {ko && <CustomError errorMessage={ko} onClose={() => setKo(false)} />}

      <Box component="form" onSubmit={handleSubmit}>
        {/* one row underneath another */}
        <Stack
          spacing={2} // a little tighter now that rows are shorter
          sx={{ maxWidth: 650, width: "100%" }}
        >
          {/* ─────────── Currency ─────────── */}
          <Box display="flex" alignItems="center">
            <Typography
              variant="subtitle2"
              sx={{ minWidth: 110, mr: 2 }} /* fixed label width */
            >
              {t("currency")}
            </Typography>

            <FormControl fullWidth>
              <Select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as string)}
              >
                {options.currencies.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* ─────────── Leverage ─────────── */}
          <Box display="flex" alignItems="center">
            <Typography variant="subtitle2" sx={{ minWidth: 110, mr: 2 }}>
              {t("leverage")}
            </Typography>

            <FormControl fullWidth>
              <Select
                value={leverage}
                onChange={(e) => setLeverage(Number(e.target.value))}
              >
                {options.leverages.map((l) => (
                  <MenuItem key={l} value={l}>{`1:${l}`}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* ─────────── Demo fund ─────────── */}
          {options.showDemoFund && (
            <Box display="flex" alignItems="center">
              <Typography variant="subtitle2" sx={{ minWidth: 110, mr: 2 }}>
                {t("initial_amount")}
              </Typography>

              <FormControl fullWidth>
                <Select
                  value={demoFund}
                  onChange={(e) => setDemoFund(Number(e.target.value))}
                >
                  {options.demoFunds.map((f) => (
                    <MenuItem key={f} value={f}>
                      {f}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
        </Stack>

        {/* submit button, still left-aligned and sitting under the fields */}
        <Box mt={4}>
          <Button
            type="submit"
            variant="contained"
            disabled={status === "loading"}
          >
            {t("btn_open_account")}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
