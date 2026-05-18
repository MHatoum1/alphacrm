// src/redux/slices/transferSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "@/api/axiosInstance";

/* ─── thunks ───────────────────────────────────────── */
export const fetchTransferAccounts = createAsyncThunk<
  TransferAccount[], // payload type
  string, // arg type
  { rejectValue: string }
>("transfer/fetchAccounts", async (user_id, { rejectWithValue }) => {
  try {
    const f = new FormData();
    f.append("action", "getAccounts");
    f.append("user_id", user_id);
    const { data } = await axios.post("/usertransfer", f);
    return data.data.rows as TransferAccount[];
  } catch (e: any) {
    return rejectWithValue(e.message || "Failed loading transfer accounts");
  }
});

export const submitTransfer = createAsyncThunk<
  unknown, // payload type (response isn't used)
  { user_id: string; from: string; to: string; amount: number }, // arg type
  { rejectValue: string }
>("transfer/submit", async (args, { rejectWithValue }) => {
  try {
    const f = new FormData();
    f.append("action", "moveFunds");
    f.append("user_id", args.user_id);
    f.append("from", args.from);
    f.append("to", args.to);
    f.append("amount", String(args.amount));
    const { data } = await axios.post("/usertransfer", f);
    return data;
  } catch (e: any) {
    return rejectWithValue(e.message || "Failed submitting transfer");
  }
});

/* ─── state ────────────────────────────────────────── */
export interface TransferAccount {
  uid: string;
  label: string;
  currency: string;
}

interface State {
  rows: TransferAccount[];
  status: "idle" | "loading" | "succeeded" | "failed";
  saving: "idle" | "loading" | "succeeded" | "failed";
  error?: string;
}

const initial: State = { rows: [], status: "idle", saving: "idle" };

export const transferSlice = createSlice({
  name: "transfer",
  initialState: initial,
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(fetchTransferAccounts.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(fetchTransferAccounts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.rows = action.payload;
      })
      .addCase(fetchTransferAccounts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error.message;
      })
      .addCase(submitTransfer.pending, (state) => {
        state.saving = "loading";
        state.error = undefined;
      })
      .addCase(submitTransfer.fulfilled, (state) => {
        state.saving = "succeeded";
      })
      .addCase(submitTransfer.rejected, (state, action) => {
        state.saving = "failed";
        state.error = action.payload ?? action.error.message;
      }),
});

export default transferSlice.reducer;
