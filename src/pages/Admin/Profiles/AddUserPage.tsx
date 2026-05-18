// src/pages/Admin/Profiles/AddUserPage.tsx
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
  Checkbox,
  FormControlLabel,
  Paper,
  FormHelperText,
} from "@mui/material";
import { Autocomplete } from "@mui/material";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller, useWatch } from "react-hook-form";

import CustomNotification from "@/components/ui/CustomNotification";
import CustomError from "@/components/ui/CustomError";
import CustomTabSwitcher from "@/components/ui/CustomTabSwitcher";

import { searchIBs, addUser } from "@/redux/slices/adminUsersSlice";
import { profilesTabs, ProfilesTabKey } from "./config";

interface IBOption {
  id: string;
  text: string;
}

interface FormValues {
  login: string;
  name: string;
  email: string;
  phone: string;
  is_ib: boolean;
  has_ib: boolean;
  ib: IBOption | null; // <— store the whole object
}

export default function AddUserPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { "*": subRoute = "" } = useParams();
  const tabs = profilesTabs(t);

  // redux state
  const { ibOptions, ibStatus, addStatus, addError } = useAppSelector(
    (s) => s.adminUsers
  );

  // snackbars
  const [okMsg, setOkMsg] = useState<string | false>(false);
  const [errMsg, setErrMsg] = useState<string | false>(false);

  // RHF
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      login: "",
      name: "",
      email: "",
      phone: "",
      is_ib: false,
      has_ib: false,
      ib: null,
    },
  });

  // watch has_ib so we can require IB only when needed
  const hasIB = useWatch({ control, name: "has_ib" });

  // when the slice gives us a result, show a toast & clear
  useEffect(() => {
    if (addStatus === "succeeded") {
      setOkMsg(t("user_add_success", "User created successfully"));
      setErrMsg(false);
      reset();
    } else if (addStatus === "failed") {
      setErrMsg(addError ?? t("user_add_error", "Failed to create user"));
      setOkMsg(false);
    }
  }, [addStatus, addError, reset, t]);

  const onSubmit = (vals: FormValues) => {
    // strip out only the id to send to the server
    const payload = {
      login: vals.login,
      name: vals.name,
      email: vals.email,
      phone: vals.phone,
      is_ib: vals.is_ib,
      has_ib: vals.has_ib,
      ...(vals.has_ib && vals.ib ? { ib_id: vals.ib.id } : {}),
    };
    dispatch(addUser(payload));
  };

  // tabs
  // tabs
  const activeTab = (tabs.find((tab) => subRoute.includes(tab.key)) ?? tabs[0])
    .key as ProfilesTabKey;
  const handleTabChange = (k: ProfilesTabKey) =>
    navigate(tabs.find((t) => t.key === k)!.path);

  // separate regular vs create_profile
  const regularTabs = tabs.filter((t) => t.key !== "create_profile");
  const createProfileTab = tabs.find((t) => t.key === "create_profile");

  return (
    <Paper sx={{ p: 2, boxShadow: "none" }}>
      <Box display="flex" flexDirection="column" alignItems="flex-start" ml={2}>
        <CustomTabSwitcher
          tabs={regularTabs.map(({ key, label }) => ({
            key,
            label,
            iconClass: "la-icon-default",
          }))}
          activeTab={activeTab}
          onTabChange={handleTabChange as any}
        />

        {createProfileTab && (
          <Box mt={2}>
            <Button
              variant={
                activeTab === createProfileTab.key ? "contained" : "outlined"
              }
              startIcon={<i className="la la-plus" style={{ fontSize: 20 }} />}
              onClick={() => handleTabChange(createProfileTab.key as any)}
            >
              {createProfileTab.label}
            </Button>
          </Box>
        )}
      </Box>

      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{ p: 3, mx: "auto" }}
      >
        {okMsg && (
          <CustomNotification message={okMsg} onClose={() => setOkMsg(false)} />
        )}
        {errMsg && (
          <CustomError errorMessage={errMsg} onClose={() => setErrMsg(false)} />
        )}

        <Typography variant="h5" gutterBottom>
          {t("add_user", "Add User")}
        </Typography>
        <Stack spacing={2}>
          {/** Login */}
          <Controller
            name="login"
            control={control}
            rules={{ required: true }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label={t("login", "Login")}
                fullWidth
                required
                error={!!fieldState.error}
                helperText={fieldState.error && t("required")}
              />
            )}
          />

          {/** Name */}
          <Controller
            name="name"
            control={control}
            rules={{ required: true }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label={t("name", "Name")}
                fullWidth
                required
                error={!!fieldState.error}
                helperText={fieldState.error && t("required")}
              />
            )}
          />

          {/** Email */}
          <Controller
            name="email"
            control={control}
            rules={{
              required: true,
              pattern: /^\S+@\S+\.\S+$/,
            }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                type="email"
                label={t("email", "Email")}
                fullWidth
                required
                error={!!fieldState.error}
                helperText={
                  fieldState.error?.type === "pattern"
                    ? t("invalid_email")
                    : fieldState.error && t("required")
                }
              />
            )}
          />

          {/** Phone */}
          <Controller
            name="phone"
            control={control}
            rules={{ required: true, minLength: 4 }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label={t("phone", "Phone")}
                fullWidth
                required
                error={!!fieldState.error}
                helperText={fieldState.error && t("required")}
              />
            )}
          />

          {/** Is IB */}
          <Controller
            name="is_ib"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Checkbox {...field} checked={field.value} />}
                label={t("is_ib", "Is IB?")}
              />
            )}
          />

          {/** Has IB */}
          <Controller
            name="has_ib"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Checkbox {...field} checked={field.value} />}
                label={t("has_ib", "Has an IB?")}
              />
            )}
          />

          {/** Autocomplete, only if has_ib */}
          {hasIB && (
            <Controller
              name="ib"
              control={control}
              rules={{ required: true }}
              render={({ field, fieldState }) => (
                <>
                  <Autocomplete<IBOption>
                    options={ibOptions}
                    getOptionLabel={(o) => o.text}
                    loading={ibStatus === "loading"}
                    onInputChange={(_, v) =>
                      v.length >= 3 && dispatch(searchIBs(v))
                    }
                    onChange={(_, v) => field.onChange(v)}
                    value={field.value}
                    isOptionEqualToValue={(opt, val) => opt.id === val?.id}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={t("ib_name", "IB Name")}
                        fullWidth
                        required
                        error={!!fieldState.error}
                        helperText={fieldState.error && t("required")}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {ibStatus === "loading" && (
                                <CircularProgress size={20} />
                              )}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                  {!!fieldState.error && (
                    <FormHelperText error>{t("required")}</FormHelperText>
                  )}
                </>
              )}
            />
          )}

          <Box sx={{ textAlign: "right", mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={18} /> : null}
            >
              {t("save", "Save")}
            </Button>
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
}
