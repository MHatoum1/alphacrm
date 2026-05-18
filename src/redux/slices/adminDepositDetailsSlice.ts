// src/redux/slices/adminDepositDetailsSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/api/axiosInstance";

export interface DepositState {
  status: "idle" | "loading" | "failed";
  error: string | null;
  data: any;
}

const initial: DepositState = {
  status: "idle",
  error: null,
  data: {},
};

/* ---------- GET ---------- */
export const fetchDepositDetails = createAsyncThunk<
  any, // ← payload: whatever shape data.data has
  string, // ← argument: transaction_id
  { rejectValue: string }
>("deposit/fetch", async (transaction_id: string, { rejectWithValue }) => {
  try {
    const body = new URLSearchParams({
      action: "getDepositDetails",
      transaction_id,
    });

    const { data } = await axiosInstance.post("/admintransactions", body);
    return data.data; // unwrap envelope
  } catch (e: any) {
    return rejectWithValue(e.message || "Failed to fetch deposit details");
  }
});

/* ---------- PROCESS ---------- */
export const processDeposit = createAsyncThunk<
  any, // ← payload: whatever the API returns (status/msg)
  {
    transaction_id: string;
    amount_deposit: string;
    amount: string;
    tp_comment: string;
    reason?: string;
    action: "approve" | "decline" | "close" | "back2processing";
  },
  { rejectValue: string }
>(
  "deposit/process",
  async (
    { transaction_id, amount_deposit, amount, tp_comment, reason = "", action },
    { rejectWithValue }
  ) => {
    try {
       // Append user_id from localStorage (assuming user is stored as JSON)
    const storedAdmin = localStorage.getItem("user") || "";
    const admin = storedAdmin ? JSON.parse(storedAdmin) : null;
    if (!admin || !admin.uid) {
      throw new Error("User not found in localStorage");
    }


      const form = new URLSearchParams({
        action: "processDeposit",
        transaction_id,
        amount_deposit,
        amount,
        tp_comment,
        reason,
        [action]: "1",
         admin_id: admin.userID,
      });

      const { data } = await axiosInstance.post("/admintransactions", form);
      return data;
    } catch (e: any) {
      return rejectWithValue(e.response?.data?.message || e.message || "Failed to fetch deposit details");
    }
  }
);

const slice = createSlice({
  name: "adminDepositDetails",
  initialState: initial,
  reducers: {},
  extraReducers: (builder) =>
    builder
      // ─── fetchDepositDetails ───────────────────────────────
      .addCase(fetchDepositDetails.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchDepositDetails.fulfilled, (state, action) => {
        state.status = "idle";
        state.data = action.payload;
      })
      .addCase(fetchDepositDetails.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error.message ?? "Load failed";
      })

      // ─── processDeposit ────────────────────────────────────
      .addCase(processDeposit.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(processDeposit.fulfilled, (state) => {
        state.status = "idle";
      })
      .addCase(processDeposit.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload ?? action.error.message ?? "Process failed";
      }),
});

export default slice.reducer;
