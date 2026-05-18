// src/store/adminDetailsSlice.ts
import axiosInstance from "@/api/axiosInstance";
import {
  GridState,
  mapGridStateToDataTablesParams,
} from "@/components/ui/DataTablesMapper";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

interface DetailsState {
  draw: number;
  recordsTotal: number;
  recordsFiltered: number;
  data: any[];
  limits: Record<string, string>;
  status: "idle" | "loading" | "failed";
  error: string | null;
}

const initialState: DetailsState = {
  draw: 0,
  recordsTotal: 0,
  recordsFiltered: 0,
  data: [],
  limits: {},
  status: "idle",
  error: null,
};

/**
 * Fetch the “detailed transactions” report.
 * Expects params: { urlPart: string; gridState: GridState; user_id: string }
 * and will send action=selectDetailedTransactions to the server.
 */
export const fetchDetailedTransactions = createAsyncThunk<
  any, // payload: the raw response.data
  { urlPart: string; gridState: GridState; user_id: string },
  { rejectValue: string }
>(
  "adminDetails/fetchDetailedTransactions",
  async (params, { rejectWithValue }) => {
    try {
      const dataTablesParams = mapGridStateToDataTablesParams(
        params.gridState,
        {
          urlPart: params.urlPart,
          action: "selectDetailedTransactions",
          user_id: params.user_id,
        }
      );

      const response = await axiosInstance.post(
        "/admindetails",
        dataTablesParams,
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );
      return response.data;
    } catch (e: any) {
      return rejectWithValue(
        e.message || "Failed to fetch detailed transactions"
      );
    }
  }
);

/**
 * Fetch the live/demo limits for a user.
 */
export const fetchAccountLimits = createAsyncThunk<
  Record<string, string>, // payload: an object like { [T_LIVE]: "5", [T_DEMO]: "10", … }
  { user_id: string }, // arg: the user_id
  { rejectValue: string }
>(
  "adminDetails/fetchAccountLimits",
  async ({ user_id }, { rejectWithValue }) => {
    try {
      const body = new URLSearchParams({ user_id, action: "getAccountLimits" });
      const response = await axiosInstance.post("/admindetails", body);

      return response.data.data as Record<string, string>;
    } catch (e: any) {
      return rejectWithValue(e.message || "Failed to fetch account limits");
    }
  }
);

/**
 * Fetch the “detailed accounts” report.
 * Expects params: { urlPart: string; gridState: GridState; user_id: string }
 * and will send action=selectAccounts to the server.
 */
export const fetchDetailedAccounts = createAsyncThunk<
  any, // payload: the raw response.data
  { urlPart: string; gridState: GridState; user_id: string },
  { rejectValue: string }
