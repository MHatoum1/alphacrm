// src/redux/slices/demosSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/api/axiosInstance";
import {
  GridState,
  mapGridStateToDataTablesParams,
} from "@/components/ui/DataTablesMapper";

/* ───────────────── types ──────────────────────────── */
export interface DemoRow {
  id: number;
  date: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  status: string;
  created: string;
  type: "Demo";
}

export interface DemoFilters {
  date_from?: string;
  date_to?: string;
  country?: string;
  status?: string;
}

/* ───────────────── state ──────────────────────────── */
interface State {
  rows: any[][];
  total: number;
  recordsFiltered: number;
  status: "idle" | "loading" | "succeeded" | "failed";
  error?: string;
}

const initial: State = {
  rows: [],
  total: 0,
  recordsFiltered: 0,
  status: "idle",
};

export const fetchDemos = createAsyncThunk<
  any, // CommonAPI envelope
  { user_id: string; gridState: GridState; filters?: DemoFilters },
  { rejectValue: string }
>(
  "demos/listGrid",
  async ({ user_id, gridState, filters }, { rejectWithValue }) => {
    try {
      // 1) Build DataTables params
      const form = mapGridStateToDataTablesParams(gridState, {
        action: "list",
        user_id,
      });

      // 2) Append any filters
      if (filters) {
        Object.entries(filters).forEach(([k, v]) => {
          if (v) form.append(k, v);
        });
      }

      // 3) Fire request
      const response = await axios.post("/salesdemos", form, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      return response.data;
    } catch (e: any) {
      return rejectWithValue(e.message || "Failed to fetch demos");
    }
  }
);
/* ───────────────── slice ─────────────────────────── */
const slice = createSlice({
  name: "demos",
  initialState: initial,
  reducers: {},
  extraReducers: (b) =>
    b
      .addCase(fetchDemos.pending, (s) => {
        s.status = "loading";
        s.error = undefined;
      })
      .addCase(fetchDemos.fulfilled, (s, { payload }) => {
        s.status = "succeeded";
        // unwrap CommonAPI envelope
        const dt =
          typeof payload.data === "string"
            ? JSON.parse(payload.data)
            : payload.data;
        s.rows = dt.data;
        s.total = dt.recordsTotal;
        s.recordsFiltered = dt.recordsFiltered;
      })
      .addCase(fetchDemos.rejected, (s, { payload, error }) => {
        s.status = "failed";
        s.error = payload ?? error.message;
      }),
});

export default slice.reducer;
