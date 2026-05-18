// src/redux/slices/activationSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/api/axiosInstance";

/* ------------------------------------------------------------------ */
/* ▸ state type                                                       */
/* ------------------------------------------------------------------ */
interface ActivationState {
  status: "idle" | "loading" | "failed";
  msg?: string;
  error?: string;
  redirect?: string; // ← returned by the API on success
}
const initialState: ActivationState = { status: "idle" };

/* ------------------------------------------------------------------ */
/* ▸ helpers                                                          */
/* ------------------------------------------------------------------ */
const post = (params: Record<string, string | undefined>) => {
  const body = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined) body.append(k, v);
  });
  return axios.post("/useractivation", body).then((r) => r.data);
};

/* ------------------------------------------------------------------ */
/* ▸ thunks                                                           */
/* ------------------------------------------------------------------ */
export const resendCode = createAsyncThunk<
  string, // ▲ payload (message)
  { user_id: string; email: string }, // ▼ argument
  { rejectValue: string }
>("activation/resend", async ({ user_id, email }, { rejectWithValue }) => {
  try {
    const { data } = await post({
      action: "send_code",
      user_id,
      email,
    });
    return data.message as string;
  } catch (err: any) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const activateProfile = createAsyncThunk<
  { message: string; redirect?: string }, // ▲ payload
  { user_id: string; code: string }, // ▼ argument
  { rejectValue: string }
>("activation/activate", async ({ user_id, code }, { rejectWithValue }) => {
  try {
    const data = await post({
      action: "activate",
      user_id,
      acode: code,
    });

    const message = data.data.message;
    const redirect = data.data.redirect;
    return { message, redirect };
  } catch (err: any) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

/* ------------------------------------------------------------------ */
/* ▸ slice                                                            */
/* ------------------------------------------------------------------ */
const activationSlice = createSlice({
  name: "activation",
  initialState,
  reducers: {
    clearMsg(state) {
      state.msg = state.error = state.redirect = undefined;
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    /* helper lambdas – keep identical to clientProfile style -------- */
    const pend = (s: ActivationState) => {
      s.status = "loading";
      s.error = s.msg = s.redirect = undefined;
    };
    const ok = (s: ActivationState, msg: string, redirect?: string) => {
      s.status = "idle";
      s.msg = msg;
      if (redirect) s.redirect = redirect;
    };
    const fail = (s: ActivationState, err: any) => {
      s.status = "failed";
      s.error = err.payload.data.message ?? err.message ?? "Action failed";
    };

    /* resend -------------------------------------------------------- */
    builder
      .addCase(resendCode.pending, pend)
      .addCase(resendCode.fulfilled, (s, a) => ok(s, a.payload))
      .addCase(resendCode.rejected, fail)

      /* activate ---------------------------------------------------- */
      .addCase(activateProfile.pending, pend)
      .addCase(activateProfile.fulfilled, (s, a) =>
        ok(s, a.payload.message, a.payload.redirect)
      )
      .addCase(activateProfile.rejected, fail);
  },
});

export const { clearMsg } = activationSlice.actions;
export default activationSlice.reducer;
