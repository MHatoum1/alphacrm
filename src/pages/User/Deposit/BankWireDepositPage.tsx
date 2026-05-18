/*  src/pages/User/Deposit/BankWireDepositPage.tsx
    ------------------------------------------------ */
import {
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Paper,
  TextField,
  Typography,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import { Fragment, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchBankWireMeta,
  sendBankWireDeposit,
  BankWireAccount,
  BankWireBank,
  BankWirePurse,
  resetBankWire,
} from "@/redux/slices/bankWireSlice";
import CustomNotification from "@/components/ui/CustomNotification";
import CustomError from "@/components/ui/CustomError";

export default function BankWireDepositPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const dispatch = useAppDispatch();

  /* ─── current user ─────────────────────────────────────────── */
  const stored = localStorage.getItem("user");
  const user = stored ? JSON.parse(stored) : null;

  const noneuropean = user?.noneuropean || false;
  const user_id = user?.userID as string | undefined;

  /* ─── slice state ──────────────────────────────────────────── */
  const { accounts, banks, purses, status, redirect, reference, error } =
    useAppSelector((s) => s.bankwire);

  /* ─── local form state ─────────────────────────────────────── */
  const [to, setTo] = useState(""); // account UID
  const [amount, setAmt] = useState<number>(0);
  const [curr, setCurr] = useState("USD");
  const [bank, setBank] = useState(""); // “USD Bank Of Cyprus”
  const [purse, setPurse] = useState("");

  /* bank-details that are stored with the TX */
  const [bankName, setBankName] = useState("");
  const [acctNo, setAcctNo] = useState("");
  const [acctName, setAcctName] = useState("");
  const [iban, setIban] = useState("");
  const [swift, setSwift] = useState("");
  const [bAddress, setBAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");

  const [ok, setOk] = useState<string | false>(false);
  const [ko, setKo] = useState<string | false>(false);

  /* ─── load meta once ───────────────────────────────────────── */

  useEffect(() => {
    if (purse === "") {
      setBankName("");
      setAcctNo("");
      setAcctName("");
      setIban("");
      setSwift("");
      setBAddress("");
      setCity("");
      setCountry("");
    }
  }, [purse]);

  const readOnly = purse !== ""; //  true → stored purse chosen

  useEffect(() => {
    if (user_id) dispatch(fetchBankWireMeta(user_id));
    return () => {
      dispatch(resetBankWire());
    };
  }, [user_id, dispatch]);

  /* ─── pre-fill free-text fields when user selects a stored purse ─── */
  const purseInfo = useMemo(
    () => purses.find((p) => p.uid === purse),
    [purse, purses]
  );
  useEffect(() => {
    if (!purseInfo) return;
    const d = purseInfo.details || {};
    setBankName(d["Bank Name"] || "");
    setAcctNo(d["Bank Account Number"] || "");
    setAcctName(d["Name on Bank Account"] || "");
    setIban(d["IBAN"] || "");
    setSwift(d["SWIFT-ABA-Routing Number"] || "");
    setBAddress(d["Bank Address"] || "");
    setCity(d["City"] || "");
    setCountry(d["Country"] || "");
  }, [purseInfo]);

  /* ─── submit ───────────────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user_id) {
      setKo(t("deposit_err_user"));
      return;
    }
    if (!to) {
      setKo(t("deposit_err_to"));
      return;
    }
    if (amount <= 0) {
      setKo(t("deposit_err_amount"));
      return;
    }
    if (!bank) {
      setKo(t("deposit_err_bank"));
      return;
    }

    const client_bank = {
      "Bank Name": bankName,
      "Bank Account Number": acctNo,
      "Name on Bank Account": acctName,
      IBAN: iban,
      "SWIFT-ABA-Routing Number": swift,
      "Bank Address": bAddress,
      City: city,
      Country: country,
    };

    try {
      await dispatch(
        sendBankWireDeposit({
          user_id,
          to,
          amount,
          currency: curr,
          bank,
          purse: purse || undefined,
          client_bank,
        })
      ).unwrap();
      setOk(t("bank_confirmation"));
    } catch (err: any) {
      setKo(err?.message || t("deposit_err_default"));
    }
  };

  /* ─── loading & fatal error placeholders ──────────────────── */
  if (status === "loading")
    return (
      <Box textAlign="center" mt={4}>
        <CircularProgress />
      </Box>
    );

  if (status === "failed")
    return (
      <CustomError
        errorMessage={error || t("deposit_err_default")}
        onClose={() => nav("/deposit")}
      />
    );

  /* ─── helpers to render <MenuItem/>s ───────────────────────── */
  const optAcc = (a: BankWireAccount) => (
    <MenuItem key={a.uid} value={a.uid}>
      {a.label}
    </MenuItem>
  );
  const optBank = (b: BankWireBank) => (
    <MenuItem key={b.code} value={b.code}>
      {b.label}
    </MenuItem>
  );
  const optPurse = (p: BankWirePurse) => (
    <MenuItem key={p.uid} value={p.uid}>
      {p.label}
    </MenuItem>
  );

  /* ------------------------------------------------------------------
     Build the confirmation “Payment Instructions” table on-the-fly.
     Everything is available on the page – no extra API request needed.
  ------------------------------------------------------------------ */
  const selBank = banks.find((b) => b.code === bank);
  const company_name = noneuropean ? "Alpha Trust AI" : "Growell Capital Ltd.";

  const company_address = noneuropean
    ? "Icount building, First Floor, Kumul Highway, Port Vila, Vanuatu"
    : "Arc. Makariou C 59 | Steratzias Court Block A, Office 14 | 4003, Limassol, Cyprus";

  const bDet = selBank?.details ?? {}; // shorthand
  const confirmRows: Array<[string, string]> = [
    [t("company_name"), company_name],
    [t("company_address"), company_address],
    [t("transfer_details"), `${t("reference")} ${reference}`],
    [t("amount"), `${amount.toFixed(2)} ${curr}`],

    /* pure bank coordinates */
    [t("bank_name"), bDet["Bank Name"] ?? ""],
    [t("bank_address"), bDet["Bank Address"] ?? ""],
    [t("swift"), bDet["SWIFT"] ?? ""],
    [t("bank_post_address"), bDet["Bank Post Address"] ?? ""],
    [t("account_name"), bDet["Account Name"] ?? ""],
    [t("account_number"), bDet["Account Number"] ?? ""],
    [t("iban"), bDet["IBAN"] ?? ""],
  ];
  /* ─── print helper ─────────────────────────────────────────── */
  const handlePrint = async () => {
    /* 1 ── fetch the raw template (served from /templates/…) */
    const filename = noneuropean
      ? "transaction_bank_html_eu"
      : "transaction_bank_html";
    const tpl = await fetch("/templates/" + filename).then((r) => r.text());

    /* 2 ── map every ###PLACEHOLDER### to a value  */
    const map: Record<string, string> = {
      "COMPANY NAME": "Alpha Trust AI",
      "COMPANY ADDRESS":
        "Icount building, First Floor, Kumul Highway, Port Vila, Vanuatu",
      REFERENCE: `Reference ${reference}`,
      AMOUNT: `${amount.toFixed(2)} ${curr}`,
      CURRENCY: curr,

      /* all coordinates coming from the selected beneficiary bank   */
      "BANK NAME": bDet["Bank Name"] ?? "",
      "BANK ADDRESS": bDet["Bank Address"] ?? "",
      "BANK POST ADDRESS": bDet["Bank Post Address"] ?? "",
      SWIFT: bDet["SWIFT"] ?? "",
      "ACCOUNT NAME": bDet["Account Name"] ?? "",
      "ACCOUNT NUMBER": bDet["Account Number"] ?? "",
      IBAN: bDet["IBAN"] ?? "",
    };

    /* 3 ── replace placeholders, then scrub leftovers  */
    let html = tpl;
    Object.entries(map).forEach(([k, v]) => {
      const ph = `###${k}###`;
      html = html.split(ph).join(v); // ← works in ES5+
    });
    html = html.replace(/###\w+###/g, ""); // remove unused

    /* 4 ── open new tab, write HTML, print */
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
  };
  /* ─── ui ───────────────────────────────────────────────────── */
  return (
    <Box sx={{ p: { xs: 2 } }}>
      <Paper sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
        {ok && <CustomNotification message={ok} onClose={() => setOk(false)} />}
        {ko && <CustomError errorMessage={ko} onClose={() => setKo(false)} />}

        <Typography variant="h6">{t("deposit_bank_title")}</Typography>

        {/* ── STEP 1 : form ───────────────────────────────────── */}
        {!redirect && (
          <Box component="form" onSubmit={handleSubmit}>
            {/* destination account */}
            <TextField
              select
              fullWidth
              required
              margin="normal"
              label={t("to_account")}
              value={to}
              onChange={(e) => setTo(e.target.value)}
            >
              {accounts.map(optAcc)}
            </TextField>

            {/* amount / currency */}
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

            {/* beneficiary bank */}
            <TextField
              select
              fullWidth
              required
              margin="normal"
              label={t("bank")}
              value={bank}
              onChange={(e) => setBank(e.target.value)}
            >
              {banks.map(optBank)}
            </TextField>

            {/* stored purse (optional) */}
            <TextField
              select
              fullWidth
              margin="normal"
              label={t("stored_bank_account")}
              value={purse}
              onChange={(e) => setPurse(e.target.value)}
            >
              <MenuItem value="">{t("please_select")}</MenuItem>
              {purses.map(optPurse)}
            </TextField>

            <Typography variant="subtitle1" sx={{ mt: 2 }}>
              {t("bank_details")}
            </Typography>

            {/* free-text bank details */}
            <TextField
              fullWidth
              margin="dense"
              required
              label={t("bank_name")}
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              InputProps={{ readOnly }}
            />
            <TextField
              fullWidth
              margin="dense"
              required
              label={t("bank_account_number")}
              value={acctNo}
              onChange={(e) => setAcctNo(e.target.value)}
              InputProps={{ readOnly }}
            />
            <TextField
              fullWidth
              margin="dense"
              required
              label={t("name_on_bank_account")}
              value={acctName}
              onChange={(e) => setAcctName(e.target.value)}
              InputProps={{ readOnly }}
            />
            <TextField
              fullWidth
              margin="dense"
              label="IBAN"
              value={iban}
              onChange={(e) => setIban(e.target.value)}
              InputProps={{ readOnly }}
            />
            <TextField
              fullWidth
              margin="dense"
              label="SWIFT / ABA / Routing"
              value={swift}
              onChange={(e) => setSwift(e.target.value)}
              InputProps={{ readOnly }}
            />
            <TextField
              fullWidth
              margin="dense"
              label={t("bank_address")}
              value={bAddress}
              onChange={(e) => setBAddress(e.target.value)}
              InputProps={{ readOnly }}
            />
            <TextField
              fullWidth
              margin="dense"
              label={t("city")}
              value={city}
              onChange={(e) => setCity(e.target.value)}
              InputProps={{ readOnly }}
            />
            <TextField
              fullWidth
              margin="dense"
              label={t("country")}
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              InputProps={{ readOnly }}
            />

            <Box textAlign="right" mt={2}>
              <Button variant="contained" type="submit">
                {t("send")}
              </Button>
            </Box>
          </Box>
        )}

        {/* ── STEP 2 : confirmation panel ─────────────────────── */}
        {redirect && (
          <Fragment>
            <Typography variant="h6" sx={{ mt: 1, mb: 1 }}>
              {t("payment_instructions")}
            </Typography>

            <Table size="small">
              <TableBody>
                {confirmRows.map(([k, v]) =>
                  v ? (
                    <TableRow key={k}>
                      <TableCell sx={{ fontWeight: 600, width: "35%" }}>
                        {k}
                      </TableCell>
                      <TableCell>{v}</TableCell>
                    </TableRow>
                  ) : null
                )}
              </TableBody>
            </Table>

            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              * {t("bankwire_note_full_credentials")}
              <br />
              ** {t("bankwire_note_use_reference")}
            </Typography>

            <Box textAlign="right" mt={2}>
              <Button
                onClick={handlePrint} // ← instead of href/target
                variant="contained"
                size="large"
              >
                {t("print_payment_instructions")}
              </Button>
            </Box>
          </Fragment>
        )}
      </Paper>
    </Box>
  );
}
