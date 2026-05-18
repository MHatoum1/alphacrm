import {
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Paper,
  TextField,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchBankWithdrawMeta,
  sendBankWithdraw,
  resetBankWithdraw,
} from "@/redux/slices/bankWithdrawSlice";
import CustomNotification from "@/components/ui/CustomNotification";
import CustomError from "@/components/ui/CustomError";

export default function BankTransferWithdrawPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const d = useAppDispatch();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const uid = user?.userID as string | undefined;

  const { wallets, purses, status, saving, msg, error } = useAppSelector(
    (s) => s.bankWithdraw
  );

  /* form ------------------------------------------------------ */
  const [wallet, setWallet] = useState("");
  const [amount, setAmt] = useState<number>(0);
  const [curr, setCurr] = useState("USD");
  const [purse, setPurse] = useState("");
  const [pin, setPin] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [bank, setBank] = useState<Record<string, string>>({
    "Bank Name": "",
    "Bank Account Number": "",
    "Name on Bank Account": "",
    IBAN: "",
    "SWIFT-ABA-Routing Number": "",
    "Bank Address": "",
    City: "",
    Country: "",
    SEPA: "0",
  });
  const [ko, setKo] = useState<string | false>(false);

  /* meta ------------------------------------------------------ */
  useEffect(() => {
    if (uid) d(fetchBankWithdrawMeta(uid));
    return () => {
      d(resetBankWithdraw());
    };
  }, [uid, d]);

  /* fill / reset when purse changes --------------------------- */
  const purseInfo = useMemo(
    () => purses.find((p) => p.uid === purse),
    [purse, purses]
  );
  useEffect(() => {
    if (!purseInfo) {
      setBank((b) => ({
        ...b,
        "Bank Name": "",
        "Bank Account Number": "",
        "Name on Bank Account": "",
        IBAN: "",
        "SWIFT-ABA-Routing Number": "",
        "Bank Address": "",
        City: "",
        Country: "",
      }));
      return;
    }
    setBank((b) => ({
      ...b,
      ...purseInfo.details, // overwrite with saved values
    }));
  }, [purseInfo]);

  const readOnly = !!purse;

  /* submit ---------------------------------------------------- */
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uid) return setKo(t("withdraw_err_user"));
    if (!wallet) return setKo(t("withdraw_err_wallet"));
    if (amount <= 0) return setKo(t("withdraw_err_amount"));
    if (!pin) return setKo(t("withdraw_err_pin"));
    if (!file) return setKo(t("withdraw_err_file"));

    /* SEPA mandatory if currency EUR -------------------------- */
    if (curr === "EUR" && bank.SEPA === "")
      return setKo(t("withdraw_err_sepa"));

    try {
      await d(
        sendBankWithdraw({
          user_id: uid,
          wallet,
          amount,
          currency: curr,
          purse: purse || undefined,
          bank,
          pin,
          file: file!,
        })
      ).unwrap();
    } catch {
      setKo(t("withdraw_err_default"));
    }
  };

  /* UI -------------------------------------------------------- */
  if (status === "loading")
    return (
      <Box textAlign="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  if (status === "failed")
    return (
      <CustomError
        errorMessage={error || t("withdraw_err_default")}
        onClose={() => nav("/withdraw")}
      />
    );

  const optW = (w: any) => (
    <MenuItem key={w.uid} value={w.uid}>
      {w.label}
    </MenuItem>
  );
  const optP = (p: any) => (
    <MenuItem key={p.uid} value={p.uid}>
      {p.label}
    </MenuItem>
  );

  return (
    <Box sx={{ p: { xs: 2 } }}>
      <Paper sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
        {msg && (
          <CustomNotification
            message={t(msg)}
            onClose={() => d(resetBankWithdraw())}
          />
        )}
        {ko && <CustomError errorMessage={ko} onClose={() => setKo(false)} />}

        <Typography variant="h6">{t("withdraw_bank_title")}</Typography>

        <Box component="form" onSubmit={submit}>
          {/* wallet / amount / currency ------------------------- */}
          <TextField
            select
            fullWidth
            required
            margin="normal"
            label={t("from_wallet")}
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
          >
            {wallets.map(optW)}
          </TextField>

          <TextField
            type="number"
            fullWidth
            required
            margin="normal"
            label={t("amount")}
            inputProps={{ min: 0, step: "any" }}
            value={amount || ""}
            onChange={(e) => setAmt(Number(e.target.value))}
          />

          <TextField
            select
            fullWidth
            required
            margin="normal"
            label={t("currency")}
            value={curr}
            onChange={(e) => setCurr(e.target.value)}
          >
            {["USD", "EUR", "GBP", "CHF", "AUD"].map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </TextField>

          {/* stored bank account -------------------------------- */}
          <TextField
            select
            fullWidth
            margin="normal"
            label={t("stored_bank_account")}
            value={purse}
            onChange={(e) => setPurse(e.target.value)}
          >
            <MenuItem value="">{t("please_select")}</MenuItem>
            {purses.map(optP)}
          </TextField>

          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            {t("bank_details")}
          </Typography>

          {/* bank coordinates ---------------------------------- */}
          {[
            "Bank Name",
            "Bank Account Number",
            "Name on Bank Account",
            "IBAN",
            "SWIFT-ABA-Routing Number",
            "Bank Address",
            "City",
            "Country",
          ].map((f) => (
            <TextField
              key={f}
              fullWidth
              margin="dense"
              required
              label={t(f.replace(/\s+/g, "_").toLowerCase())}
              value={bank[f] || ""}
              onChange={(e) => setBank({ ...bank, [f]: e.target.value })}
              InputProps={{ readOnly }}
            />
          ))}

          {/* SEPA yes/no  (only when EUR) ---------------------- */}
          {curr === "EUR" && (
            <Box mt={1}>
              <FormLabel>{t("has_sepa")}</FormLabel>
              <RadioGroup
                row
                value={bank.SEPA ?? ""}
                onChange={(e) => setBank({ ...bank, SEPA: e.target.value })}
              >
                <FormControlLabel
                  value="1"
                  control={<Radio />}
                  label={t("yes")}
                />
                <FormControlLabel
                  value="0"
                  control={<Radio />}
                  label={t("no")}
                />
              </RadioGroup>
            </Box>
          )}

          {/* file upload --------------------------------------- */}
          <Button component="label" sx={{ mt: 2, mb: 1 }}>
            {t("upload_bank_statement")}
            <input
              type="file"
              hidden
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </Button>
          {file && <Typography variant="caption">{file.name}</Typography>}

          {/* secure PIN ---------------------------------------- */}
          <TextField
            type="password"
            fullWidth
            required
            margin="normal"
            label={t("secure_pin")}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
          />

          <Box textAlign="right" mt={2}>
            <Button
              variant="contained"
              type="submit"
              disabled={saving === "loading"}
            >
              {t("send")}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
