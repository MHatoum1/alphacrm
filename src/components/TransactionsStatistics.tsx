// src/components/TransactionsStatistics.tsx
import React, { useMemo } from "react";
import {
  Grid,
  Paper,
  Typography,
  useTheme,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
} from "@mui/material";
import CustomBarChart from "./charts/CustomBarChart";
import { useTranslation } from "react-i18next";

export interface TransactionsStatisticsProps {
  depositsSum: { currency: string; amount: number }[]; // note: amount is string
  withdrawalsSum: { currency: string; amount: number }[]; // note: amount is string
}

const TransactionsStatistics: React.FC<TransactionsStatisticsProps> = ({
  depositsSum,
  withdrawalsSum,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  // 1) collect all currencies present in either sum
  const allCurrencies = useMemo(
    () =>
      Array.from(
        new Set([
          ...depositsSum.map((d) => d.currency),
          ...withdrawalsSum.map((w) => w.currency),
        ])
      ),
    [depositsSum, withdrawalsSum]
  );

  // 2) build two-series for the bar chart
  const series = useMemo(
    () => [
      {
        name: t("deposits"),
        data: allCurrencies.map((cur) => {
          const d = depositsSum.find((x) => x.currency === cur);
          return d ? d.amount : 0;
        }),
      },
      {
        name: t("withdrawals"),
        data: allCurrencies.map((cur) => {
          const w = withdrawalsSum.find((x) => x.currency === cur);
          return w ? w.amount : 0;
        }),
      },
    ],
    [allCurrencies, depositsSum, withdrawalsSum, t]
  );

  // 3) helper to format like "1, 620,620.51"
  const formatWeird = (val: string | number) => {
    const num = typeof val === "string" ? parseFloat(val) : val;
    if (isNaN(num)) return "0.00";
    const [intPart, decPart] = num.toFixed(2).split(".");
    // insert commas every 3 digits from right
    const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const parts = withCommas.split(",");
    if (parts.length > 1) {
      // put a space after the very first comma
      return `${parts[0]}, ${parts.slice(1).join(",")}.${decPart}`;
    }
    return `${withCommas}.${decPart}`;
  };

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: "12px" }}>
      {/* Bar chart */}
      <CustomBarChart
        title={t("transaction_statistics")}
        series={series}
        labels={allCurrencies}
        colors={[theme.palette.success.main, theme.palette.error.main]}
        yaxis={{
          show: false,
        }}
      />

      {/* per‐currency breakdown table */}
      <Grid container spacing={2} sx={{ mt: 3 }}>
        <Grid item xs={12}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t("currency")}</TableCell>
                  <TableCell align="right">{t("deposits")}</TableCell>
                  <TableCell align="right">{t("withdrawals")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allCurrencies.map((cur) => {
                  const depAmt =
                    depositsSum.find((d) => d.currency === cur)?.amount ?? "0";
                  const witAmt =
                    withdrawalsSum.find((w) => w.currency === cur)?.amount ??
                    "0";
                  return (
                    <TableRow key={cur}>
                      <TableCell>
                        {" "}
                        <Typography variant="body2" sx={{ flexGrow: 1 }}>
                          {cur}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="bold">
                          {formatWeird(depAmt)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="bold">
                          {formatWeird(witAmt)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default TransactionsStatistics;
