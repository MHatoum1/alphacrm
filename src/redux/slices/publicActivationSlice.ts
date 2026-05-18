import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/api/axiosInstance";
import { setUser } from "@/redux/slices/authSlice"; // ❶ import
/* helper ---------------------------------------------------------- */
const post = (p: Record<string, string | undefined>) => {
  const body = new URLSearchParams();
  Object.entries(p).forEach(([k, v]) => v !== undefined && body.append(k, v));
  return axios.post("/publicactivation", body).then((r) => r.data);
};

/* ───────── thunks ──────────────────────────────────────────────── */
export const resendActivationCode = createAsyncThunk<
  string, // payload
  { email: string }, // arg
  { rejectValue: any }
>("activation/resend", async ({ email }, { rejectWithValue }) => {
  try {
    const { data } = await post({ action: "send_code", email });
    return data.message as string;
  } catch (err: any) {
    return rejectWithValue(err.response?.data || err);
  }
});

/*    ⬇⬇  now returns the COMPLETE `data` object we get from PHP  ⬇⬇   */
export const activateAccount = createAsyncThunk<
  { message: string; redirect?: string }, // payload for slice
  { acode: string }, // thunk arg
  { rejectValue: string; dispatch: any } // need dispatch typing
>(
  "publicActivation/activate",
  async ({ acode }, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await post({ action: "activate", acode });

      /* ❷ immediately update auth slice */
      dispatch(setUser(data)); // <- single source of truth

      /* ❸ stash in localStorage as before                          */
      localStorage.setItem("user", JSON.stringify(data));
      if (data.token) localStorage.setItem("token", data.token);

      return { message: data.message, redirect: data.redirect };
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

/* ───────── slice ──────────────────────────────────────────────── */
interface St {
  status: "idle" | "loading" | "failed";
  msg?: string;
  error?: string;
  redirect?: string;
  user?: any; // ← store user on success
}
const initial: St = { status: "idle" };

/* small helpers */
const pend = (s: St) => {
  s.status = "loading";
  s.msg = s.error = s.redirect = undefined;
};
const ok = (s: St, m: string, r?: string) => {
  s.status = "idle";
  s.msg = m;
  if (r) s.redirect = r;
};
const fail = (s: St, err: any) => {
  s.status = "failed";
  /* ② pretty-print error coming from PHP */
  s.error = err?.message || err?.detail || "failed_to_activate";
};

const slice = createSlice({
  name: "publicActivation",
  initialState: initial,
  reducers: {
    clearMessage: (s) => {
      s.msg = s.error = s.redirect = undefined;
      s.status = "idle";
    },
  },
  extraReducers: (b) =>
    b

      /* resend ---------------------------------------------------- */
      .addCase(resendActivationCode.pending, pend)
      .addCase(resendActivationCode.fulfilled, (s, a) => ok(s, a.payload))
      .addCase(resendActivationCode.rejected, (s, a) => fail(s, a.payload))

      /* activate -------------------------------------------------- */
      .addCase(activateAccount.pending, pend)
      .addCase(activateAccount.fulfilled, (state, action) => {
        // action.payload === { message, redirect }
        ok(state, action.payload.message, action.payload.redirect);
      })
      .addCase(activateAccount.rejected, (s, a) => fail(s, a.payload)),
});

export const { clearMessage } = slice.actions;
export default slice.reducer;
