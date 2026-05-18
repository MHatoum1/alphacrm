// src/redux/slices/bankWireSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/api/axiosInstance";

/* ══════════════════════════════════════════════════════════════ */
/* 1 ▸ Types that page components can import                      */
/* ══════════════════════════════════════════════════════════════ */
export interface BankWireAccount {
  uid: string;
  label: string;
  currency: string | null; // ⇐ parsed by the API
  isGlobal: boolean; // wallet / trading-account flag
}

export interface BankWireBank {
  code: string; //  "EUR ALPHA BANK CYPRUS LIMITED"
  label: string; //  "[EUR] ALPHA BANK CYPRUS LIMITED"
  details: Record<string, string>; //  full beneficiary-bank payload
}

export interface BankWirePurse {
  uid: string; // purse row UID
  label: string; // free label shown to the user
  details: Record<string, string>; // decoded JSON (Bank Name, IBAN…)
}

/* ══════════════════════════════════════════════════════════════ */
/* 2 ▸ Async actions                                              */
/* ══════════════════════════════════════════════════════════════ */

/* —─ 2.1  Fetch the dropdown data (accounts + banks + purses) ── */
export const fetchBankWireMeta = createAsyncThunk<
  {
    accounts: BankWireAccount[];
    banks: BankWireBank[];
    purses: BankWirePurse[];
  }, // payload type
  string, // arg: user_id
  { rejectValue: string }
>("bankwire/meta", async (user_id, { rejectWithValue }) => {
  try {
    const fd = new FormData();
    fd.append("action", "bankWireMeta");
    fd.append("user_id", user_id);

    const { data } = await axios.post("/userdeposits", fd);
    return data.data as {
      accounts: BankWireAccount[];
      banks: BankWireBank[];
      purses: BankWirePurse[];
    };
  } catch (e: any) {
    return rejectWithValue(e.message || "Failed to load bank‐wire metadata");
  }
});

/* —─ 2.2  Submit the Bank-Wire request ───────────────────────── */
export const sendBankWireDeposit = createAsyncThunk<
  { redirect_url: string; reference: string }, // payload type
  {
    user_id: string;
    to: string;
    amount: number;
    currency: string;
    bank: string;
    purse?: string;
    client_bank: Record<string, string>;
  }, // arg type
  { rejectValue: string }
>("bankwire/send", async (p, { rejectWithValue }) => {
  try {
    const fd = new FormData();
    fd.append("action", "banktransfer");
    fd.append("user_id", p.user_id);
    fd.append("to", p.to);
    fd.append("amount", String(p.amount));
    fd.append("currency_target", p.currency);
    fd.append("bank", p.bank);
    if (p.purse) {
      fd.append("purses", p.purse);
    }

    Object.entries(p.client_bank).forEach(([k, v]) => {
      fd.append(`client_bank[${k}]`, v);
    });

    const { data } = await axios.post("/userdeposits", fd);
    return data.data as { redirect_url: string; reference: string };
  } catch (e: any) {
    return rejectWithValue(e.message || "Failed to send bank‐wire deposit");
  }
});

/* ══════════════════════════════════════════════════════════════ */
/* 3 ▸ Slice definition                                           */
/* ══════════════════════════════════════════════════════════════ */
interface BWState {
  accounts: BankWireAccount[];
  banks: BankWireBank[];
  purses: BankWirePurse[];

  status: "idle" | "loading" | "succeeded" | "failed"; // meta fetch
  saving: "idle" | "loading" | "succeeded" | "failed"; // form submit
  redirect: string | null; // pdf / print URL
  reference: string | null;
  error?: string;
}

const initialState: BWState = {
  accounts: [],
  banks: [],
  purses: [],
  status: "idle",
  saving: "idle",
  redirect: null,
  reference: null,
};

const bankWireSlice = createSlice({
  name: "bankwire",
  initialState,
  reducers: {
    resetBankWire: () => initialState,
  },
  extraReducers: (builder) => {
    /* —— fetchBankWireMeta _____________________________________ */
    builder
      .addCase(fetchBankWireMeta.pending, (state) => {
        state.status = "loading";
        state.error = undefined;
      })
      .addCase(fetchBankWireMeta.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.accounts = action.payload.accounts;
        state.banks = action.payload.banks;
        state.purses = action.payload.purses;
      })
      .addCase(fetchBankWireMeta.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload ?? action.error.message ?? "Failed loading data";
      });

    /* —— sendBankWireDeposit ___________________________________ */
    builder
      .addCase(sendBankWireDeposit.pending, (state) => {
        state.saving = "loading";
        state.error = undefined;
      })
      .addCase(sendBankWireDeposit.fulfilled, (state, action) => {
        state.saving = "succeeded";
        state.redirect = action.payload.redirect_url;
        state.reference = action.payload.reference;
      })
      .addCase(sendBankWireDeposit.rejected, (state, action) => {
        state.saving = "failed";
        state.error =
          action.payload ?? action.error.message ?? "Deposit failed";
      });
  },
});

export const { resetBankWire } = bankWireSlice.actions;
export default bankWireSlice.reducer;
