// src/pages/settings/RelationshipTab.tsx           ⟵ (updated)
import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  TextField,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { Autocomplete } from "@mui/material";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchuserOpts,
  fetchIBOptions,
  updateRelation,
  Option,
} from "@/redux/slices/adminSettingsSlice";
import CustomNotification from "@/components/ui/CustomNotification";
import CustomError from "@/components/ui/CustomError";
import { useTranslation } from "react-i18next";

export default function RelationshipTab() {
  const dispatch = useAppDispatch();
  const {
    ibOptions,
    userOpts,
    ibOptionsStatus,
    userOptsStatus,
    status,    //  ⇦ status of updateRelation
    error,     //  ⇦ error from updateRelation
  } = useAppSelector((s) => s.adminSettings);

  const { t } = useTranslation();

  /* ---------------- form ---------------- */
  const { control, handleSubmit, reset, formState } = useForm<{
    user_id: string;
    ib_id: string;
  }>({
    defaultValues: { user_id: "", ib_id: "" },
  });

  /* ---------------- local state ---------------- */
  const [userInput, setUserInput] = useState("");
  const [ibInput, setIbInput] = useState("");
  const [okMsg, setOkMsg]   = useState<string>("");  // ✅ success toast
  const [errMsg, setErrMsg] = useState<string>("");  // ❌ error toast

  /* ---------------- async look-ups ---------------- */
  useEffect(() => {
    if (userInput.length >= 3) dispatch(fetchuserOpts({ query: userInput }));
  }, [userInput, dispatch]);

  useEffect(() => {
    if (ibInput.length >= 3) dispatch(fetchIBOptions({ query: ibInput }));
  }, [ibInput, dispatch]);

  /* ---------------- form submit ---------------- */
  const onSubmit = async ({ user_id, ib_id }: { user_id: string; ib_id: string }) => {
    try {
      await dispatch(updateRelation({ user_id, ibId: ib_id })).unwrap();
      setOkMsg(t("relation_updated"));          // show success
      reset();                                  // clear form if you like
      setUserInput("");
      setIbInput("");
    } catch (e: any) {
      setErrMsg(e.message ?? t("update_failed"));
    }
  };

  /* ---------------- loading body ---------------- */
  if (status === "loading") {
    return (
      <Box textAlign="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  /* ---------------- render ---------------- */
  return (
    <Paper sx={{ p: 3, border: 1, borderColor: "divider", mt: 2 }}>
      {/* ------------ global toasts ------------- */}
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
        {t("update_ib_relationship")}
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* — User Autocomplete — */}
        <Controller
          name="user_id"
          control={control}
          render={({ field }) => {
            const selected = userOpts.find((o) => o.id === field.value) ?? null;

            return (
              <Autocomplete<Option, false, false, false>
                options={userOpts}
                value={selected}
                inputValue={userInput}
                onInputChange={(_, v, reason) => {
                  if (reason === "input") setUserInput(v);
                }}
                loading={userOptsStatus === "loading"}
                onChange={(_, opt) => {
                  field.onChange(opt?.id ?? "");
                  setUserInput(opt?.text ?? "");
                }}
                getOptionLabel={(o) => o.text}
                isOptionEqualToValue={(opt, val) => opt.id === val.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t("user")}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment:
                        userOptsStatus === "loading" ? (
                          <CircularProgress size={20} />
                        ) : (
                          params.InputProps.endAdornment
                        ),
                    }}
                  />
                )}
              />
            );
          }}
        />

        {/* — IB Autocomplete — */}
        <Box mt={2}>
          <Controller
            name="ib_id"
            control={control}
            render={({ field }) => {
              const selected = ibOptions.find((o) => o.id === field.value) ?? null;

              return (
                <Autocomplete<Option, false, false, false>
                  options={ibOptions}
                  value={selected}
                  inputValue={ibInput}
                  onInputChange={(_, v, reason) => {
                    if (reason === "input") setIbInput(v);
                  }}
                  loading={ibOptionsStatus === "loading"}
                  onChange={(_, opt) => {
                    field.onChange(opt?.id ?? "");
                    setIbInput(opt?.text ?? "");
                  }}
                  getOptionLabel={(o) => o.text}
                  isOptionEqualToValue={(opt, val) => opt.id === val.id}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t("introducing_broker")}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment:
                          ibOptionsStatus === "loading" ? (
                            <CircularProgress size={20} />
                          ) : (
                            params.InputProps.endAdornment
                          ),
                      }}
                    />
                  )}
                />
              );
            }}
          />
        </Box>

        <Box mt={3} textAlign="right">
          <Button
            type="submit"
            variant="contained"
            disabled={formState.isSubmitting}
          >
            {t("save")}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
