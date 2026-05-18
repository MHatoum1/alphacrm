// src/redux/slices/customReportSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/api/axiosInstance";

export type HeaderOptions = Record<string, string[]>;

export interface CustomReportState {
  headerOptions: HeaderOptions;
  data: any[];
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: CustomReportState = {
  headerOptions: {},
  data: [],
  total: 0,
  loading: false,
  error: null,
};

export const fetchHeaderOptions = createAsyncThunk<
  HeaderOptions,
  string[],
  { rejectValue: string }
>("customReport/fetchHeaderOptions", async (columns, { rejectWithValue }) => {
  try {
    const storedAdmin = localStorage.getItem("user") || "";
    const admin = storedAdmin ? JSON.parse(storedAdmin) : null;
    if (!admin || !admin.uid) throw new Error("User not found in localStorage");

    const form = new URLSearchParams();
    form.append("action", "get-header-report");
    form.append("admin_id", admin.uid);
    columns.forEach((c) => form.append("columns[]", c));

    const resp = await axiosInstance.post("/customreport", form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    return resp.data as HeaderOptions;
  } catch (e: any) {
    return rejectWithValue(e.message);
  }
});

export const fetchCustomReport = createAsyncThunk<
  { rows: any[]; total: number },
  {
    columns: string[];
    filters: Record<string, string | string[]>;
    page: number;
    pageSize: number;
    sort?: { column: number; dir: string };
  },
  { rejectValue: string }
>(
  "customReport/fetchData",
  async ({ columns, filters, page, pageSize, sort }, { rejectWithValue }) => {
    try {
      const stored = localStorage.getItem("user") || "";
      const admin = stored ? JSON.parse(stored) : null;
      if (!admin?.uid) throw new Error("User not found");

      const form = new URLSearchParams();
      form.append("action", "custom-report");
      form.append("admin_id", admin.uid);
      columns.forEach((c) => form.append("columns[]", c));

      // append filters (strings or arrays)
      Object.entries(filters).forEach(([k, v]) => {
        if (Array.isArray(v)) {
          v.forEach((val) => form.append(`${k}[]`, val));
        } else if (v) {
          form.append(k, v);
        }
      });

      form.append("start", String(page * pageSize));
      form.append("length", String(pageSize));
      if (sort) {
        form.append("order[0][column]", String(sort.column));
        form.append("order[0][dir]", sort.dir);
      }

      const resp = await axiosInstance.post("/customreport", form, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const payload =
        typeof resp.data.data === "string"
          ? JSON.parse(resp.data.data)
          : resp.data.data || resp.data;

      return { rows: payload.data as any[][], total: payload.recordsFiltered };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const customReportSlice = createSlice({
  name: "customReport",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHeaderOptions.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchHeaderOptions.fulfilled, (s, a) => {
        s.loading = false;
        s.headerOptions = a.payload || {};
      })
      .addCase(fetchHeaderOptions.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload ?? a.error.message!;
      })
      .addCase(fetchCustomReport.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchCustomReport.fulfilled, (s, a) => {
        s.data = a.payload.rows;
        s.total = a.payload.total;
        s.loading = false;
      })
      .addCase(fetchCustomReport.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload ?? a.error.message!;
      });
  },
});

export default customReportSlice.reducer;
