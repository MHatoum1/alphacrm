// src/redux/slices/walletSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/api/axiosInstance";

/* ───────────────────────────────────────── thunks ─────────────── */

export const fetchWallets = createAsyncThunk<
  WalletRow[],
  string,
  { rejectValue: string }
>("wallets/list", async (user_id, { rejectWithValue }) => {
  try {
    const f = new FormData();
    f.append("user_id", user_id);
    f.append("action", "getWallets");
    const { data } = await axios.post("/userwallets", f);
    return data.data.wallets as WalletRow[];
  } catch (e: any) {
    return rejectWithValue(e.message || "Failed to fetch wallets");
  }
});

export const fetchLastTx = createAsyncThunk<
  TxRow[],
  string,
  { rejectValue: string }
>("wallets/lastTx", async (user_id, { rejectWithValue }) => {
  try {
    const f = new FormData();
    f.append("user_id", user_id);
    f.append("action", "getLastTransactions");
    const { data } = await axios.post("/userwallets", f);
    return data.data.rows as TxRow[];
  } catch (e: any) {
    return rejectWithValue(e.message || "Failed to fetch last transactions");
  }
});

/* ───────────────────────────────────────── types ──────────────── */
export interface WalletRow {
  uid: string;
  login: string;
  server: string;
  currency: string;
  balance: number;
  deposited: number;
  withdrawn: number;
}
export interface TxRow {
  id: number;
  method: string;
  amount: number;
  currency: string;
  type: string;
  status: string;
  statusFin: string;
  date: string;
}

type Load = "idle" | "loading" | "succeeded" | "failed";
interface WalletState {
  wallets: WalletRow[];
  statusW: Load;
  errorW: string | null;
  lastTx: TxRow[];
  statusT: Load;
  errorT: string | null;
}

const initial: WalletState = {
  wallets: [],
  statusW: "idle",
  errorW: null,
  lastTx: [],
  statusT: "idle",
  errorT: null,
};

/* ───────────────────────────────────────── slice ──────────────── */
const walletSlice = createSlice({
  name: "wallets",
  initialState: initial,
  reducers: {},
  extraReducers: (builder) =>
    builder
      .addCase(fetchWallets.pending, (state) => {
        state.statusW = "loading";
        state.errorW = null;
      })
      .addCase(fetchWallets.fulfilled, (state, action) => {
        state.statusW = "succeeded";
        state.wallets = action.payload;
      })
      .addCase(fetchWallets.rejected, (state, action) => {
        state.statusW = "failed";
        state.errorW = action.payload ?? action.error.message ?? null;
      })

      .addCase(fetchLastTx.pending, (state) => {
        state.statusT = "loading";
        state.errorT = null;
      })
      .addCase(fetchLastTx.fulfilled, (state, action) => {
        state.statusT = "succeeded";
        state.lastTx = action.payload;
      })
      .addCase(fetchLastTx.rejected, (state, action) => {
        state.statusT = "failed";
        state.errorT = action.payload ?? action.error.message ?? null;
      }),
});
export default walletSlice.reducer;
