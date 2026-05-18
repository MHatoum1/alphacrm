// src/pages/Admin/Groups/GroupsEditorPage.tsx
import { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  CircularProgress,
  useTheme,
  useMediaQuery,
  FormLabel,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  fetchGroup,
  createGroup,
  updateGroup,
  fetchGroupsByServer,
} from "@/redux/slices/adminGroupsSlice";
import { fetchTypes, fetchReportServers } from "@/redux/slices/adminTypesSlice";
import CustomNotification from "@/components/ui/CustomNotification";
import CustomError from "@/components/ui/CustomError";
import { useTranslation } from "react-i18next";
import { Autocomplete, TextField } from "@mui/material";
type TypeOption = { id: number; type: string; short_value: string };

interface FormValues {
  configId: number;
  reportserver: string; // ← new field
  grp: string;
  currency: string;
  liveglobal: "live" | "demo" | "global";
  platform: string;
}

// define your blank initial form once
const EMPTY_FORM: FormValues = {
  configId: 0,
  reportserver: "",
  grp: "",
  currency: "",
  liveglobal: "live",
  platform: "mt5",
};

export default function GroupsEditorPage() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // adminGroups slice
  const { current, loading: groupLoading } = useAppSelector(
    (s) => s.adminGroups
  );

  // adminTypes slice: types & reportServers
  const {
    data: typesData,
    recordsFiltered: typesTotal,
    loading: typesLoading,
    reportServers,
  } = useAppSelector((s) => s.adminTypes);

  // map the raw DataTables rows → simple list
  const typesList = typesData.map((r) => ({
    id: r[0] as number,
    type: r[1] as string,
    short_value: r[2] as string,
  }));

  // now: the API returns an array of strings
  const [form, setForm] = useState<FormValues>(EMPTY_FORM);
  const [groupsList, setGroupsList] = useState<string[]>([]);

  // whenever we go from edit→new, clear out the old form & group list
  useEffect(() => {
    if (!isEdit) {
      setForm(EMPTY_FORM);
      setGroupsList([]);
    }
  }, [isEdit]);

  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  // 1) load types & report‑servers once
  useEffect(() => {
    dispatch(
      fetchTypes({
        urlPart: "types",
        gridState: {
          page: 0,
          pageSize: typesTotal || 1000,
          sortModel: [],
          filterValue: "",
          columns: [],
          backendColumns: {},
          draw: 1,
          order: 1, // sort by “type”
        },
      })
    );
    dispatch(fetchReportServers());
  }, [dispatch, typesTotal]);

  // 2) if editing, load this group
  useEffect(() => {
    if (isEdit) dispatch(fetchGroup(Number(id)));
  }, [dispatch, isEdit, id]);

  // 3) when the group arrives, populate form + load its groupsList
  useEffect(() => {
    if (current && isEdit) {
      setForm({
        configId: Number(current.ConfigId),
        reportserver: current.ConfigServerName,
        grp: current.Grp,
        currency: current.Currency,
        liveglobal: current.LiveGlobal as any,
        platform: current.Platform,
      });
      // also fire off your groupsList for that server:
      dispatch(fetchGroupsByServer(current.ConfigServerName))
        .unwrap()
        .then(setGroupsList);
    }
  }, [current, dispatch, isEdit]);

  // 4) whenever the user picks a Report Server, fetch its groups (string[])
  // 4) picking a server in “new” mode fetches its groups
  useEffect(() => {
    if (!isEdit && form.reportserver) {
      dispatch(fetchGroupsByServer(form.reportserver))
        .unwrap()
        .then(setGroupsList);
    }
  }, [form.reportserver, dispatch, isEdit]);

  const handleChange = <K extends keyof FormValues>(
    key: K,
    value: FormValues[K]
  ) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleSubmit = async () => {
    setErrMsg(null);
    setOkMsg(null);
    try {
      const payload: any = { ...form, ...(isEdit && { id: Number(id) }) };
      const action = isEdit ? updateGroup(payload) : createGroup(payload);
      await dispatch(action).unwrap();
      setOkMsg(
        isEdit
          ? t("group_updated", "Group updated")
          : t("group_created", "Group created")
      );
    } catch (e: any) {
      setErrMsg(e.message || t("save_failed", "Save failed"));
    }
  };

  if (groupLoading && isEdit && !current) return <CircularProgress />;

  return (
    <Paper sx={{ p: { xs: 2, md: 3 }, mx: "auto" }}>
      <Typography
        variant="h6"
        sx={{
          mb: 3,
          pb: 1,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        {isEdit ? t("edit_group", "Edit Group") : t("add_group", "Add Group")}
      </Typography>

      {okMsg && (
        <CustomNotification message={okMsg} onClose={() => setOkMsg(null)} />
      )}
      {errMsg && (
        <CustomError errorMessage={errMsg} onClose={() => setErrMsg(null)} />
      )}

      <Box
        component="form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <Grid container spacing={2}>
          {/* 1) Type */}
          <Grid item xs={12}>
            <Autocomplete<TypeOption, false, false, false>
              size="small"
              options={typesList}
              getOptionLabel={(opt) =>
                `${opt.id} : ${opt.type} (${opt.short_value})`
              }
              loading={typesLoading}
              autoHighlight
              autoSelect
              filterSelectedOptions={false}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={typesList.find((o) => o.id === form.configId) || null}
              onChange={(_, selected) =>
                handleChange("configId", selected?.id ?? 0)
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("type", "Type")}
                  required
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {typesLoading && <CircularProgress size={20} />}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          {/* 2) Report Server */}
          <Grid item xs={12}>
            <Autocomplete<(typeof reportServers)[number]>
              size="small"
              freeSolo={false}
              autoHighlight
              options={reportServers}
              getOptionLabel={(srv) => srv.server_name}
              loading={typesLoading}
              disabled={isEdit}
              // keep the selected option in sync with form.reportserver
              value={
                reportServers.find(
                  (s) => s.server_name === form.reportserver
                ) || null
              }
              onChange={(_, selected) =>
                !isEdit &&
                handleChange("reportserver", selected?.server_name ?? "")
              }
              // ← and here
              isOptionEqualToValue={(option, value) =>
                option.server_name === value.server_name
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("server_name", "Server Name")}
                  required
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {typesLoading ? <CircularProgress size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          {/* 3) Group */}
          <Grid item xs={12}>
            <Autocomplete
              size="small"
              freeSolo={false}
              options={groupsList}
              // current text value lives in form.grp
              value={form.grp}
              onChange={(_, v) => handleChange("grp", v || "")}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t("group", "Group")}
                  required
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {groupLoading ? <CircularProgress size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          {/* 4) Currency */}
          <Grid item xs={12}>
            <FormControl fullWidth size="small" required>
              <InputLabel>{t("currency", "Currency")}</InputLabel>
              <Select
                value={form.currency}
                label={t("currency", "Currency")}
                onChange={(e) => handleChange("currency", e.target.value)}
              >
                {["USD", "EUR", "LBP"].map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* 5) Live / Demo / Wallet */}
          <Grid item xs={12}>
            <FormControl component="fieldset" fullWidth size="small">
              <FormLabel component="legend">
                {t("live_or_wallet", "Live / Demo / Wallet")}
              </FormLabel>
              <RadioGroup
                row
                value={form.liveglobal}
                onChange={(e) =>
                  handleChange("liveglobal", e.target.value as any)
                }
              >
                <FormControlLabel
                  value="live"
                  control={<Radio size="small" />}
                  label={t("live", "Live")}
                />
                <FormControlLabel
                  value="demo"
                  control={<Radio size="small" />}
                  label={t("demo", "Demo")}
                />
                <FormControlLabel
                  value="global"
                  control={<Radio size="small" />}
                  label={t("wallet", "Wallet")}
                />
              </RadioGroup>
            </FormControl>
          </Grid>

          {/* 6) Submit */}
          <Grid item xs={12}>
            <Box sx={{ textAlign: isMobile ? "left" : "right", mt: 2 }}>
              <Button type="submit" variant="contained">
                {isEdit
                  ? t("save_changes", "Save Changes")
                  : t("create_group", "Create Group")}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}
