// src/redux/slices/withdrawalSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/api/axiosInstance";

export interface WithdrawalState {
  status: "idle" | "loading" | "failed";
  error: string | null;
  data: any;
}
const initial: WithdrawalState = { status: "idle", error: null, data: {} };

/* ------------ GET ------------- */
export const fetchWithdrawalDetails = createAsyncThunk<
  any, // payload: whatever shape data.data has
  string, // arg: transaction_id
  { rejectValue: string }
>("withdrawal/fetch", async (transaction_id, { rejectWithValue }) => {
  try {
    const body = new URLSearchParams({
      action: "getWithdrawalDetails",
      transaction_id,
    });
    const { data } = await axiosInstance.post("/admintransactions", body);
    return data.data;
  } catch (e: any) {
    return rejectWithValue(e.message || "Failed to load withdrawal details");
  }
});

/* ------------ PROCESS ---------- */
export const processWithdrawal = createAsyncThunk<
  any, // payload: raw response
  {
    transaction_id: string;
    amount_to_withdraw: string;
    tp_comment: string;
    reason?: string;
    action:
      | "approve"
      | "decline"
      | "close"
      | "back2processing";
  },
  { rejectValue: string }
>("withdrawal/process", async (p, { rejectWithValue }) => {
  try {
     // Append user_id from localStorage (assuming user is stored as JSON)
    const storedAdmin = localStorage.getItem("user") || "";
    const admin = storedAdmin ? JSON.parse(storedAdmin) : null;
    if (!admin || !admin.uid) {
      throw new Error("User not found in localStorage");
    }

    const form = new URLSearchParams({
      action: "processWithdrawal",
      transaction_id: p.transaction_id,
      amount_to_withdraw: p.amount_to_withdraw,
      tp_comment: p.tp_comment,
      reason: p.reason ?? "",
      [p.action]: "1",
       admin_id: admin.userID,
    });
    const { data } = await axiosInstance.post("/admintransactions", form);
    return data;
  } catch (e: any) {
     return rejectWithValue(e.response?.data?.message || e.message || "Failed to fetch withdrawal details");
  }
});

const slice = createSlice({
  name: "withdrawal",
  initialState: initial,
  reducers: {},
  extraReducers: (builder) =>
    builder
      /* ─── fetchWithdrawalDetails ───────────────────────────── */
      .addCase(fetchWithdrawalDetails.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchWithdrawalDetails.fulfilled, (state, action) => {
        state.status = "idle";
        state.data = action.payload;
      })
      .addCase(fetchWithdrawalDetails.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload ??
          action.error.message ??
          "Failed to load withdrawal details";
      })

      /* ─── processWithdrawal ─────────────────────────────────── */
      .addCase(processWithdrawal.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(processWithdrawal.fulfilled, (state) => {
        state.status = "idle";
        // note: we do not modify `data` here; adjust if needed
      })
      .addCase(processWithdrawal.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload ??
          action.error.message ??
          "Failed to process withdrawal";
      }),
});

export default slice.reducer;
