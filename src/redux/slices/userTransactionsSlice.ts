// src/redux/slices/userTransactionsSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/api/axiosInstance";

export interface UserTx {
  id: string;
  method: string;
  type: "deposit" | "withdraw";
  amount: number;
  currency: string;
  status: string;
  status_finished: string;
  date_created: string;
}

interface UserTransactionsState {
  data: UserTx[];
  status: "idle" | "loading" | "failed";
  error?: string;
}

const initialState: UserTransactionsState = {
  data: [],
  status: "idle",
};

export const fetchUserTransactions = createAsyncThunk<
  UserTx[],             // returned payload
{ limit: number; user_id: string }, // arg type
  { rejectValue: string }
>(
  "userTransactions/fetch",
  async (p, { rejectWithValue }) => {
    try {
    const body = new URLSearchParams({
      action: "getUserTransactions",
      limit: String(p.limit),
      user_id: p.user_id,
    });

      const resp = await axios.post("/userTransactions", body);

      return resp.data.data;
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);

const slice = createSlice({
  name: "userTransactions",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserTransactions.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(fetchUserTransactions.fulfilled, (state, action) => {
        state.status = "idle";
        state.data = action.payload;
      })
      .addCase(fetchUserTransactions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default slice.reducer;
