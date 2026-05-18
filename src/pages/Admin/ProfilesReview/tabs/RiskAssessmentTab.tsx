import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  RadioGroup,
  Radio,
  FormControlLabel,
  TextField,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useAppDispatch } from "@/redux/hooks";
import { useParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { updateProfile, Profile } from "@/redux/slices/adminProfileReviewSlice";
import dayjs from "dayjs";
import signature from "@/assets/images/v1/nourasignature.png";
import CustomNotification from "@/components/ui/CustomNotification";
import CustomError from "@/components/ui/CustomError";
import { useTranslation } from "react-i18next";
/* ────────────────────────────
   1.  RHF model
   ──────────────────────────── */
interface RiskForm {
  /* one of “1”..“5” each  */
  comp_risk_client: string;
  comp_risk_client_description: string;
  comp_risk_service: string;
  comp_risk_service_description: string;
  comp_risk_geographical: string;
  comp_risk_geographical_description: string;
  comp_risk_delivery: string;
  comp_risk_delivery_description: string;

  /* derived + texts */
  comp_risk_final_score: string; // we save the sum as string – easy for PHP
  due_diligence_level: string;
  comp_risk_remark: string;
}

/* 5-point radio renderer ------------------------------------ */
const FiveRadio = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) => (
  <RadioGroup
    row
    value={value}
    onChange={(e) => onChange(e.target.value)}
    sx={{ "& .MuiFormControlLabel-root": { mr: 1 } }}
  >
    {["1", "2", "3", "4", "5"].map((n) => (
      <FormControlLabel
        key={n}
        value={n}
        control={<Radio size="small" />}
        label={n}
      />
    ))}
  </RadioGroup>
);

/* table “row” renderer (keeps JSX tidy) ---------------------- */
const RiskRow = ({
  label,
  valueName,
  descName,
  control,
}: {
  label: string;
  valueName: keyof RiskForm;
  descName: keyof RiskForm;
  control: any;
}) => (
  <TableRow>
    <TableCell sx={{ fontWeight: 500 }}>{label}</TableCell>

    <TableCell>
      <Controller
        name={valueName as any}
        control={control}
        rules={{ required: true }}
        render={({ field }) => <FiveRadio {...field} />}
      />
    </TableCell>

    <TableCell>
      <Controller
        name={descName as any}
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            multiline
            minRows={3}
            fullWidth
            size="small"
            placeholder="Add description…"
          />
        )}
      />
    </TableCell>
  </TableRow>
);

/* ────────────────────────────
   2.  Component
   ──────────────────────────── */
