// src/redux/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import axiosInstance from "@/api/axiosInstance";

export interface AuthState {
  user: any | null;
  status: "idle" | "loading" | "failed";
  error: string | null;
  pending2fa?: { challengeToken: string; expiresAt: number } | null;
}

const initialState: AuthState = {
  user: localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")!)
    : null,
  status: "idle",
  error: null,
};

// Common network errors:
const network_errors = [
  "ERR_NETWORK",
  "ERR_CONNECTION_REFUSED",
  "ECONNREFUSED",
  "ERR_FAILED",
  "ERR_BAD_RESPONSE",
];
export const verifyLogin2FA = createAsyncThunk<
  any,
  { challengeToken: string; code: string },
  { rejectValue: { detail: string } }
>("auth/verifyLogin2FA", async (payload, { rejectWithValue }) => {
  try {
    const headers = { "Content-Type": "application/x-www-form-urlencoded" };
    const body = new URLSearchParams({
      action: "verifyLoginCode",
      challengeToken: payload.challengeToken,
      code: payload.code,
    });
    const res = await axiosInstance.post("/auth", body, { headers });
    return res.data;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response?.data) {
      return rejectWithValue(error.response.data);
    }
    return rejectWithValue({ detail: "twofa_verify_failed" });
  }
});

export const resendLogin2FA = createAsyncThunk<
  any,
  { challengeToken: string },
  { rejectValue: { detail: string } }
>("auth/resendLogin2FA", async (payload, { rejectWithValue }) => {
  try {
    const headers = { "Content-Type": "application/x-www-form-urlencoded" };
    const body = new URLSearchParams({
      action: "resendLoginCode",
      challengeToken: payload.challengeToken,
    });
    const res = await axiosInstance.post("/auth", body, { headers });
    return res.data;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response?.data) {
      return rejectWithValue(error.response.data);
    }
    return rejectWithValue({ detail: "twofa_resend_failed" });
  }
});

// ---------------------------------------------
// 1) The existing login thunk
// ---------------------------------------------
export const login = createAsyncThunk<
  any, // payload: response.data
  { email: string; password: string; action: "login" }, // arg
  { rejectValue: { detail: string } }
>("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const headers = { "Content-Type": "application/x-www-form-urlencoded" };
    const response = await axiosInstance.post("/auth", credentials, {
      headers,
    });
    return response.data; // { status, message, data: { ...userData } }
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      // Handle network errors
      if (
        error.code &&
        error.code !== "ERR_BAD_REQUEST" &&
        network_errors.includes(error.code)
      ) {
        return rejectWithValue({ detail: "network_error" });
      }
      // Return the server response if present
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
    }
    if (error.code === "ECONNABORTED") {
      return rejectWithValue({ detail: "timeout_error" });
    }
    return rejectWithValue({ detail: "exception_in_login" });
  }
});

// ---------------------------------------------
// 2) The NEW register thunk
// ---------------------------------------------
export const registerUser = createAsyncThunk<
  any, // payload: response.data
  {
    firstName: string;
    lastName: string;
    country: string;
    phoneCode: string;
    phoneNumber: string;
    email: string;
    countrybyIP?: string;
    partnerid?: string;
    campaign?: string;
    termsAccepted: boolean;
  }, // arg
  { rejectValue: { detail: string } }
>("auth/registerUser", async (userData, { rejectWithValue }) => {
  try {
    const headers = { "Content-Type": "application/x-www-form-urlencoded" };
    const payload: Record<string, string> = {
      action: "register",
      first_name: userData.firstName,
      last_name: userData.lastName,
      country: userData.country,
      phone_code: userData.phoneCode,
      phone_number: userData.phoneNumber,
      email: userData.email,
      countrybyIP: userData.countrybyIP ?? "",
      pid: userData.partnerid ?? "",
      campaign: userData.campaign ?? "",
      terms_accepted: userData.termsAccepted ? "1" : "0",
      code: "new_secure",
    };
    const response = await axiosInstance.post("/auth", payload, { headers });
    return response.data; // full envelope
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      // if (
      //   error.code &&
      //   error.code !== "ERR_BAD_REQUEST" &&
      //   network_errors.includes(error.code)
      // ) {
      //   return rejectWithValue({ detail: "network_error" });
      // }
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
    }
    if (error.code === "ECONNABORTED") {
      return rejectWithValue({ detail: "timeout_error" });
    }
    return rejectWithValue({ detail: "exception_in_registration" });
  }
});

/**
 * This single thunk is now used by BOTH the ordinary “client” form
 * *and* the Partner / IB registration form.
 *
 * Accept a completely generic record so we can forward every extra
 * field the IB form sends – (e.g.  partner_account_type, ib_experience …).
 */
export const registerIB = createAsyncThunk<
  any, // payload (envelope from PHP)
  Record<string, string | undefined>, // arg → every field allowed
  { rejectValue: { detail: string } }
