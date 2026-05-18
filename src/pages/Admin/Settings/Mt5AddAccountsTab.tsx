import { useEffect, useMemo, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormLabel,
  Paper,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  clearMt5Logins,
  fetchMt5AccountTypes,
  fetchMt5Logins,
  fetchMt5Servers,
  fetchMt5Users,
  submitMt5Account,
  Option,
} from "@/redux/slices/mt5AddAccountSlice";
import CustomNotification from "@/components/ui/CustomNotification";
import CustomError from "@/components/ui/CustomError";

export default function Mt5AddAccountsTab() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const {
    users,
    usersStatus,
    servers,
    logins,
    loginsStatus,
    accountTypes,
    accountTypesStatus,
    submitStatus,
    error,
  } = useAppSelector((s) => s.mt5AddAccount);

  const [userInput, setUserInput] = useState("");
  const [selectedUser, setSelectedUser] = useState<Option | null>(null);
  const [serverType, setServerType] = useState("");
  const [loginInput, setLoginInput] = useState("");
  const [selectedLogin, setSelectedLogin] = useState<Option | null>(null);
  const [accountType, setAccountType] = useState("");
  const [okMsg, setOkMsg] = useState("");
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    dispatch(fetchMt5Servers());
    dispatch(fetchMt5AccountTypes());
  }, [dispatch]);

  useEffect(() => {
    if (userInput.length >= 3) dispatch(fetchMt5Users({ query: userInput }));
  }, [userInput, dispatch]);

  useEffect(() => {
    if (!serverType) {
      dispatch(clearMt5Logins());
      setSelectedLogin(null);
      setLoginInput("");
      return;
    }
    if (loginInput.length >= 1) {
      dispatch(fetchMt5Logins({ server: serverType, query: loginInput }));
    }
  }, [serverType, loginInput, dispatch]);

  const serverOptions = useMemo(
    () =>
      servers.map((s) => ({
        id: s.server_type,
        label: s.server_name,
      })),
    [servers]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return setErrMsg(t("user_email_is_required"));
    if (!serverType) return setErrMsg(t("mt5_server_is_required"));
    if (!selectedLogin) return setErrMsg(t("mt5_login_is_required"));
    if (!accountType) return setErrMsg(t("account_type_is_required"));
    try {
      await dispatch(
        submitMt5Account({
          user_id: selectedUser.id,
          mt5_server: serverType,
          mt5_login: selectedLogin.id,
          account_type: accountType,
        })
      ).unwrap();
      setErrMsg("");
      setOkMsg(t("mt5_account_added"));
      setSelectedUser(null);
      setUserInput("");
      setServerType("");
      setSelectedLogin(null);
      setLoginInput("");
      setAccountType("");
    } catch (e: any) {
      setErrMsg(e?.message ?? t("update_failed"));
    }
  };

  return (
    <Paper sx={{ p: 3, border: 1, borderColor: "divider", mt: 2 }}>
      {okMsg && (
        <CustomNotification message={okMsg} onClose={() => setOkMsg("")} />
      )}
      {(errMsg || error) && (
        <CustomError
          errorMessage={errMsg || error || t("unexpected_error")}
          onClose={() => setErrMsg("")}
        />
      )}

      <Typography variant="h6" gutterBottom>
        {t("add_mt5_account")}
      </Typography>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Autocomplete<Option, false, false, false>
          options={Array.isArray(users) ? users : []}
          value={selectedUser}
          inputValue={userInput}
          onInputChange={(_, v, reason) => {
            if (reason === "input") setUserInput(v);
          }}
          loading={usersStatus === "loading"}
          onChange={(_, opt) => {
            setSelectedUser(opt ?? null);
            setUserInput(opt?.text ?? "");
          }}
          getOptionLabel={(o) => o.text}
          isOptionEqualToValue={(opt, val) => opt.id === val.id}
          renderInput={(params) => (
            <TextField
              {...params}
              label={t("user_email")}
              InputProps={{
                ...params.InputProps,
                endAdornment:
                  usersStatus === "loading" ? (
                    <CircularProgress size={20} />
                  ) : (
                    params.InputProps.endAdornment
                  ),
              }}
            />
          )}
        />

        <Box mt={2}>
          <TextField
            select
            fullWidth
            value={serverType}
            onChange={(e) => setServerType(e.target.value)}
            SelectProps={{ native: true }}
          >
            <option value="">{t("select_server")}</option>
            {serverOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </TextField>
        </Box>

        <Box mt={2}>
          <Autocomplete<Option, false, false, false>
            options={Array.isArray(logins) ? logins : []}
            value={selectedLogin}
            inputValue={loginInput}
            disabled={!serverType}
            onInputChange={(_, v, reason) => {
              if (reason === "input") setLoginInput(v);
            }}
            loading={loginsStatus === "loading"}
            onChange={(_, opt) => {
              setSelectedLogin(opt ?? null);
              setLoginInput(opt?.text ?? "");
            }}
            getOptionLabel={(o) => o.text}
            isOptionEqualToValue={(opt, val) => opt.id === val.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t("mt5_logins")}
                InputProps={{
                  ...params.InputProps,
                  endAdornment:
                    loginsStatus === "loading" ? (
                      <CircularProgress size={20} />
                    ) : (
                      params.InputProps.endAdornment
                    ),
                }}
              />
            )}
          />
        </Box>

        <Box mt={2}>
          <FormControl component="fieldset" disabled={accountTypesStatus === "loading"}>
            <FormLabel component="legend">{t("account_type")}</FormLabel>
            <RadioGroup
              row
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
            >
              {(Array.isArray(accountTypes) ? accountTypes : []).map((tType) => (
                <FormControlLabel
                  key={tType.shortval}
                  value={tType.shortval}
                  control={<Radio />}
                  label={tType.type}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </Box>

        <Box mt={3} textAlign="right">
          <Button
            type="submit"
            variant="contained"
            disabled={submitStatus === "loading"}
          >
            {t("submit")}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