export default function RiskAssessmentTab() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  /* ── snack state ── */
  const [openSuccess, setOpenSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [openError, setOpenError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  /* pull profile from Redux (already loaded in <ReviewMenu/>) */
  const raw = useSelector(
    (s: RootState) => s.profileReview.data
  ) as Partial<Profile>;

  /* ----- initial defaults (memoised) ----------------------- */
  const defaults = useMemo<RiskForm>(
    () => ({
      comp_risk_client: raw.comp_risk_client ?? "",
      comp_risk_client_description: raw.comp_risk_client_description ?? "",
      comp_risk_service: raw.comp_risk_service ?? "",
      comp_risk_service_description: raw.comp_risk_service_description ?? "",
      comp_risk_geographical: raw.comp_risk_geographical ?? "",
      comp_risk_geographical_description:
        raw.comp_risk_geographical_description ?? "",
      comp_risk_delivery: raw.comp_risk_delivery ?? "",
      comp_risk_delivery_description: raw.comp_risk_delivery_description ?? "",

      comp_risk_final_score: raw.comp_risk_final_score ?? "",
      due_diligence_level: raw.due_diligence_level ?? "",
      comp_risk_remark: raw.comp_risk_remark ?? "",
    }),
    [raw]
  );

  /* ----- RHF setup ----------------------------------------- */
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: {  isSubmitting },
  } = useForm<RiskForm>({ defaultValues: defaults });
  useEffect(() => reset(defaults), [defaults, reset]);

  /* auto-calculate + show the total every time one risk changes */
  const vClient = useWatch({ control, name: "comp_risk_client" });
  const vServ = useWatch({ control, name: "comp_risk_service" });
  const vGeo = useWatch({ control, name: "comp_risk_geographical" });
  const vDeliv = useWatch({ control, name: "comp_risk_delivery" });

  const totalScore = [vClient, vServ, vGeo, vDeliv]
    .map((n) => parseInt(n || "0", 10))
    .reduce((a, b) => a + b, 0);

  /* push total into form state so it’s saved */
  useEffect(() => {
    setValue("comp_risk_final_score", String(totalScore));
  }, [totalScore, setValue]);

  /* ----- submit -------------------------------------------- */
  const onSubmit = async (vals: RiskForm) => {
    try {
      if (!id) return;
      await dispatch(
        updateProfile({
          id,
          section: "risk_assessment",
          fields: vals, // backend receives *exact* PHP names
        })
      ).unwrap();
      setSuccessMsg(t("risk_assessment_saved"));
      setOpenSuccess(true);
    } catch (err: any) {
      setErrorMsg(t(err.detail || err.message || "save_failed"));
      setOpenError(true);
    }
  };

  /* ----------------------------------------------------
   PRINT: clone printable area into a new window
---------------------------------------------------- */
  const printRef = useRef<HTMLDivElement>(null);

  /* ----------------------------------------------------
   PRINT (iframe version – immune to popup blockers)
---------------------------------------------------- */
  /* ----------------------------------------------------
   PRINT  –  clone page styles + add a few print tweaks
---------------------------------------------------- */
  /** helper – convert line-breaks to <br> */
  const br = (txt: string) => txt.replace(/\n/g, "<br/>");

  const handlePrint = () => {
    // grab *latest* form values ---------------------------------
    const vals = getValues(); // ← from RHF (destructure at the top)
    const profile = raw; // already in scope

    /* build the HTML table ------------------------------------- */
    const html = `
  <table style="width:100%;border-collapse:collapse;border:1px solid #000;font-size:12px">
    <tr>
      <th colspan="4"
          style="background:#c6efce;text-align:center;font-weight:bold;padding:8px;border:1px solid #000">
        CLIENT RISK ASSESSMENT
      </th>
    </tr>

    <tr>
      <td style="padding:8px;border:1px solid #000">Date</td>
      <td style="padding:8px;border:1px solid #000">${dayjs().format(
        "DD/MM/YYYY"
      )}</td>
      <td style="padding:8px;border:1px solid #000">Business Unit</td>
      <td style="padding:8px;border:1px solid #000">AML Department</td>
    </tr>

    <tr>
      <td style="padding:8px;border:1px solid #000">Form completed by</td>
      <td style="padding:8px;border:1px solid #000">${profile.name ?? ""}</td>
      <td style="padding:8px;border:1px solid #000">Signature</td>
      <td style="padding:8px;border:1px solid #000">
        <img src="${signature}" width="140" height="90"/>
      </td>
    </tr>

    <tr>
      <td style="padding:8px;border:1px solid #000">Client name</td>
      <td style="padding:8px;border:1px solid #000" colspan="3">${
        profile.name ?? ""
      }</td>
    </tr>

    <tr>
      <th style="background:#c6efce;text-align:center;border:1px solid #000">Risk factors</th>
      <th style="background:#c6efce;text-align:center;border:1px solid #000">Rating range</th>
      <th style="background:#c6efce;text-align:center;border:1px solid #000">Description</th>
      <th style="background:#c6efce;text-align:center;border:1px solid #000">Risk rating</th>
    </tr>

    ${[
      ["Client / client risk", "comp_risk_client"],
      ["Service / transaction risk", "comp_risk_service"],
      ["Geographical risk", "comp_risk_geographical"],
      ["Delivery-channel business risk", "comp_risk_delivery"],
    ]
      .map(
        ([label, key]) => `
        <tr>
          <td style="padding:8px;border:1px solid #000">${label}</td>
          <td style="padding:8px;border:1px solid #000">1&nbsp;–&nbsp;5</td>
          <td style="padding:8px;border:1px solid #000">${br(
            // @ts-expect-error  – dynamic index
            vals[`${key}_description`] || ""
          )}</td>
          <td style="padding:8px;border:1px solid #000">${
            vals[key as keyof RiskForm] || ""
          }</td>
        </tr>`
      )
      .join("")}

    <tr>
      <td style="padding:8px;border:1px solid #000" colspan="2" rowspan="3">
        <strong>Remarks:</strong><br/>${br(vals.comp_risk_remark || "")}
      </td>
      <td style="padding:8px;border:1px solid #000">Risk scoring</td>
      <td style="padding:8px;border:1px solid #000">${
        vals.comp_risk_final_score
      }</td>
    </tr>
    <tr>
      <td style="padding:8px;border:1px solid #000">Approval authority</td>
      <td style="padding:8px;border:1px solid #000">MLCO</td>
    </tr>
    <tr>
      <td style="padding:8px;border:1px solid #000">Due-diligence level</td>
      <td style="padding:8px;border:1px solid #000">${br(
        vals.due_diligence_level || ""
      )}</td>
    </tr>
  </table>`;

    /* clone global <style>/<link> so MUI fonts are available ---- */
    const cssLinks = Array.from(
      document.querySelectorAll<HTMLStyleElement | HTMLLinkElement>(
        'style,link[rel="stylesheet"]'
      )
    )
      .map((n) => n.outerHTML)
      .join("\n");

    /* open a print window -------------------------------------- */
    const win = window.open("", "_blank", "width=1024,height=768");
    if (!win) return;

    win.document.open();
    win.document.write(`<!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Print – Client risk assessment</title>
        ${cssLinks}
        <style>
          @page { margin:16mm 10mm; }
          body{ font-family:Roboto,Arial,sans-serif;font-size:12px; }
          th{ background:#c6efce !important; -webkit-print-color-adjust:exact; color-adjust:exact; }
        </style>
      </head>
      <body>${html}</body>
    </html>`);
    win.document.close();

    setTimeout(() => {
      win.focus();
      win.print();
      win.close();
    }, 500);
  };
  /* ----- UI ------------------------------------------------- */
  return (
    <Box>
      {/* ── toasts ── */}
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
          {isMobile ? "Risk assessment" : "Client risk assessment"}
        </Typography>

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Box ref={printRef}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ "& th": { fontWeight: 600 } }}>
                  <TableCell>Risk factors</TableCell>
                  <TableCell>Rating (1&nbsp;–&nbsp;5)</TableCell>
                  <TableCell>Description / notes</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                <RiskRow
                  label="Client / client risk"
                  valueName="comp_risk_client"
                  descName="comp_risk_client_description"
                  control={control}
                />
                <RiskRow
                  label="Service / transaction risk"
                  valueName="comp_risk_service"
                  descName="comp_risk_service_description"
                  control={control}
                />
                <RiskRow
                  label="Geographical risk"
                  valueName="comp_risk_geographical"
                  descName="comp_risk_geographical_description"
                  control={control}
                />
                <RiskRow
                  label="Delivery-channel business risk"
                  valueName="comp_risk_delivery"
                  descName="comp_risk_delivery_description"
                  control={control}
                />

                {/* total & extra notes */}
                <TableRow>
                  <TableCell sx={{ fontWeight: 500 }}>Risk scoring</TableCell>
                  <TableCell colSpan={2}>{totalScore}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 500 }}>
                    Due-diligence level
                  </TableCell>
                  <TableCell colSpan={2}>
                    <Controller
                      name="due_diligence_level"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          multiline
                          fullWidth
                          minRows={2}
                          size="small"
                        />
                      )}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 500 }}>Remarks</TableCell>
                  <TableCell colSpan={2}>
                    <Controller
                      name="comp_risk_remark"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          multiline
                          fullWidth
                          minRows={3}
                          size="small"
                        />
                      )}
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>
          <Box sx={{ textAlign: "right", mt: 4 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={ isSubmitting}
              sx={{ mr: 2 }}
            >
              Save
            </Button>
            {/* print button */}
            <Button variant="text" onClick={handlePrint}>
              Export&nbsp;to&nbsp;PDF
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
