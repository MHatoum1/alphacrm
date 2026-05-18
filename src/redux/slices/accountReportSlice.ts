import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/api/axiosInstance";

export interface AccountReportRow {
  login: string;
  email: string;
  name: string;
  country: string;
  group: string;
  currency: string;
  balance: number;
  campaign: string;
  partnerHtml: string | null;
  sales: string;
}

export interface AccountReportFilters {
  euNoneu: string;
  currency: string;
  country: string;
  dateFrom: string;
  dateTo: string;
  min: string;
  max: string;
}

interface AccountReportState {
  rows: AccountReportRow[];
  status: "idle" | "loading" | "succeeded" | "failed";
}

const initialState: AccountReportState = {
  rows: [],
  status: "idle",
};

export const fetchAccountReport = createAsyncThunk<
  { rows: AccountReportRow[] },
  AccountReportFilters
>("accountReport/fetch", async (filters) => {
  const form = new FormData();
  form.append("action", "report-accounts");
  Object.entries(filters).forEach(([k, v]) => form.append(k, v));
  const { data } = await axios.post("/accountsreport", form);
  return data.data as { rows: AccountReportRow[] };
});

const slice = createSlice({
  name: "accountReport",
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchAccountReport.pending, (s) => {
      s.status = "loading";
    })
      .addCase(fetchAccountReport.fulfilled, (s, a) => {
        s.status = "succeeded";
        s.rows = a.payload.rows;
      })
      .addCase(fetchAccountReport.rejected, (s) => {
        s.status = "failed";
      });
  },
});

export default slice.reducer;
