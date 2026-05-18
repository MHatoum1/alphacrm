// src/store/adminLeadsSlice.ts
import axiosInstance from "@/api/axiosInstance";
import {
  GridState,
  mapGridStateToDataTablesParams,
} from "@/components/ui/DataTablesMapper";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export interface LeadFilters {
  date_from: string;
  date_to: string;
  country: string;
  source: string;
  status: string;
  partnership: string;
  campaign: string;
  phase: string;
  funded: string;
  sales: string; // ← NEW
}

// at top
export interface LeadFilterLists {
  countries: { value: string; text: string }[];
  partnerships: { value: string; text: string }[];
  sources: { value: string; text: string }[];
  statuses: { value: string; text: string }[];
  campaigns: { value: string; text: string }[];
}

interface LeadState {
  draw: number;
  recordsTotal: number;
  recordsFiltered: number;
  data: any[];
  status: "idle" | "loading" | "failed";
  error: string | null;
  salesUsers: { value: number; label: string }[];
  filterLists: LeadFilterLists;
  filtersStatus: "idle" | "loading" | "succeeded" | "failed";
}

const initialState: LeadState = {
  draw: 0,
  recordsTotal: 0,
  recordsFiltered: 0,
  data: [],
  status: "idle",
  error: null,
  salesUsers: [],
  filterLists: {
    countries: [],
    partnerships: [],
    sources: [],
    statuses: [],
    campaigns: [],
  },
  filtersStatus: "idle",
};

export const fetchLeadDropdowns = createAsyncThunk<
  LeadFilterLists,
  void,
  { rejectValue: string }
>("leads/dropdowns", async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.post(
      "/adminleads",
      {
        action: "dropdowns",
      },
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
    return data.data as LeadFilterLists;
  } catch (e: any) {
    return rejectWithValue(e.message || "Failed to load lead filters");
  }
});

export const fetchLeads = createAsyncThunk<
  any,
  {
    urlPart: string;
    action: string;
    campaign: string;
    filters: LeadFilters;
    gridState: GridState;
  },
  { rejectValue: string }
>("leads/fetchLeads", async (params, { rejectWithValue }) => {
  try {
    // ① get the URLSearchParams that already has draw/start/length/order/etc.
    const form = mapGridStateToDataTablesParams(params.gridState, {
      urlPart: params.urlPart,
      campaign: params.campaign,
      action: params.action,
    });

    // ② append each filter value into the same form
    Object.entries(params.filters).forEach(([key, value]) => {
      // you may choose to only append non-empty values:
      if (value !== "") {
        form.append(key, value);
      }
    });

    const response = await axiosInstance.post("/adminleads", form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return response.data;
  } catch (e: any) {
    return rejectWithValue(e.message || "Failed to fetch leads");
  }
});

export const fetchSalesUsers = createAsyncThunk<
  { value: number; label: string }[],
  void,
  { rejectValue: string }
>("leads/fetchSales", async (_, { rejectWithValue }) => {
  try {
    // Append user_id from localStorage (assuming user is stored as JSON)
    const storedAdmin = localStorage.getItem("user") || "";
    const admin = storedAdmin ? JSON.parse(storedAdmin) : null;
    if (!admin || !admin.uid) {
      throw new Error("User not found in localStorage");
    }

    const { data } = await axiosInstance.post(
      "/adminleads",
      {
        action: "get-sales-user",
        admin_id: admin.uid,
      },
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    return data.data; // [{value,label},…]
  } catch (e: any) {
    return rejectWithValue(e.message ?? "Failed to load sales list");
  }
});

const adminLeadsSlice = createSlice({
  name: "adminleads",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeads.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.status = "idle";
        let parsed;
        try {
          parsed =
            typeof action.payload.data === "string"
              ? JSON.parse(action.payload.data)
              : action.payload.data;
        } catch {
          parsed = {
            draw: 0,
            recordsTotal: 0,
            recordsFiltered: 0,
            data: [],
          };
        }
        state.draw = parsed.draw;
        state.recordsTotal = parsed.recordsTotal;
        state.recordsFiltered = parsed.recordsFiltered;
        state.data = parsed.data;
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload ?? action.error.message ?? "Failed to fetch leads";
      })
      .addCase(fetchSalesUsers.fulfilled, (state, action) => {
        state.salesUsers = action.payload;
      })
      .addCase(fetchLeadDropdowns.pending, (s) => {
        s.filtersStatus = "loading";
      })
      .addCase(fetchLeadDropdowns.fulfilled, (s, a) => {
        s.filtersStatus = "succeeded";
        s.filterLists = a.payload;
      })
      .addCase(fetchLeadDropdowns.rejected, (s) => {
        s.filtersStatus = "failed";
      });
  },
});

export default adminLeadsSlice.reducer;
