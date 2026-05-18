import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "@/api/axiosInstance";

export interface UnlimitAccount {
  uid: string;
  label: string;
  currency: string | null;
  isGlobal: boolean;
}

export interface GooglePayConfig {
  environment: string;
  gateway: string;
  gatewayMerchantId: string;
  merchantName: string;
  countryCode: string;
}

export interface ApplePayConfig {
  countryCode: string;
  displayName: string;
  merchantIdentifier: string;
  supportedNetworks: string[];
  merchantCapabilities: string[];
}

export const fetchUnlimitAccounts = createAsyncThunk<
  UnlimitAccount[],
  string,
  { rejectValue: string }
>("unlimit/accounts", async (user_id, { rejectWithValue }) => {
  try {
    const f = new FormData();
    f.append("action", "getAccounts");
    f.append("user_id", user_id);
    const { data } = await axiosInstance.post("/unlimitpayment", f);
    return (data.data?.rows as UnlimitAccount[]) ?? [];
  } catch (e: any) {
    return rejectWithValue(
      e.response?.data?.message || e.message || "Failed loading accounts"
    );
  }
});

export const fetchGooglePayConfig = createAsyncThunk<
  GooglePayConfig,
  string,
  { rejectValue: string }
>("unlimit/googlepayConfig", async (user_id, { rejectWithValue }) => {
  try {
    const f = new FormData();
    f.append("action", "getGooglePayConfig");
    f.append("user_id", user_id);
    const { data } = await axiosInstance.post("/unlimitpayment", f);
    return data.data as GooglePayConfig;
  } catch (e: any) {
    return rejectWithValue(
      e.response?.data?.message || e.message || "Failed loading Google Pay config"
    );
  }
});

export const fetchApplePayConfig = createAsyncThunk<
  ApplePayConfig,
  string,
  { rejectValue: string }
>("unlimit/applepayConfig", async (user_id, { rejectWithValue }) => {
  try {
    const f = new FormData();
    f.append("action", "getApplePayConfig");
    f.append("user_id", user_id);
    const { data } = await axiosInstance.post("/unlimitpayment", f);
    return data.data as ApplePayConfig;
  } catch (e: any) {
    return rejectWithValue(
      e.response?.data?.message || e.message || "Failed loading Apple Pay config"
    );
  }
});

export const sendUnlimitDeposit = createAsyncThunk<
  { redirect_url?: string | null; reference?: string },
  {
    user_id: string;
    to: string;
    amount: number;
    currency: string;
  },
  { rejectValue: string }
>("unlimit/send", async (p, { rejectWithValue }) => {
  try {
    const f = new FormData();
    f.append("action", "unlimitInit");
    f.append("user_id", p.user_id);
    f.append("to", p.to);
    f.append("amount", String(p.amount));
    f.append("currency_target", p.currency);
    const { data } = await axiosInstance.post("/unlimitpayment", f);
    return data.data as { redirect_url?: string | null; reference?: string };
  } catch (e: any) {
    return rejectWithValue(
      e.response?.data?.message || e.message || "Deposit failed"
    );
  }
});

export const sendUnlimitGooglePayDeposit = createAsyncThunk<
  { redirect_url?: string | null; reference?: string },
  {
    user_id: string;
    to: string;
    amount: number;
    currency: string;
    googlepay_token: string;
  },
  { rejectValue: string }
>("unlimit/sendGooglePay", async (p, { rejectWithValue }) => {
  try {
    const f = new FormData();
    f.append("action", "unlimitGooglePayInit");
    f.append("user_id", p.user_id);
    f.append("to", p.to);
    f.append("amount", String(p.amount));
    f.append("currency_target", p.currency);
    f.append("googlepay_token", p.googlepay_token);
    const { data } = await axiosInstance.post("/unlimitpayment", f);
    return data.data as { redirect_url?: string | null; reference?: string };
  } catch (e: any) {
    return rejectWithValue(
      e.response?.data?.message || e.message || "Google Pay deposit failed"
    );
  }
});

