// src/redux/slices/partnerReferralAccountsSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/api/axiosInstance";

export interface ReferralAccount {
  login: string;
  type: string;
  currency: string;
  created: string;
  volume?: number;
  balance?: number;
  leverage?: string;
  name?: string;
  email?: string;
  status?: string;
}

interface AccountsState {
  rows: ReferralAccount[];
  status: "idle" | "loading" | "succeeded" | "failed";
}

const initial: AccountsState = { rows: [], status: "idle" };

// Thunk to fetch *all* referred accounts (flattened across all referrals)
export const fetchReferralAccounts = createAsyncThunk<
  ReferralAccount[],
  { user_id: string }
>("partners/referralAccounts", async ({ user_id }) => {
  const f = new FormData();
  f.append("user_id", user_id);
  f.append("action", "getAccounts");
  const { data } = await axios.post("/userpartnerreferrals", f);
  // API returns { data: { rows: ReferralAccount[] } }
  return data.data.rows as ReferralAccount[];
});

const slice = createSlice({
  name: "partners/referralAccounts",
  initialState: initial,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReferralAccounts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchReferralAccounts.fulfilled, (state, { payload }) => {
        state.rows = payload;
        state.status = "succeeded";
      })
      .addCase(fetchReferralAccounts.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export default slice.reducer;
