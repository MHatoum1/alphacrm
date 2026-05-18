// src/redux/slices/userAccountsSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "@/api/axiosInstance";

export interface AccountRow {
  login: string;
  uid: number;
  type: string;
  currency: string;
  class: string;
  server: string;
  balance: number;
  equity: number;
  credit: number;
  leverage: string;
}

interface AccountsState {
  live: AccountRow[];
  demo: AccountRow[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: AccountsState = {
  live: [],
  demo: [],
  status: "idle",
  error: null,
};

export const fetchAccounts = createAsyncThunk<
  { live: AccountRow[]; demo: AccountRow[] },
  { user_id: string },
  { rejectValue: string }
>("accounts/fetch", async ({ user_id }, { rejectWithValue }) => {
  try {
    const form = new FormData();
    form.append("action", "getAccounts");
    form.append("user_id", String(user_id));

    const { data } = await axios.post("/useraccounts", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data as { live: AccountRow[]; demo: AccountRow[] };
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to fetch accounts");
  }
});

const userAccountsSlice = createSlice({
  name: "accounts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccounts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchAccounts.fulfilled,
        (
          state,
          action: PayloadAction<{ live: AccountRow[]; demo: AccountRow[] }>
        ) => {
          state.status = "succeeded";
          state.live = action.payload.live;
          state.demo = action.payload.demo;
        }
      )
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? action.error.message ?? "Unknown error";
      });
  },
});

export default userAccountsSlice.reducer;
