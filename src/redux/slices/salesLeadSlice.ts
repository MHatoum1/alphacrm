// src/redux/slices/salesLeadSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/api/axiosInstance";
import {
  GridState,
  mapGridStateToDataTablesParams,
} from "@/components/ui/DataTablesMapper";

/* ─────── types ─────────────────────────────────────────────── */
export interface LeadFilters {
  date_from: string;
  date_to: string;
  country: string;
  source: string;
  status: string;
}
export interface LeadRow {
  id: number;
  assigned: string; // assigned-date
  name: string;
  email: string;
  status: string;
  source: string;
  country: string;
  phone: string;
  created: string;
}
export interface DropOption {
  value: string;
  text: string;
}

/* ─────── state ─────────────────────────────────────────────── */
interface State {
  rows: any[][];
  total: number;
  recordsFiltered: number; // optional, for compatibility
  status: "idle" | "loading" | "succeeded" | "failed";
  dropdowns: {
    countries: DropOption[];
    sources: DropOption[];
    statuses: DropOption[];
  };
  ddStatus: "idle" | "loading" | "succeeded" | "failed";
  error?: string;
}

const initial: State = {
  rows: [],
  total: 0,
  recordsFiltered: 0, // optional, for compatibility
  status: "idle",
  dropdowns: { countries: [], sources: [], statuses: [] },
  ddStatus: "idle",
};

/* ─────── dropdowns --------------------------------------------------- */
export const fetchLeadDropdowns = createAsyncThunk<
  State["dropdowns"], // payload type
  void, // no argument
  { rejectValue: string }
>("leads/dropdowns", async (_, { rejectWithValue }) => {
  try {
    const f = new FormData();
    f.append("action", "dropdowns");
    const { data } = await axios.post("/leadssales", f);
    return data.data as State["dropdowns"];
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

/* ─────── server-side grid ------------------------------------------- */
export const fetchLeads = createAsyncThunk<
  any, // envelope from CommonAPI
  { user_id: string; gridState: GridState; filters: LeadFilters },
  { rejectValue: string }
>(
  "leads/listGrid",
  async ({ user_id, gridState, filters }, { rejectWithValue }) => {
    try {
      // 1) Build the standard DataTables params
      const form = mapGridStateToDataTablesParams(gridState, {
        action: "list",
        user_id,
      });

      // 2) Append each non-empty filter
      Object.entries(filters).forEach(([k, v]) => {
        if (v) form.append(k, v);
      });

      // 3) Fire the request
      const response = await axios.post("/leadssales", form, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/* ─────── slice ------------------------------------------------------- */
const salesLeadSlice = createSlice({
  name: "leads",
  initialState: initial,
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(fetchLeadDropdowns.pending, (s) => {
        s.ddStatus = "loading";
        s.error = undefined;
      })
      .addCase(fetchLeadDropdowns.fulfilled, (s, action) => {
        s.ddStatus = "succeeded";
        s.dropdowns = action.payload;
      })
      .addCase(fetchLeadDropdowns.rejected, (s, action) => {
        s.ddStatus = "failed";
        s.error = action.payload ?? action.error.message;
      })

      /* fetchLeads */
      .addCase(fetchLeads.pending, (s) => {
        s.status = "loading";
        s.error = undefined;
      })
      .addCase(fetchLeads.fulfilled, (s, { payload }) => {
        s.status = "succeeded";
        // unwrap CommonAPI envelope
        const dataTables =
          typeof payload.data === "string"
            ? JSON.parse(payload.data)
            : payload.data;
        s.rows = dataTables.data;
        s.total = dataTables.recordsTotal;
        s.recordsFiltered = dataTables.recordsFiltered;
      })
      .addCase(fetchLeads.rejected, (s, { payload, error }) => {
        s.status = "failed";
        s.error = payload ?? error.message;
      }),
});

export default salesLeadSlice.reducer;
