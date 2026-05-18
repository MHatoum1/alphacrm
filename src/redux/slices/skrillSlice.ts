// src/redux/slices/skrillSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "@/api/axiosInstance";

export interface SkrillAcc {
  uid: string;
  label: string;
  currency: string | null;
  isGlobal: boolean;
}

export const fetchSkrillAccounts = createAsyncThunk<
  SkrillAcc[], // payload: array of accounts
  string, // arg: user_id
  { rejectValue: string }
>("skrill/accounts", async (user_id, { rejectWithValue }) => {
  try {
    const f = new FormData();
    f.append("action", "getAccounts");
    f.append("user_id", user_id);
    const { data } = await axios.post("/usertransfer", f);
    return data.data.rows as SkrillAcc[];
  } catch (e: any) {
    return rejectWithValue(e.message || "Failed loading accounts");
  }
});

export const sendSkrillDeposit = createAsyncThunk<
  { redirect_url: string; reference?: string }, // payload: redirect + optional reference
  {
    user_id: string;
    to: string;
    amount: number;
    currency: string;
    email: string;
  },
  { rejectValue: string }
>("skrill/send", async (p, { rejectWithValue }) => {
  try {
    const f = new FormData();
    f.append("action", "skrillInit");
    f.append("user_id", p.user_id);
    f.append("to", p.to);
    f.append("amount", String(p.amount));
    f.append("currency_target", p.currency);
    f.append("pay_from_email", p.email);
    const { data } = await axios.post("/userdeposits", f);
    // API returns { redirect_url, reference? }
    return data.data as { redirect_url: string; reference?: string };
  } catch (e: any) {
    return rejectWithValue(e.message || "Deposit failed");
  }
});

interface St {
  rows: SkrillAcc[];
  status: "idle" | "loading" | "succeeded" | "failed";
  saving: "idle" | "loading" | "succeeded" | "failed";
  redirect: string | null;
  payload?: { reference?: string };
  error?: string;
}

const initial: St = {
  rows: [],
  status: "idle",
  saving: "idle",
  redirect: null,
};

const slice = createSlice({
  name: "skrill",
  initialState: initial,
  reducers: {
    resetSkrill: () => initial,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSkrillAccounts.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(fetchSkrillAccounts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.rows = action.payload;
      })
      .addCase(fetchSkrillAccounts.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload ?? action.error.message ?? "Failed loading accounts";
      })

      .addCase(sendSkrillDeposit.pending, (state) => {
        state.saving = "loading";
        state.error = undefined;
        state.payload = undefined;
      })
      .addCase(sendSkrillDeposit.fulfilled, (state, action) => {
        state.saving = "succeeded";
        state.redirect = action.payload.redirect_url;
        state.payload = { reference: action.payload.reference };
      })
      .addCase(sendSkrillDeposit.rejected, (state, action) => {
        state.saving = "failed";
        state.error =
          action.payload ?? action.error.message ?? "Deposit failed";
      });
  },
});

export const { resetSkrill } = slice.actions;
export default slice.reducer;