export const sendUnlimitApplePayDeposit = createAsyncThunk<
  { redirect_url?: string | null; reference?: string },
  {
    user_id: string;
    to: string;
    amount: number;
    currency: string;
    applepay_token: string;
    applepay_pan?: string;
    applepay_expiration?: string;
    applepay_eci?: string;
    applepay_cryptogram?: string;
  },
  { rejectValue: string }
>("unlimit/sendApplePay", async (p, { rejectWithValue }) => {
  try {
    const f = new FormData();
    f.append("action", "unlimitApplePayInit");
    f.append("user_id", p.user_id);
    f.append("to", p.to);
    f.append("amount", String(p.amount));
    f.append("currency_target", p.currency);
    f.append("applepay_token", p.applepay_token);
    if (p.applepay_pan) f.append("applepay_pan", p.applepay_pan);
    if (p.applepay_expiration) f.append("applepay_expiration", p.applepay_expiration);
    if (p.applepay_eci) f.append("applepay_eci", p.applepay_eci);
    if (p.applepay_cryptogram) f.append("applepay_cryptogram", p.applepay_cryptogram);

    const { data } = await axiosInstance.post("/unlimitpayment", f);
    return data.data as { redirect_url?: string | null; reference?: string };
  } catch (e: any) {
    return rejectWithValue(
      e.response?.data?.message || e.message || "Apple Pay deposit failed"
    );
  }
});

export const fetchUnlimitWithdrawAccounts = createAsyncThunk<
  UnlimitAccount[],
  string,
  { rejectValue: string }
>("unlimit/wallets", async (user_id, { rejectWithValue }) => {
  try {
    const f = new FormData();
    f.append("action", "getWalletsAccounts");
    f.append("user_id", user_id);
    const { data } = await axiosInstance.post("/unlimitpayment", f);
    return (data.data?.rows as UnlimitAccount[]) ?? [];
  } catch (e: any) {
    return rejectWithValue(
      e.response?.data?.message || e.message || "Failed loading accounts"
    );
  }
});

export const sendUnlimitWithdraw = createAsyncThunk<
  { message: string; reference?: string },
  {
    user_id: string;
    wallet: string;
    amount: number;
    currency: string;
    pin: string;
    email: string;
    recipient_info: string;
    pan: string;
    holder: string;
    expiration: string;
  },
  { rejectValue: string }
>("unlimit/sendwithdraw", async (p, { rejectWithValue }) => {
  try {
    const f = new FormData();
    f.append("action", "unlimitInitWithdraw");
    f.append("user_id", p.user_id);
    f.append("wallet", p.wallet);
    f.append("amount", String(p.amount));
    f.append("currency", p.currency);
    f.append("secure_password", p.pin);
    f.append("email", p.email);
    f.append("recipient_info", p.recipient_info);
    f.append("pan", p.pan);
    f.append("holder", p.holder);
    f.append("expiration", p.expiration);
    const { data } = await axiosInstance.post("/unlimitpayment", f);
    return data.data as { message: string; reference?: string };
  } catch (e: any) {
    return rejectWithValue(
      e.response?.data?.message || e.message || "Withdraw failed"
    );
  }
});

interface St {
  accounts: UnlimitAccount[];
  status: "idle" | "loading" | "succeeded" | "failed";
  saving: "idle" | "loading" | "succeeded" | "failed";
  redirect: string | null;
  payload?: { amount: number; currency: string; reference?: string };
  error?: string;
  msg?: string;
  googlePayConfig?: GooglePayConfig;
  applePayConfig?: ApplePayConfig;
}

const initial: St = {
  accounts: [],
  status: "idle",
  saving: "idle",
  redirect: null,
};

