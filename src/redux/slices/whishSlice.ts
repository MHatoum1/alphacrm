import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "@/api/axiosInstance";
/* types */
export interface WhishAccount {
  uid: string;
  label: string;
  currency: string | null;
  isGlobal: boolean;
}

/* fetch accounts (re-use /usertransfer like Skrill/Neteller) */
export const fetchWhishAccounts = createAsyncThunk<
  WhishAccount[],
  string,
  { rejectValue: string }
>("whish/accounts", async (user_id, { rejectWithValue }) => {
  try {
    const f = new FormData();
    f.append("action", "getAccounts");
    f.append("user_id", user_id);
    const { data } = await axiosInstance.post("/whishpayment", f);
    return (data.data?.rows as WhishAccount[]) ?? [];
  } catch (e: any) {
    return rejectWithValue(
      e.response?.data?.message || e.message || "Failed loading accounts"
    );
  }
});

/* send deposit (calls your PHP whish endpoint) */
export const sendWhishDeposit = createAsyncThunk<
  { redirect_url: string; reference?: string },
  {
    user_id: string;
    to: string;
    amount: number;
    currency: string;
  },
  { rejectValue: string }
>("whish/send", async (p, { rejectWithValue }) => {
  try {
    const f = new FormData();
    f.append("action", "whishInit");
    f.append("user_id", p.user_id);
    f.append("to", p.to);
    f.append("amount", String(p.amount));
    f.append("currency_target", p.currency);
    const { data } = await axiosInstance.post("/whishpayment", f);
    return data.data as { redirect_url: string; reference?: string };
  } catch (e: any) {
    return rejectWithValue(
      e.response?.data?.message || e.message || "Deposit failed"
    );
  }
});

export const fetchWhishWithdrawAccounts = createAsyncThunk<
  WhishAccount[],
  string,
  { rejectValue: string }
>("whish/accounts", async (user_id, { rejectWithValue }) => {
  try {
    const f = new FormData();
    f.append("action", "getWalletsAccounts");
    f.append("user_id", user_id);
    const { data } = await axiosInstance.post("/whishpayment", f);
    return (data.data?.rows as WhishAccount[]) ?? [];
  } catch (e: any) {
    return rejectWithValue(
      e.response?.data?.message || e.message || "Failed loading accounts"
    );
  }
});
export const sendWhishWithdraw = createAsyncThunk<
  { message: string ; reference?: string},
  {
    user_id: string;
    wallet: string;
    amount: number;
    currency: string;
    pin: string; // secure PIN
    phone: string;
  },
  { rejectValue: string }
>("whish/sendwithdraw", async (p, { rejectWithValue }) => {
  try {
    const f = new FormData();
    f.append("action", "whishInitWithdraw");
    f.append("user_id", p.user_id);
    f.append("wallet", p.wallet);
    f.append("amount", String(p.amount));
    f.append("currency", p.currency);
    f.append("secure_password", p.pin);
    f.append("phone", p.phone);
    const { data } = await axiosInstance.post("/whishpayment", f);
    return data.data as { message: string; reference?: string };
  } catch (e: any) {
    return rejectWithValue(
      e.response?.data?.message || e.message || "Withdraw failed"
    );
  }
});

/* slice */
interface St {
  accounts: WhishAccount[];
  status: "idle" | "loading" | "succeeded" | "failed";
  saving: "idle" | "loading" | "succeeded" | "failed";
  redirect: string | null;
  payload?: { amount: number; currency: string; reference?: string };
  error?: string;
  msg?: string;
}

const initial: St = {
  accounts: [],
  status: "idle",
  saving: "idle",
  redirect: null,
};

const whishSlice = createSlice({
  name: "whish",
  initialState: initial,
  reducers: {
    resetWhish: () => initial,
  },
  extraReducers: (b) => {
    // accounts
    b.addCase(fetchWhishAccounts.pending, (st) => {
      st.status = "loading";
      st.error = undefined;
    })
      .addCase(fetchWhishAccounts.fulfilled, (st, a) => {
        st.status = "succeeded";
        st.accounts = a.payload;
      })
      .addCase(fetchWhishAccounts.rejected, (st, a) => {
        st.status = "failed";
        st.error = a.payload ?? a.error.message ?? "Failed loading accounts";
      });

    // send
    b.addCase(sendWhishDeposit.pending, (st) => {
      st.saving = "loading";
      st.error = undefined;
      st.redirect = null;
      st.payload = undefined;
    })
      .addCase(sendWhishDeposit.fulfilled, (st, a) => {
        st.saving = "succeeded";
        st.redirect = a.payload.redirect_url;
        const { amount, currency } = a.meta.arg;
        st.payload = { amount, currency, reference: a.payload.reference };
      })
      .addCase(sendWhishDeposit.rejected, (st, a) => {
        st.saving = "failed";
        st.error = a.payload ?? a.error.message ?? "Deposit failed";
      });

    b.addCase(sendWhishWithdraw.pending, (st) => {
      st.saving = "loading";
      st.error = undefined;
      st.redirect = null;
      st.payload = undefined;

      st.saving = "loading";
      st.error = undefined;
      st.msg = undefined;
    })
      .addCase(sendWhishWithdraw.fulfilled, (st, a) => {
        st.saving = "succeeded";
        st.msg = a.payload.message;
         st.saving = "succeeded";
        
        const { amount, currency } = a.meta.arg;
        st.payload = { amount, currency, reference: a.payload.reference };
      })
      .addCase(sendWhishWithdraw.rejected, (st, a) => {
        st.saving = "failed";
        st.error = a.payload ?? a.error.message ?? "Withdraw failed";
      });
  },
});

export const { resetWhish } = whishSlice.actions;
export default whishSlice.reducer;
