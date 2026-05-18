// src/redux/slices/skrillWithdrawSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "@/api/axiosInstance";

/* shared wallet type ----------------------------------------- */
export interface Wallet {
  uid: string;
  label: string;
  currency: string | null;
  isGlobal: boolean;
}
export interface SkrillPurse {
  hash: string;
  label: string;
}

/* meta -------------------------------------------------------- */
export const fetchSkrillWithdrawMeta = createAsyncThunk<
  { wallets: Wallet[]; purses: SkrillPurse[] }, // payload type
  string, // arg: user_id
  { rejectValue: string }
>("skrillW/meta", async (uid, { rejectWithValue }) => {
  try {
    const f = new FormData();
    f.append("action", "skrillWithdrawMeta");
    f.append("user_id", uid);
    const { data } = await axios.post("/userwithdraw", f);
    return data.data as { wallets: Wallet[]; purses: SkrillPurse[] };
  } catch (e: any) {
    return rejectWithValue(e.message || "Failed loading data");
  }
});

/* submit ------------------------------------------------------ */
export const sendSkrillWithdraw = createAsyncThunk<
  { message: string }, // we expect data.data.message
  {
    user_id: string;
    wallet: string;
    amount: number;
    currency: string;
    purse: string;
    pin: string;
  }, // arg type
  { rejectValue: string }
>("skrillW/send", async (p, { rejectWithValue }) => {
  try {
    const f = new FormData();
    f.append("action", "skrillWithdrawInit");
    f.append("user_id", p.user_id);
    f.append("wallet", p.wallet);
    f.append("amount", String(p.amount));
    f.append("currency", p.currency);
    f.append("skrill", p.purse);
    f.append("secure_password", p.pin);
    const { data } = await axios.post("/userwithdraw", f);
    // API returns { data: { message: "withdraw_request_ok" } }
    return data.data as { message: string };
  } catch (e: any) {
    return rejectWithValue(
      e.response?.data?.message || e.message || "Withdrawal failed"
    );
  }
});

/* slice ------------------------------------------------------- */
interface St {
  wallets: Wallet[];
  purses: SkrillPurse[];
  status: "idle" | "loading" | "succeeded" | "failed";
  saving: "idle" | "loading" | "succeeded" | "failed";
  msg?: string;
  error?: string;
}
const init: St = { wallets: [], purses: [], status: "idle", saving: "idle" };

const s = createSlice({
  name: "skrillWithdraw",
  initialState: init,
  reducers: { resetSkrillWithdraw: () => init },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSkrillWithdrawMeta.pending, (st) => {
        st.status = "loading";
        st.error = undefined;
      })
      .addCase(fetchSkrillWithdrawMeta.fulfilled, (st, action) => {
        st.status = "succeeded";
        st.wallets = action.payload.wallets;
        st.purses = action.payload.purses;
      })
      .addCase(fetchSkrillWithdrawMeta.rejected, (st, action) => {
        st.status = "failed";
        st.error =
          action.payload ?? action.error.message ?? "Failed loading data";
      })

      .addCase(sendSkrillWithdraw.pending, (st) => {
        st.saving = "loading";
        st.error = undefined;
        st.msg = undefined;
      })
      .addCase(sendSkrillWithdraw.fulfilled, (st, action) => {
        st.saving = "succeeded";
        st.msg = action.payload.message;
      })
      .addCase(sendSkrillWithdraw.rejected, (st, action) => {
        st.saving = "failed";
        st.error =
          action.payload ?? action.error.message ?? "Withdrawal failed";
      });
  },
});

export const { resetSkrillWithdraw } = s.actions;
export default s.reducer;