const unlimitSlice = createSlice({
  name: "unlimit",
  initialState: initial,
  reducers: {
    resetUnlimit: () => initial,
  },
  extraReducers: (b) => {
    b.addCase(fetchUnlimitAccounts.pending, (st) => {
      st.status = "loading";
      st.error = undefined;
    })
      .addCase(fetchUnlimitAccounts.fulfilled, (st, a) => {
        st.status = "succeeded";
        st.accounts = a.payload;
      })
      .addCase(fetchUnlimitAccounts.rejected, (st, a) => {
        st.status = "failed";
        st.error = a.payload ?? a.error.message ?? "Failed loading accounts";
      });

    b.addCase(fetchGooglePayConfig.fulfilled, (st, a) => {
      st.googlePayConfig = a.payload;
    });

    b.addCase(fetchApplePayConfig.fulfilled, (st, a) => {
      st.applePayConfig = a.payload;
    });

    b.addCase(fetchUnlimitWithdrawAccounts.pending, (st) => {
      st.status = "loading";
      st.error = undefined;
    })
      .addCase(fetchUnlimitWithdrawAccounts.fulfilled, (st, a) => {
        st.status = "succeeded";
        st.accounts = a.payload;
      })
      .addCase(fetchUnlimitWithdrawAccounts.rejected, (st, a) => {
        st.status = "failed";
        st.error = a.payload ?? a.error.message ?? "Failed loading accounts";
      });

    b.addCase(sendUnlimitDeposit.pending, (st) => {
      st.saving = "loading";
      st.error = undefined;
      st.redirect = null;
      st.payload = undefined;
    })
      .addCase(sendUnlimitDeposit.fulfilled, (st, a) => {
        st.saving = "succeeded";
        st.redirect = a.payload.redirect_url ?? null;
        const { amount, currency } = a.meta.arg;
        st.payload = { amount, currency, reference: a.payload.reference };
      })
      .addCase(sendUnlimitDeposit.rejected, (st, a) => {
        st.saving = "failed";
        st.error = a.payload ?? a.error.message ?? "Deposit failed";
      });

    b.addCase(sendUnlimitGooglePayDeposit.pending, (st) => {
      st.saving = "loading";
      st.error = undefined;
      st.redirect = null;
      st.payload = undefined;
    })
      .addCase(sendUnlimitGooglePayDeposit.fulfilled, (st, a) => {
        st.saving = "succeeded";
        st.redirect = a.payload.redirect_url ?? null;
        const { amount, currency } = a.meta.arg;
        st.payload = { amount, currency, reference: a.payload.reference };
      })
      .addCase(sendUnlimitGooglePayDeposit.rejected, (st, a) => {
        st.saving = "failed";
        st.error = a.payload ?? a.error.message ?? "Google Pay deposit failed";
      });

    b.addCase(sendUnlimitApplePayDeposit.pending, (st) => {
      st.saving = "loading";
      st.error = undefined;
      st.redirect = null;
      st.payload = undefined;
    })
      .addCase(sendUnlimitApplePayDeposit.fulfilled, (st, a) => {
        st.saving = "succeeded";
        st.redirect = a.payload.redirect_url ?? null;
        const { amount, currency } = a.meta.arg;
        st.payload = { amount, currency, reference: a.payload.reference };
      })
      .addCase(sendUnlimitApplePayDeposit.rejected, (st, a) => {
        st.saving = "failed";
        st.error = a.payload ?? a.error.message ?? "Apple Pay deposit failed";
      });

    b.addCase(sendUnlimitWithdraw.pending, (st) => {
      st.saving = "loading";
      st.error = undefined;
      st.msg = undefined;
      st.payload = undefined;
    })
      .addCase(sendUnlimitWithdraw.fulfilled, (st, a) => {
        st.saving = "succeeded";
        st.msg = a.payload.message;
        const { amount, currency } = a.meta.arg;
        st.payload = { amount, currency, reference: a.payload.reference };
      })
      .addCase(sendUnlimitWithdraw.rejected, (st, a) => {
        st.saving = "failed";
        st.error = a.payload ?? a.error.message ?? "Withdraw failed";
      });
  },
});

export const { resetUnlimit } = unlimitSlice.actions;
export default unlimitSlice.reducer;
