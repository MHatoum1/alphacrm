// src/redux/slices/accountCreateSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

import axiosInstance from "@/api/axiosInstance";
/* ---------- types ---------- */
export interface CreateOptions {
  currencies: string[];
  leverages: number[];
  defaultCurrency: string;
  defaultLeverage: number;
  showDemoFund: boolean;
  demoFunds: number[];
}

export interface CreatePayload {
  user_id: string;
  type: "live" | "demo";
  shortval: string;
  className: string;
  platform: "mt4" | "mt5";
}

/** unified error shape we’ll use across thunks */
export type ThunkError = { code?: number; message: string; status?: number };

const stripHashes = (s: string) => s.replace(/^#+|#+$/g, "").trim();

const parseAxiosError = (e: any): ThunkError => {
  // network / timeout
  if (!e?.response) {
    return { message: e?.message || "Network error. Please try again." };
  }

  const status = e.response.status;
  let data: any = e.response.data;

  // some backends send text; try to JSON parse
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      /* keep as string */
    }
  }

  // Your backend examples:
  // { errorCode, errorMessage }
  // { status: "error", message: "###...###", data: { error_code: 3001 } }
  const code =
    data?.errorCode ?? data?.error_code ?? data?.data?.error_code ?? undefined;

  const rawMsg =
    data?.errorMessage ??
    data?.message ??
    e.response.statusText ??
    e.message ??
    "Request failed";

  const message = stripHashes(String(rawMsg).replace(/_/g, " "));

  return { code, message, status };
};

/* ---------- thunks ---------- */
export const fetchCreateOptions = createAsyncThunk<
  CreateOptions,
  CreatePayload,
  { rejectValue: ThunkError }
>("account/create/options", async (p, { rejectWithValue }) => {
  try {
    const form = new FormData();
    form.append("action", "getCreateOptions");
    form.append("user_id", p.user_id);
    form.append("type", p.type);
    form.append("shortval", p.shortval);
    form.append("className", p.className);
    form.append("platform", p.platform);

    const { data } = await axiosInstance.post("/useraccounts", form);
    return data.data.options as CreateOptions;
  } catch (e: any) {
    return rejectWithValue(parseAxiosError(e)); // ← HERE
  }
});

export const createAccount = createAsyncThunk<
  { uid: number; login: number },
  {
    params: CreatePayload;
    currency: string;
    leverage: number;
    demoFund?: number;
  },
  { rejectValue: ThunkError }
>(
  "account/create",
  async ({ params, currency, leverage, demoFund }, { rejectWithValue }) => {
    try {
      const form = new FormData();
      form.append("action", "createAccount");
      form.append("user_id", params.user_id);
      form.append("type", params.type);
      form.append("shortval", params.shortval);
      form.append("className", params.className);
      form.append("platform", params.platform);
      form.append("currency", currency);
      form.append("leverage", String(leverage));
      if (params.type === "demo")
        form.append("demoFund", String(demoFund ?? 0));

      const { data } = await axiosInstance.post("/useraccounts", form);
      return data.data as { uid: number; login: number };
    } catch (e: any) {
      return rejectWithValue(parseAxiosError(e)); // ← AND HERE
    }
  }
);

/* ---------- slice ---------- */
interface AccountCreateState {
  options: CreateOptions | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  errorCode?: number | null;
  errorStatus?: number | null;
}

const initialState: AccountCreateState = {
  options: null,
  status: "idle",
  error: null,
  errorCode: null,
  errorStatus: null,
};

const accountCreateSlice = createSlice({
  name: "accountCreate",
  initialState,
  reducers: {
    reset: (state) => {
      state.options = null;
      state.status = "idle";
      state.error = null;
      state.errorCode = null;
      state.errorStatus = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* fetchCreateOptions */
      .addCase(fetchCreateOptions.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.errorCode = null;
        state.errorStatus = null;
      })
      .addCase(
        fetchCreateOptions.fulfilled,
        (state, action: PayloadAction<CreateOptions>) => {
          state.status = "succeeded";
          state.options = action.payload;
        }
      )
      .addCase(fetchCreateOptions.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload?.message ??
          action.error.message ??
          "Failed to load options";
        state.errorCode = action.payload?.code ?? null;
        state.errorStatus = action.payload?.status ?? null;
      })

      /* createAccount */
      .addCase(createAccount.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.errorCode = null;
        state.errorStatus = null;
      })
      .addCase(createAccount.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(createAccount.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload?.message ??
          action.error.message ??
          "Failed to create account";
        state.errorCode = action.payload?.code ?? null;
        state.errorStatus = action.payload?.status ?? null;
      });
  },
});

export const { reset: resetAccountCreate } = accountCreateSlice.actions;
export default accountCreateSlice.reducer;
