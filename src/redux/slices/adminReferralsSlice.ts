// src/redux/slices/adminReferralsSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/api/axiosInstance";
import {
  GridState,
  mapGridStateToDataTablesParams,
} from "@/components/ui/DataTablesMapper";

/* ───────── types ───────────────────────────────────────────── */
type LoadStatus = "idle" | "loading" | "failed";

export interface ReferralsState {
  draw: number;
  recordsTotal: number;
  recordsFiltered: number;
  data: any[]; // backend still returns the raw DT rows
  status: LoadStatus;
  error: string | null;
}

/* ───────── initial state ──────────────────────────────────── */
const initialState: ReferralsState = {
  draw: 0,
  recordsTotal: 0,
  recordsFiltered: 0,
  data: [],
  status: "idle",
  error: null,
};

/* ───────── thunk – DataTables-style fetch ─────────────────── */
export const fetchReferralStats = createAsyncThunk<
  any, // payload type: whatever the raw response.data is
  GridState, // argument: gridState
  { rejectValue: string }
>("referrals/fetch", async (gridState, { rejectWithValue }) => {
  try {
    const body = mapGridStateToDataTablesParams(gridState, {
      action: "getReferToFriendStat",
    });

    const { data } = await axiosInstance.post("/adminmarketing", body, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    return data; // backend already returns DT-shaped payload
  } catch (e: any) {
    return rejectWithValue(e.message || "Failed to fetch referral stats");
  }
});

/* ───────── slice ───────────────────────────────────────────── */
const ReferralsSlice = createSlice({
  name: "referrals",
  initialState,
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(fetchReferralStats.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchReferralStats.fulfilled, (state, action) => {
        state.status = "idle";

        // ❶ back-end payload might be JSON-encoded twice – unwrap defensively
        const p =
          typeof action.payload?.data === "string"
            ? JSON.parse(action.payload.data)
            : action.payload ?? {};
        const sData = p.data ?? {};

        // ❷ copy DT fields into slice
        state.draw = sData.draw ?? 0;
        state.recordsTotal = sData.recordsTotal ?? 0;
        state.recordsFiltered = sData.recordsFiltered ?? 0;
        state.data = Array.isArray(sData.data) ? sData.data : [];
      })
      .addCase(fetchReferralStats.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload ??
          action.error.message ??
          "Failed to fetch referral stats";
      }),
});

export default ReferralsSlice.reducer;
