// src/redux/slices/adminTransferSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/api/axiosInstance";

export interface TransferState {
  status: "idle" | "loading" | "failed";
  error: string | null;
  data: any;
}
const initial: TransferState = { status: "idle", error: null, data: {} };

/* GET */
export const fetchTransferDetails = createAsyncThunk<
  any, // payload: whatever shape data.data has
  string, // arg: transaction_id
  { rejectValue: string }
>("transfer/fetch", async (id: string, { rejectWithValue }) => {
  try {
    const body = new URLSearchParams({
      action: "getTransferDetails",
      transaction_id: id,
    });
    const { data } = await axiosInstance.post("/admintransactions", body);
    return data.data;
  } catch (e: any) {
    return rejectWithValue(e.message || "Failed to load transfer details");
  }
});

/* COMPLETE */
export const completeTransfer = createAsyncThunk<
  any, // payload: raw response
  string, // arg: transaction_id
  { rejectValue: string }
>("transfer/complete", async (id: string, { rejectWithValue }) => {
  try {
    const form = new URLSearchParams({
      action: "completeTransfer",
      transaction_id: id,
      complete: "1",
    });
    const { data } = await axiosInstance.post("/admintransactions", form);
    return data;
  } catch (e: any) {
    return rejectWithValue(e.message || "Failed to complete transfer");
  }
});

const slice = createSlice({
  name: "adminTransferDetails",
  initialState: initial,
  reducers: {},
  extraReducers: (builder) =>
    builder
      /* ─── fetchTransferDetails ─────────────────────────────── */
      .addCase(fetchTransferDetails.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchTransferDetails.fulfilled, (state, action) => {
        state.status = "idle";
        state.data = action.payload;
      })
      .addCase(fetchTransferDetails.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload ??
          action.error.message ??
          "Failed to load transfer details";
      })

      /* ─── completeTransfer ─────────────────────────────────── */
      .addCase(completeTransfer.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(completeTransfer.fulfilled, (state) => {
        state.status = "idle";
        // no change to `data` here; adjust if you need to store the response
      })
      .addCase(completeTransfer.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload ??
          action.error.message ??
          "Failed to complete transfer";
      }),
});

export default slice.reducer;