>("adminDetails/fetchDetailedAccounts", async (params, { rejectWithValue }) => {
  try {
    const dataTablesParams = mapGridStateToDataTablesParams(params.gridState, {
      urlPart: params.urlPart,
      action: "selectAccounts",
      user_id: params.user_id,
    });

    const response = await axiosInstance.post(
      "/admindetails",
      dataTablesParams,
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
    return response.data;
  } catch (e: any) {
    return rejectWithValue(e.message || "Failed to fetch detailed accounts");
  }
});

/**
 * Fetch the “detailed purses” report.
 * Expects params: { urlPart: string; gridState: GridState; user_id: string }
 * and will send action=selectDetailedPurses to the server.
 */
export const fetchDetailedPurses = createAsyncThunk<
  any, // payload: the raw response.data
  { urlPart: string; gridState: GridState; user_id: string },
  { rejectValue: string }
>("adminDetails/fetchDetailedPurses", async (params, { rejectWithValue }) => {
  try {
    const dataTablesParams = mapGridStateToDataTablesParams(params.gridState, {
      urlPart: params.urlPart,
      action: "selectDetailedPurses",
      user_id: params.user_id,
    });

    const response = await axiosInstance.post(
      "/admindetails",
      dataTablesParams,
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
    return response.data;
  } catch (e: any) {
    return rejectWithValue(e.message || "Failed to fetch detailed purses");
  }
});

/**
 * Fetch the “user actions log” report.
 * Expects params: { urlPart: string; gridState: GridState; user_id: string }
 * and will send action=selectUserActionsLog to the server.
 */
export const fetchUserActionsLog = createAsyncThunk<
  any, // payload: the raw response.data
  { urlPart: string; gridState: GridState; user_id: string },
  { rejectValue: string }
>("adminDetails/fetchUserActionsLog", async (params, { rejectWithValue }) => {
  try {
    const dataTablesParams = mapGridStateToDataTablesParams(params.gridState, {
      urlPart: params.urlPart,
      action: "selectUserActionsLog",
      user_id: params.user_id,
    });
    const response = await axiosInstance.post(
      "/admindetails",
      dataTablesParams,
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
    return response.data;
  } catch (e: any) {
    return rejectWithValue(e.message || "Failed to fetch user actions log");
  }
});

/**
 * Fetch the “user emails” report.
 * Expects params: { urlPart: string; gridState: GridState; user_id: string }
 * and will send action=selectUserEmails to the server.
 */
export const fetchUserEmails = createAsyncThunk<
  any, // payload: the raw response.data
  { urlPart: string; gridState: GridState; user_id: string },
  { rejectValue: string }
>("adminDetails/fetchUserEmails", async (params, { rejectWithValue }) => {
  try {
    const dataTablesParams = mapGridStateToDataTablesParams(params.gridState, {
      urlPart: params.urlPart,
      action: "selectUserEmails",
      user_id: params.user_id,
    });
    const response = await axiosInstance.post(
      "/admindetails",
      dataTablesParams,
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
    return response.data;
  } catch (e: any) {
    return rejectWithValue(e.message || "Failed to fetch user emails");
  }
});

/**
 * Fetch the “user messages” report.
 * Expects params: { urlPart: string; gridState: GridState; user_id: string }
 * and will send action=selectUserMessages to the server.
 */
export const fetchUserMessages = createAsyncThunk<
  any, // payload: the raw response.data
  { urlPart: string; gridState: GridState; user_id: string },
  { rejectValue: string }
>("adminDetails/fetchUserMessages", async (params, { rejectWithValue }) => {
  try {
    const dataTablesParams = mapGridStateToDataTablesParams(params.gridState, {
      urlPart: params.urlPart,
      action: "selectUserMessages",
      user_id: params.user_id,
    });

    const response = await axiosInstance.post(
      "/admindetails",
      dataTablesParams,
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
    return response.data;
  } catch (e: any) {
    return rejectWithValue(e.message || "Failed to fetch user messages");
  }
});

/**
 * Fetch referral information (not a thunk, plain async function).
 * On error, it will throw as usual.
 */
export async function fetchReferral(user_id: string) {
  const body = new URLSearchParams({
    action: "getReferAFriend",
    user_id,
  });
  const { data } = await axiosInstance.post("/admindetails", body);
  /* envelope: {status,msg,data} → return only payload */
  return data.data as {
    link: string | null;
    registrations: number;
    campaignName: string;
  };
}

/**
 * Toggle “hidden” flag on the server.
 * Payload: { user_id, login, type, hidden }
 */
export const toggleAccountHidden = createAsyncThunk<
  { login: string; hidden: boolean },
  { user_id: string; login: string; type: string; hidden: boolean },
  { rejectValue: string }
>(
  "adminDetails/toggleAccountHidden",
  async ({ user_id, login, type, hidden }, { rejectWithValue }) => {
    try {
      const body = new URLSearchParams({
        user_id,
        login,
        type,
        platform: "mt5",
        hidden: hidden ? "1" : "0",
        action: "toggleAccountHidden",
      });
      await axiosInstance.post("/admindetails", body);
      return { login, hidden };
    } catch (e: any) {
      return rejectWithValue(e.message || "Failed to update hidden");
    }
  }
);

/**
 * Toggle “eu” flag on the server.
 * Payload: { user_id, login, type, eu }
 */
export const toggleAccountEu = createAsyncThunk<
  { login: string; eu: boolean },
  { user_id: string; login: string; type: string; eu: boolean },
  { rejectValue: string }
>(
  "adminDetails/toggleAccountEu",
  async ({ user_id, login, type, eu }, { rejectWithValue }) => {
    try {
      const body = new URLSearchParams({
        user_id,
        login,
        type,
        platform: "mt5",
        eu: eu ? "1" : "0",
        action: "toggleAccountEu",
      });
      await axiosInstance.post("/admindetails", body);
      return { login, eu };
    } catch (e: any) {
      return rejectWithValue(e.message || "Failed to update EU flag");
    }
  }
);

/**
 * Update live/demo account limits for a user.
 * Payload: { user_id, limits }
 */
export const updateAccountLimits = createAsyncThunk<
  void,
  { user_id: string; limits: Record<string, string> },
  { rejectValue: string }
>(
  "adminDetails/updateAccountLimits",
  async ({ user_id, limits }, { rejectWithValue }) => {
    try {
      const body = new URLSearchParams({
        user_id,
        action: "updateAccountLimits",
      });
      // append each limit[T_LIVE], limit[T_DEMO], etc.
      Object.entries(limits).forEach(([type, val]) =>
        body.append(`limit[${type}]`, val)
      );
      await axiosInstance.post("/admindetails", body);
    } catch (e: any) {
      return rejectWithValue(e.message || "Failed to update limits");
    }
  }
);

const adminDetailsSlice = createSlice({
  name: "adminDetails",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ─── fetchDetailedTransactions ───────────────────────────
      .addCase(fetchDetailedTransactions.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchDetailedTransactions.fulfilled, (state, action) => {
        state.status = "idle";
        let parsed;
        try {
          parsed =
            typeof action.payload.data === "string"
              ? JSON.parse(action.payload.data)
              : action.payload.data;
        } catch {
          parsed = {
            draw: 0,
            recordsTotal: 0,
            recordsFiltered: 0,
            data: [],
          };
        }
        state.draw = parsed.draw;
        state.recordsTotal = parsed.recordsTotal;
        state.recordsFiltered = parsed.recordsFiltered;
        state.data = parsed.data;
      })
      .addCase(fetchDetailedTransactions.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload ??
          action.error.message ??
          "Failed to fetch detailed transactions";
      })

      // ─── fetchDetailedAccounts ──────────────────────────────
      .addCase(fetchDetailedAccounts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchDetailedAccounts.fulfilled, (state, action) => {
        state.status = "idle";
        let parsed;
        try {
          parsed =
            typeof action.payload.data === "string"
              ? JSON.parse(action.payload.data)
              : action.payload.data;
        } catch {
          parsed = {
            draw: 0,
            recordsTotal: 0,
            recordsFiltered: 0,
            data: [],
          };
        }
        state.draw = parsed.draw;
        state.recordsTotal = parsed.recordsTotal;
        state.recordsFiltered = parsed.recordsFiltered;
        state.data = parsed.data;
      })
      .addCase(fetchDetailedAccounts.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload ??
          action.error.message ??
          "Failed to fetch detailed accounts";
      })

      // ─── fetchDetailedPurses ───────────────────────────────
      .addCase(fetchDetailedPurses.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchDetailedPurses.fulfilled, (state, action) => {
        state.status = "idle";
        let parsed;
        try {
          parsed =
            typeof action.payload.data === "string"
              ? JSON.parse(action.payload.data)
              : action.payload.data;
        } catch {
          parsed = {
            draw: 0,
            recordsTotal: 0,
            recordsFiltered: 0,
            data: [],
          };
        }
        state.draw = parsed.draw;
        state.recordsTotal = parsed.recordsTotal;
        state.recordsFiltered = parsed.recordsFiltered;
        state.data = parsed.data;
      })
      .addCase(fetchDetailedPurses.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload ??
          action.error.message ??
          "Failed to fetch detailed purses";
      })

      // ─── fetchUserActionsLog ────────────────────────────────
      .addCase(fetchUserActionsLog.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchUserActionsLog.fulfilled, (state, action) => {
        state.status = "idle";
        let parsed;
        try {
          parsed =
            typeof action.payload.data === "string"
              ? JSON.parse(action.payload.data)
              : action.payload.data;
        } catch {
          parsed = {
            draw: 0,
            recordsTotal: 0,
            recordsFiltered: 0,
            data: [],
          };
        }
        state.draw = parsed.draw;
        state.recordsTotal = parsed.recordsTotal;
        state.recordsFiltered = parsed.recordsFiltered;
        state.data = parsed.data;
      })
      .addCase(fetchUserActionsLog.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload ??
          action.error.message ??
          "Failed to fetch user actions log";
      })

      // ─── fetchUserEmails ────────────────────────────────────
      .addCase(fetchUserEmails.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchUserEmails.fulfilled, (state, action) => {
        state.status = "idle";
        let parsed;
        try {
          parsed =
            typeof action.payload.data === "string"
              ? JSON.parse(action.payload.data)
              : action.payload.data;
        } catch {
          parsed = {
            draw: 0,
            recordsTotal: 0,
            recordsFiltered: 0,
            data: [],
          };
        }
        state.draw = parsed.draw;
        state.recordsTotal = parsed.recordsTotal;
        state.recordsFiltered = parsed.recordsFiltered;
        state.data = parsed.data;
      })
      .addCase(fetchUserEmails.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload ??
          action.error.message ??
          "Failed to fetch user emails";
      })

      // ─── fetchUserMessages ─────────────────────────────────
      .addCase(fetchUserMessages.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchUserMessages.fulfilled, (state, action) => {
        state.status = "idle";
        let parsed;
        try {
          parsed =
            typeof action.payload.data === "string"
              ? JSON.parse(action.payload.data)
              : action.payload.data;
        } catch {
          parsed = {
            draw: 0,
            recordsTotal: 0,
            recordsFiltered: 0,
            data: [],
          };
        }
        state.draw = parsed.draw;
        state.recordsTotal = parsed.recordsTotal;
        state.recordsFiltered = parsed.recordsFiltered;
        state.data = parsed.data;
      })
      .addCase(fetchUserMessages.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload ??
          action.error.message ??
          "Failed to fetch user messages";
      })
      .addCase(toggleAccountHidden.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        toggleAccountHidden.fulfilled,
        (state, action: PayloadAction<{ login: string; hidden: boolean }>) => {
          state.status = "idle";
          const { login, hidden } = action.payload;
          state.data = state.data.map((row) => {
            if (row[0] === login) {
              const newRow = [...row];
              newRow[9] = hidden ? "1" : "0"; // backendCols.hidden = 9
              return newRow;
            }
            return row;
          });
        }
      )
      .addCase(toggleAccountHidden.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message || "";
      })

      // ─── toggleAccountEu ──────────────────────────────────
      .addCase(toggleAccountEu.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        toggleAccountEu.fulfilled,
        (state, action: PayloadAction<{ login: string; eu: boolean }>) => {
          state.status = "idle";
          const { login, eu } = action.payload;
          state.data = state.data.map((row) => {
            if (row[0] === login) {
              const newRow = [...row];
              newRow[10] = eu ? "1" : "0"; // backendCols.eu = 10
              return newRow;
            }
            return row;
          });
        }
      )
      .addCase(toggleAccountEu.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message || "";
      })
      // fetchAccountLimits
      .addCase(fetchAccountLimits.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(
        fetchAccountLimits.fulfilled,
        (state, action: PayloadAction<Record<string, string>>) => {
          state.status = "idle";
          state.limits = action.payload;
        }
      )
      .addCase(fetchAccountLimits.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload ?? action.error.message ?? "Failed to fetch limits";
      });
  },
});

export default adminDetailsSlice.reducer;
