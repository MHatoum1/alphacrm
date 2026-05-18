// src/redux/slices/accountDetail.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "@/api/axiosInstance";

/**
 * Fetch full account details (header, type, etc.).
 * On error, returns a rejected action with a string message.
 */
export const fetchAccountDetail = createAsyncThunk<
  any, // ← payload type (whatever data.data is shaped like)
  string, // ← argument type (uid)
  { rejectValue: string }
>("account/detail", async (uid: string, { rejectWithValue }) => {
  try {
    const form = new FormData();
    form.append("action", "getDetails");
    form.append("uid", uid);

    const { data } = await axios.post("/useraccountdetails", form);
    return data.data;
  } catch (e: any) {
    // Return a string (error message) as the rejected payload
    return rejectWithValue(e.message || "Failed to fetch account details");
  }
});

/**
 * Fetch transaction rows for a given account.
 * On error, returns a rejected action with a string message.
 */
export const fetchAccTransactions = createAsyncThunk<
  any[], // ← payload type (array of rows)
  string, // ← argument type (uid)
  { rejectValue: string }
>("account/transactions", async (uid: string, { rejectWithValue }) => {
  try {
    const f = new FormData();
    f.append("action", "getTransactions");
    f.append("uid", uid);

    const { data } = await axios.post("/useraccountdetails", f);
    return data.data.rows;
  } catch (e: any) {
    return rejectWithValue(e.message || "Failed to fetch transactions");
  }
});

/**
 * Fetch open trades for a given account.
 * On error, returns a rejected action with a string message.
 */
export const fetchAccOpenTrades = createAsyncThunk<
  any[], // ← payload type (array of rows)
  string, // ← argument type (uid)
  { rejectValue: string }
>("account/openTrades", async (uid: string, { rejectWithValue }) => {
  try {
    const f = new FormData();
    f.append("action", "getOpenTrades");
    f.append("uid", uid);

    const { data } = await axios.post("/useraccountdetails", f);
    return data.data.rows;
  } catch (e: any) {
    return rejectWithValue(e.message || "Failed to fetch open trades");
  }
});

/**
 * Fetch historical trades for a given account.
 * On error, returns a rejected action with a string message.
 */
export const fetchAccHistoryTrades = createAsyncThunk<
  any[], // ← payload type (array of rows)
  string, // ← argument type (uid)
  { rejectValue: string }
>("account/historyTrades", async (uid: string, { rejectWithValue }) => {
  try {
    const f = new FormData();
    f.append("action", "getHistoryTrades");
    f.append("uid", uid);

    const { data } = await axios.post("/useraccountdetails", f);
    return data.data.rows;
  } catch (e: any) {
    return rejectWithValue(e.message || "Failed to fetch historical trades");
  }
});

/**
 * Update account password (already had rejectWithValue).
 */
export const updateAccountPassword = createAsyncThunk<
  void,
  { uid: string; user_id: string; password: string },
  { rejectValue: string }
>(
  "account/updatePassword",
  async ({ uid, user_id, password }, { rejectWithValue }) => {
    try {
      const f = new FormData();
      f.append("action", "setPassword");
      f.append("uid", uid);
      f.append("user_id", user_id);
      f.append("new_password", password);

      await axios.post("/useraccountdetails", f);
    } catch (e: any) {
      return rejectWithValue(e.message || "Failed to change password");
    }
  }
);

/**
 * Fund a demo account (already had rejectWithValue).
 */
export const fundDemoAccount = createAsyncThunk<
  void,
  { uid: string; user_id: string; amount: number },
  { rejectValue: string }
>("account/fundDemo", async (p, { rejectWithValue }) => {
  try {
    const f = new FormData();
    f.append("action", "fundDemoAccount");
    f.append("uid", p.uid);
    f.append("user_id", p.user_id);
    f.append("amount", String(p.amount));
    await axios.post("/useraccountdetails", f);
  } catch (e: any) {
    return rejectWithValue(e.message || "Failed to fund demo account");
  }
});

/* ------------ state shape ------------------------------------- */
type Load = "idle" | "loading" | "succeeded" | "failed";

interface AccountDetailsState {
  data: any | null; // account header (login, type, …)
  transactions: any[]; // rows for the Transactions tab
  openTrades: any[];
  historyTrades: any[];
  status: Load; // for fetchAccountDetail
  statusTx: Load; // for fetchAccTransactions
  statusOT: Load; // for fetchAccOpenTrades
  statusHT: Load; // for fetchAccHistoryTrades
  statusPwd: Load; // for updateAccountPassword
  statusFD: Load; // for fundDemoAccount
}

const initialState: AccountDetailsState = {
  data: null,
  transactions: [],
  openTrades: [],
  historyTrades: [],
  status: "idle",
  statusTx: "idle",
  statusOT: "idle",
  statusHT: "idle",
  statusPwd: "idle",
  statusFD: "idle",
};

const accountDetailSlice = createSlice({
  name: "accountDetails",
  initialState,
  reducers: {},
  extraReducers: (builder) =>
    builder
      /* -------- fetchAccountDetail ---------- */
      .addCase(fetchAccountDetail.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAccountDetail.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchAccountDetail.rejected, (state) => {
        state.status = "failed";
      })

      /* -------- fetchAccTransactions ---------- */
      .addCase(fetchAccTransactions.pending, (state) => {
        state.statusTx = "loading";
      })
      .addCase(fetchAccTransactions.fulfilled, (state, action) => {
        state.statusTx = "succeeded";
        state.transactions = action.payload;
      })
      .addCase(fetchAccTransactions.rejected, (state) => {
        state.statusTx = "failed";
      })

      /* -------- fetchAccOpenTrades ---------- */
      .addCase(fetchAccOpenTrades.pending, (state) => {
        state.statusOT = "loading";
      })
      .addCase(fetchAccOpenTrades.fulfilled, (state, action) => {
        state.statusOT = "succeeded";
        state.openTrades = action.payload;
      })
      .addCase(fetchAccOpenTrades.rejected, (state) => {
        state.statusOT = "failed";
      })

      /* -------- fetchAccHistoryTrades ---------- */
      .addCase(fetchAccHistoryTrades.pending, (state) => {
        state.statusHT = "loading";
      })
      .addCase(fetchAccHistoryTrades.fulfilled, (state, action) => {
        state.statusHT = "succeeded";
        state.historyTrades = action.payload;
      })
      .addCase(fetchAccHistoryTrades.rejected, (state) => {
        state.statusHT = "failed";
      })

      /* -------- updateAccountPassword ---------- */
      .addCase(updateAccountPassword.pending, (state) => {
        state.statusPwd = "loading";
      })
      .addCase(updateAccountPassword.fulfilled, (state) => {
        state.statusPwd = "succeeded";
      })
      .addCase(updateAccountPassword.rejected, (state) => {
        state.statusPwd = "failed";
      })

      /* -------- fundDemoAccount ---------- */
      .addCase(fundDemoAccount.pending, (state) => {
        state.statusFD = "loading";
      })
      .addCase(fundDemoAccount.fulfilled, (state) => {
        state.statusFD = "succeeded";
      })
      .addCase(fundDemoAccount.rejected, (state) => {
        state.statusFD = "failed";
      }),
});

export default accountDetailSlice.reducer;
