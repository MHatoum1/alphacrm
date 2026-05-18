// src/store/slices/netellerSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "@/api/axiosInstance";

/* ─── types ──────────────────────────────────────────── */
export interface NetellerAccount {
  uid: string;
  label: string;
  currency: string | null;
  isGlobal: boolean;
}

/* ─── async actions ──────────────────────────────────── */
export const fetchNetellerAccounts = createAsyncThunk<
  NetellerAccount[], // payload: array of accounts
  string, // arg: user_id
  { rejectValue: string }
>("neteller/accounts", async (user_id, { rejectWithValue }) => {
  try {
    const f = new FormData();
    f.append("action", "getAccounts");
    f.append("user_id", user_id);
    const { data } = await axios.post("/usertransfer", f);
    return data.data.rows as NetellerAccount[];
  } catch (e: any) {
    return rejectWithValue(e.message || "Failed loading accounts");
  }
});

export const sendNetellerDeposit = createAsyncThunk<
  { redirect_url: string; reference?: string }, // payload: redirect + reference
  {
    user_id: string;
    to: string;
    amount: number;
    currency: string;
    email: string;
  }, // arg
  { rejectValue: string }
>("neteller/send", async (p, { rejectWithValue }) => {
  try {
    const f = new FormData();
    f.append("action", "netellerInit");
    f.append("user_id", p.user_id);
    f.append("to", p.to);
    f.append("amount", String(p.amount));
    f.append("currency_target", p.currency);
    f.append("email", p.email);
    const { data } = await axios.post("/userdeposits", f);
    return data.data as { redirect_url: string; reference?: string };
  } catch (e: any) {
    return rejectWithValue(e.message || "Deposit failed");
  }
});

/* ─── slice ─────────────────────────────────────────── */
interface St {
  rows: NetellerAccount[];
  status: "idle" | "loading" | "succeeded" | "failed";
  saving: "idle" | "loading" | "succeeded" | "failed";
  redirect: string | null;
  payload?: {
    amount: number;
    currency: string;
    reference?: string;
  };
  error?: string;
}

const initial: St = {
  rows: [],
  status: "idle",
  saving: "idle",
  redirect: null,
};

const netellerSlice = createSlice({
  name: "neteller",
  initialState: initial,
  reducers: {
    resetNeteller: () => initial,
  },
  extraReducers: (builder) => {
    /* get accounts */
    builder
      .addCase(fetchNetellerAccounts.pending, (st) => {
        st.status = "loading";
        st.error = undefined;
      })
      .addCase(fetchNetellerAccounts.fulfilled, (st, action) => {
        st.status = "succeeded";
        st.rows = action.payload;
      })
      .addCase(fetchNetellerAccounts.rejected, (st, action) => {
        st.status = "failed";
        st.error =
          action.payload ?? action.error.message ?? "Failed loading accounts";
      });

    /* send deposit */
    builder
      .addCase(sendNetellerDeposit.pending, (st) => {
        st.saving = "loading";
        st.error = undefined;
      })
      .addCase(sendNetellerDeposit.fulfilled, (st, action) => {
        st.saving = "succeeded";
        st.redirect = action.payload.redirect_url;

        // Combine the original amount/currency with the "reference" returned
        const { amount, currency } = action.meta.arg;
        st.payload = {
          amount,
          currency,
          reference: action.payload.reference,
        };
      })
      .addCase(sendNetellerDeposit.rejected, (st, action) => {
        st.saving = "failed";
        st.error = action.payload ?? action.error.message ?? "Deposit failed";
      });
  },
});

export const { resetNeteller } = netellerSlice.actions;
export default netellerSlice.reducer;
