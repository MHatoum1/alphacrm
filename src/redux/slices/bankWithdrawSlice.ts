// src/redux/slices/bankWithdrawSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "@/api/axiosInstance";

/* shared types ----------------------------------------------- */
export interface Wallet {
  uid: string;
  label: string;
  currency: string | null;
  isGlobal: boolean;
}
export interface BankPurse {
  uid: string;
  label: string;
  details: Record<string, string>;
}

/* ① meta ------------------------------------------------------ */
export const fetchBankWithdrawMeta = createAsyncThunk<
  { wallets: Wallet[]; purses: BankPurse[] }, // payload type
  string, // arg: user_id
  { rejectValue: string }
>("bankW/meta", async (uid, { rejectWithValue }) => {
  try {
    const f = new FormData();
    f.append("action", "bankWithdrawMeta");
    f.append("user_id", uid);
    const { data } = await axios.post("/userwithdraw", f);
    return data.data as { wallets: Wallet[]; purses: BankPurse[] };
  } catch (e: any) {
    return rejectWithValue(
      e.message || "Failed to load bank withdraw metadata"
    );
  }
});

/* ② submit ---------------------------------------------------- */
export const sendBankWithdraw = createAsyncThunk<
  any, // payload type: raw response
  {
    user_id: string;
    wallet: string;
    amount: number;
    currency: string;
    purse?: string;
    bank: Record<string, string>;
    pin: string;
    file: File;
  },
  { rejectValue: string }
>("bankW/send", async (p, { rejectWithValue }) => {
  try {
    const f = new FormData();
    f.append("action", "bankWithdrawInit");
    f.append("user_id", p.user_id);
    f.append("wallet", p.wallet);
    f.append("amount", String(p.amount));
    f.append("currency", p.currency);
    if (p.purse) {
      f.append("purses", p.purse);
    }
    Object.entries(p.bank).forEach(([k, v]) => {
      f.append(`bank[${k}]`, v);
    });
    f.append("secure_password", p.pin);
    f.append("uploaded_file", p.file);

    const { data } = await axios.post("/userwithdraw", f);
    return data; // { message: "withdraw_request_ok" }
  } catch (e: any) {
    return rejectWithValue(e.message || "Failed to send bank withdrawal");
  }
});

/* slice ------------------------------------------------------- */
interface St {
  wallets: Wallet[];
  purses: BankPurse[];
  status: "idle" | "loading" | "succeeded" | "failed";
  saving: "idle" | "loading" | "succeeded" | "failed";
  msg?: string;
  error?: string;
}
const init: St = { wallets: [], purses: [], status: "idle", saving: "idle" };

const s = createSlice({
  name: "bankWithdraw",
  initialState: init,
  reducers: {
    resetBankWithdraw: () => init,
  },
  extraReducers: (builder) => {
    /* —— fetchBankWithdrawMeta __________________________________ */
    builder
      .addCase(fetchBankWithdrawMeta.pending, (st) => {
        st.status = "loading";
        st.error = undefined;
      })
      .addCase(fetchBankWithdrawMeta.fulfilled, (st, action) => {
        st.status = "succeeded";
        st.wallets = action.payload.wallets;
        st.purses = action.payload.purses;
      })
      .addCase(fetchBankWithdrawMeta.rejected, (st, action) => {
        st.status = "failed";
        st.error =
          action.payload ?? action.error.message ?? "Failed loading data";
      });

    /* —— sendBankWithdraw _______________________________________ */
    builder
      .addCase(sendBankWithdraw.pending, (st) => {
        st.saving = "loading";
        st.error = undefined;
        st.msg = undefined;
      })
      .addCase(sendBankWithdraw.fulfilled, (st, action) => {
        st.saving = "succeeded";
        st.msg = action.payload.data?.message ?? action.payload.message;
      })
      .addCase(sendBankWithdraw.rejected, (st, action) => {
        st.saving = "failed";
        st.error =
          action.payload ?? action.error.message ?? "Withdrawal failed";
      });
  },
});

export const { resetBankWithdraw } = s.actions;
export default s.reducer;
