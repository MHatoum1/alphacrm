import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "@/api/axiosInstance";

export interface SalesReportData {
  sale_name: string;
  count: number;
  verified_leads: number;
  activated_leads: number;
  USDDetail: string;
  checksUSDDetail: string;
  LBPDetail: string;
  USD: string;
  checksUSD: string;
  LBP: string;
  total_usd: string;
  total_chk_usd: string;
  total_lbp: string;
}

interface State {
  data: SalesReportData | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string;
}

const initialState: State = {
  data: null,
  status: "idle",
};

export const fetchSalesReport = createAsyncThunk<
  SalesReportData,
  { user_id: string;from: string; to: string },
  { rejectValue: string }
>(
  "salesReport/fetch",
  async ({ user_id,from, to }, { rejectWithValue }) => {
    try {
      const form = new FormData();
      form.append("action", "filter_sales_report");
      form.append("user_id", user_id);
      form.append("from", from);
      form.append("to", to);
      const resp = await axiosInstance.post("/salesreport", form);
      // unwrap our CommonAPI envelope
      return resp.data.data as SalesReportData;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? err.message);
    }
  }
);

const slice = createSlice({
  name: "salesReport",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSalesReport.pending, (s) => {
        s.status = "loading";
        s.error = undefined;
      })
      .addCase(fetchSalesReport.fulfilled, (s, action) => {
        s.status = "succeeded";
        s.data = action.payload;
      })
      .addCase(fetchSalesReport.rejected, (s, action) => {
        s.status = "failed";
        s.error = action.payload ?? action.error.message;
      });
  },
});

export default slice.reducer;
