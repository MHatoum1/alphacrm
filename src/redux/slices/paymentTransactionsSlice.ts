// src/redux/slices/paymentTransactionsSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/api/axiosInstance";

/* ─── types coming from the back-end ───────────────────────── */
export interface AccountOption {
  value: string;
  label: string;
}
export interface OperationOption {
  value: string;
  label: string;
}

/**
 * The real API returns *only* these four fields under `data`.
 */
export interface ConfirmationData {
  amount: number;
  currency: string;
  reference: string;
  postData: Record<string, string>;
}

interface InitResponse {
  accOptions: AccountOption[];
  gacsOptions: AccountOption[];
  operations: OperationOption[];
  currencyOptions: AccountOption[];
}

/** wrapper used by *every* Admindetails response */
interface ApiEnvelope<T> {
  status: "success" | "error";
  message: string;
  data: T;
}

interface PaymentState {
  initStatus: "idle" | "loading" | "succeeded" | "failed";
  initError: string | null;
  initData?: InitResponse;

  confirmStatus: "idle" | "loading" | "succeeded" | "failed";
  confirmError: string | null;
  confirmData?: ConfirmationData;
}

const initialState: PaymentState = {
  initStatus: "idle",
  initError: null,
  confirmStatus: "idle",
  confirmError: null,
};

/* ─── fetch the init‐form data ───────────────────────────────── */
export const fetchPaymentInit = createAsyncThunk<
  InitResponse,
  string,
  { rejectValue: string }
>("payment/fetchInit", async (userId, { rejectWithValue }) => {
  try {
    const form = new FormData();
    form.append("action", "fetchPaymentInit");
    form.append("user_id", userId);

    const resp = await axios.post<ApiEnvelope<InitResponse>>(
      "/admindetails",
      form
    );

    if (resp.data.status !== "success") {
      // server‑side error in envelope
      return rejectWithValue(resp.data.message);
    }
    return resp.data.data;
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

/* ─── kick off the “Pay Now” prep ───────────────────────────── */
export const startPayment = createAsyncThunk<
  ConfirmationData,
  {
    userId: string;
    to: string;
    operation: string;
    currency_target: string;
    amount: number;
    comment: string;
    method: "deposit" | "withdraw";
  },
  { rejectValue: string }
>("payment/startPayment", async (args, { rejectWithValue }) => {
  try {
    const admin = JSON.parse(localStorage.getItem("user") || "{}");
    const form = new FormData();
    form.append("action", "startPayment");
    form.append("admin_id", admin.userID);
    form.append("user_id", args.userId);
    form.append("to", args.to);
    form.append("operation", args.operation);
    form.append("currency_target", args.currency_target);
    form.append("amount", String(args.amount));
    form.append("comment", args.comment);
    form.append("method", args.method);

    const resp = await axios.post<ApiEnvelope<ConfirmationData>>(
      "/admindetails",
      form
    );

    if (resp.data.status !== "success") {
      return rejectWithValue(resp.data.message);
    }
    return resp.data.data;
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

const slice = createSlice({
  name: "paymentTransactions",
  initialState,
  reducers: {
    clearConfirmation(state) {
      state.confirmData = undefined;
      state.confirmStatus = "idle";
      state.confirmError = null;
    },
  },
  extraReducers: (b) =>
    b
      // ─ init ───────────────────────────────────────────────
      .addCase(fetchPaymentInit.pending, (s) => {
        s.initStatus = "loading";
        s.initError = null;
      })
      .addCase(fetchPaymentInit.fulfilled, (s, { payload }) => {
        s.initStatus = "succeeded";
        s.initData = payload;
      })
      .addCase(fetchPaymentInit.rejected, (s, { payload, error }) => {
        s.initStatus = "failed";
        s.initError = payload || error.message || null;
      })

      // ─ startPayment ────────────────────────────────────────
      .addCase(startPayment.pending, (s) => {
        s.confirmStatus = "loading";
        s.confirmError = null;
        s.confirmData = undefined;
      })
      .addCase(startPayment.fulfilled, (s, { payload }) => {
        s.confirmStatus = "succeeded";
        s.confirmData = payload;
      })
      .addCase(startPayment.rejected, (s, { payload, error }) => {
        s.confirmStatus = "failed";
        s.confirmError = payload || error.message || null;
      }),
});

export const { clearConfirmation } = slice.actions;
export default slice.reducer;
