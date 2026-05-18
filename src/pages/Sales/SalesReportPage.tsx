import {
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import dayjs, { Dayjs } from "dayjs";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchSalesReport } from "@/redux/slices/salesReportSlice";
import DownloadIcon from "@mui/icons-material/Download";

export default function SalesReportPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { data, status, error } = useAppSelector((s) => s.salesReport);

  // initialize to week start → now
  const [from, setFrom] = useState<Dayjs>(dayjs().startOf("week"));
  const [to, setTo] = useState<Dayjs>(dayjs());
  const tableRef = useRef<HTMLTableElement>(null);

  const uid = JSON.parse(localStorage.getItem("user") ?? "{}")?.userID as
    | string
    | undefined;


  // responsive breakpoint
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // fetch on mount & whenever from/to change
  useEffect(() => {
    dispatch(
      fetchSalesReport({
        user_id: uid!,
        from: from.format("YYYY-MM-D") + " 00:00:00",
        to: to.format("YYYY-MM-D") + " 23:59:59",
      })
    );
  }, [from, to, dispatch]);

  const handleExport = () => {
    if (!tableRef.current) return;
    const html = tableRef.current.outerHTML;
    // Excel MIME type
    const blob = new Blob(["\uFEFF", html], {
      type: "application/vnd.ms-excel",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sales_report.xls";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Paper sx={{ p: 3 }}>
       <Stack
        direction={isMobile ? "column" : "row"}
        justifyContent="space-between"
        alignItems={isMobile ? "stretch" : "center"}
        spacing={2}
        mb={2}
      >
        <Typography variant="h5">{t("sales_report")}</Typography>
        <Stack direction={isMobile ? "column" : "row"} spacing={1} alignItems="center">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label={t("from")}
              value={from}
              onChange={(d) => {
                if (d) {
                  // ensure it's a Dayjs, even if d is a Moment
                  setFrom(dayjs(d.toDate())); // moment → Date → Dayjs
                }
              }}
              slotProps={{ textField: { size: "small", fullWidth: isMobile } }}
            />
            <DatePicker
              label={t("to")}
              value={to}
              onChange={(d) => {
                if (d) {
                  setTo(dayjs(d.toDate()));
                }
              }}
              slotProps={{ textField: { size: "small", fullWidth: isMobile },}}
            />
          </LocalizationProvider>
          <IconButton
            onClick={handleExport}
            title={t("export_to_excel")}
            aria-label={t("export_to_excel")}
          >
            <DownloadIcon />
          </IconButton>
        </Stack>
      </Stack>

      {status === "loading" && <CircularProgress />}
      {status === "failed" && (
        <Typography color="error">{error || t("failed_to_load")}</Typography>
      )}

      {status === "succeeded" && data && (
        <Table
          ref={tableRef}
          sx={{ "#report-table td, #report-table th": { textAlign: "center" } }}
          id="report-table"
        >
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell className="color">{t("leads")}</TableCell>
              <TableCell className="color">{t("verified")}</TableCell>
              <TableCell className="color">{t("activated")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Row 1: counts */}
            <TableRow>
              <TableCell className="color">{data.sale_name}</TableCell>
              <TableCell>{data.count}</TableCell>
              <TableCell>{data.verified_leads}</TableCell>
              <TableCell>{data.activated_leads}</TableCell>
            </TableRow>

            {/* Deposits */}
            <TableRow>
              <TableCell />
              <TableCell className="color">{t("cash_usd")}</TableCell>
              <TableCell className="color">{t("check_usd")}</TableCell>
              <TableCell className="color">{t("cash_lbp")}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="color">{t("new_deposit")}</TableCell>
              <TableCell>{data.USDDetail}</TableCell>
              <TableCell>{data.checksUSDDetail}</TableCell>
              <TableCell>{data.LBPDetail}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="color">{t("re_deposit")}</TableCell>
              <TableCell>{data.USD}</TableCell>
              <TableCell>{data.checksUSD}</TableCell>
              <TableCell>{data.LBP}</TableCell>
            </TableRow>

            {/* Totals */}
            <TableRow>
              <TableCell className="color">{t("total")}</TableCell>
              <TableCell>{data.total_usd}</TableCell>
              <TableCell>{data.total_chk_usd}</TableCell>
              <TableCell>{data.total_lbp}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )}
    </Paper>
  );
}