>("auth/registerIB", async (form, { rejectWithValue }) => {
  try {
    const body = new URLSearchParams({ action: "registerIB" });
    Object.entries(form).forEach(([k, v]) => {
      if (v !== undefined) body.append(k, v);
    });
    const response = await axiosInstance.post("/auth", body, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    return response.data; // full envelope { status,message,data:{…} }
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      if (
        error.code &&
        error.code !== "ERR_BAD_REQUEST" &&
        network_errors.includes(error.code)
      ) {
        return rejectWithValue({ detail: "network_error" });
      }
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
    }
    if (error.code === "ECONNABORTED") {
      return rejectWithValue({ detail: "timeout_error" });
    }
    return rejectWithValue({ detail: "exception_in_registration" });
  }
});

// ---------------------------------------------
// 3) Request password reset thunk
// ---------------------------------------------
export const requestPasswordReset = createAsyncThunk<
  any, // payload: response.data
  { email: string; action: "requestPasswordReset" }, // arg
  { rejectValue: { detail: string } }
>("auth/requestPasswordReset", async (credentials, { rejectWithValue }) => {
  try {
    const headers = { "Content-Type": "application/x-www-form-urlencoded" };
    const response = await axiosInstance.post(
      "/auth/requestPassword",
      credentials,
      { headers }
    );
    return response.data; // { status, message, data: { … } }
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      if (
        error.code &&
        error.code !== "ERR_BAD_REQUEST" &&
        network_errors.includes(error.code)
      ) {
        return rejectWithValue({ detail: "network_error" });
      }
      if (error.response && error.response.data) {
        return rejectWithValue(error.response.data);
      }
    }
    if (error.code === "ECONNABORTED") {
      return rejectWithValue({ detail: "timeout_error" });
    }
    return rejectWithValue({ detail: "exception_in_requestPasswordReset" });
  }
});

// ---------------------------------------------
// 4) Reset password thunk
// ---------------------------------------------
export const resetPasswordAction = createAsyncThunk<
  any, // payload: response.data
  { token?: string; password: string }, // arg
  { rejectValue: { detail: string } }
>("auth/resetPassword", async (payload, { rejectWithValue }) => {
  try {
    const headers = { "Content-Type": "application/x-www-form-urlencoded" };
    const body = {
      action: "resetPassword",
      token: payload.token,
      password: payload.password,
    };
    const response = await axiosInstance.post("/auth", body, { headers });
    return response.data; // { status, message, data: {...}, redirect? }
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response && error.response.data) {
      return rejectWithValue(error.response.data);
    }
    return rejectWithValue({ detail: "Error resetting password" });
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },
    setUser: (state, action: PayloadAction<any>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // -----------------------------
      // login cases
      // -----------------------------
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<any>) => {
        state.status = "idle";
        const payload = action.payload;
        // If backend signals 2FA:
        if (payload?.data?.twofa) {
          state.user = null;
          (state as any).pending2fa = {
            challengeToken: payload.data.challengeToken,
            expiresAt: payload.data.expiresAt,
          };
          return;
        }
        // else normal flow
        const userData = payload.data;
        state.user = userData;
        localStorage.setItem("user", JSON.stringify(userData));
        if (userData.token) localStorage.setItem("token", userData.token);
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as any)?.detail || "login_failed";
      })

      // -----------------------------
      // register cases
      // -----------------------------
      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<any>) => {
        state.status = "idle";
        const userData = action.payload.data;
        state.user = userData || null;
        if (userData?.token) {
          localStorage.setItem("user", JSON.stringify(userData));
          localStorage.setItem("token", userData.token);
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as any)?.detail || "registration_failed";
      })
      // -----------------------------
      // register IB cases
      // -----------------------------
      .addCase(registerIB.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(registerIB.fulfilled, (state, action: PayloadAction<any>) => {
        state.status = "idle";
        const userData = action.payload.data;
        state.user = userData || null;
        if (userData?.token) {
          localStorage.setItem("user", JSON.stringify(userData));
          localStorage.setItem("token", userData.token);
        }
      })
      .addCase(registerIB.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as any)?.detail || "registration_failed";
      })

      // -----------------------------
      // requestPasswordReset cases
      // -----------------------------
      .addCase(requestPasswordReset.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(requestPasswordReset.fulfilled, (state) => {
        state.status = "idle";
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as any)?.detail || "requestPasswordReset_failed";
      })

      // -----------------------------
      // resetPasswordAction cases
      // -----------------------------
      .addCase(resetPasswordAction.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(resetPasswordAction.fulfilled, (state) => {
        state.status = "idle";
      })
      .addCase(resetPasswordAction.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as any)?.detail || "resetPassword_failed";
      })
      .addCase(
        verifyLogin2FA.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.status = "idle";
          const userData = action.payload.data;
          state.user = userData;
          (state as any).pending2fa = null;
          localStorage.setItem("user", JSON.stringify(userData));
          if (userData?.token) localStorage.setItem("token", userData.token);
        }
      )
      .addCase(
        resendLogin2FA.fulfilled,
        (state, action: PayloadAction<any>) => {
          const payload = action.payload;
          if (payload?.data?.challengeToken && (state as any).pending2fa) {
            (state as any).pending2fa = {
              challengeToken: payload.data.challengeToken,
              expiresAt: payload.data.expiresAt,
            };
          }
        }
      );
  },
});

export const { logout, setUser } = authSlice.actions;
export default authSlice.reducer;
