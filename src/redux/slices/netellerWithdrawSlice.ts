// src/store/slices/netellerWithdrawSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "@/api/axiosInstance";

/* ── data types ─────────────────────────────────────────────── */
export interface Wallet {
  uid: string;
  label: string;
  currency: string | null;
  isGlobal: boolean;
}
export interface NetellerPurse {
  hash: string; // purse.hash  (legacy primary-key)
  label: string; // free text shown in the combo-box
}

/* ── async actions ──────────────────────────────────────────── */

/* 1 │ dropdown data (wallets + stored purses) */
export const fetchNetellerWithdrawMeta = createAsyncThunk<
  { wallets: Wallet[]; purses: NetellerPurse[] }, // payload type
  string, // arg: user_id
  { rejectValue: string }
>("netellerW/meta", async (user_id, { rejectWithValue }) => {
  try {
    const f = new FormData();
    f.append("action", "netellerWithdrawMeta");
    f.append("user_id", user_id);
    const { data } = await axios.post("/userwithdraw", f);
    return data.data as { wallets: Wallet[]; purses: NetellerPurse[] };
  } catch (e: any) {
    return rejectWithValue(e.message || "Failed loading data");
  }
});

/* 2 │ submit the request */
export const sendNetellerWithdraw = createAsyncThunk<
  { message: string }, // payload type
  {
    user_id: string;
    wallet: string; // uid
    amount: number;
    currency: string;
    purse: string; // purse.hash
    pin: string; // secure PIN
  },
  { rejectValue: string }
>("netellerW/send", async (p, { rejectWithValue }) => {
  try {
    const f = new FormData();
    f.append("action", "netellerWithdrawInit");
    f.append("user_id", p.user_id);
    f.append("wallet", p.wallet);
    f.append("amount", String(p.amount));
    f.append("currency", p.currency);
    f.append("neteller", p.purse);
    f.append("secure_password", p.pin);
    const { data } = await axios.post("/userwithdraw", f);
    // API returns { message: "…" }
    return data.data as { message: string };
  } catch (e: any) {
    return rejectWithValue(
      e.response?.data?.message || e.message || "Withdrawal failed"
    );
  }
});

/* ── slice ─────────────────────────────────────────────────── */
interface St {
  wallets: Wallet[];
  purses: NetellerPurse[];
  status: "idle" | "loading" | "succeeded" | "failed";
  saving: "idle" | "loading" | "succeeded" | "failed";
  msg?: string; // success banner
  error?: string;
}

const initial: St = {
  wallets: [],
  purses: [],
  status: "idle",
  saving: "idle",
};

const s = createSlice({
  name: "netellerWithdraw",
  initialState: initial,
  reducers: {
    resetNetellerWithdraw: () => initial,
  },
  extraReducers: (builder) => {
    /* fetchNetellerWithdrawMeta */
    builder
      .addCase(fetchNetellerWithdrawMeta.pending, (st) => {
        st.status = "loading";
        st.error = undefined;
      })
      .addCase(fetchNetellerWithdrawMeta.fulfilled, (st, action) => {
        st.status = "succeeded";
        st.wallets = action.payload.wallets;
        st.purses = action.payload.purses;
      })
      .addCase(fetchNetellerWithdrawMeta.rejected, (st, action) => {
        st.status = "failed";
        st.error =
          action.payload ?? action.error.message ?? "Failed loading data";
      });

    /* sendNetellerWithdraw */
    builder
      .addCase(sendNetellerWithdraw.pending, (st) => {
        st.saving = "loading";
        st.error = undefined;
        st.msg = undefined;
      })
      .addCase(sendNetellerWithdraw.fulfilled, (st, action) => {
        st.saving = "succeeded";
        st.msg = action.payload.message;
      })
      .addCase(sendNetellerWithdraw.rejected, (st, action) => {
        st.saving = "failed";

        st.error =
          action.payload ?? action.error.message ?? "Withdrawal failed";
      });
  },
});

export const { resetNetellerWithdraw } = s.actions;
export default s.reducer;
