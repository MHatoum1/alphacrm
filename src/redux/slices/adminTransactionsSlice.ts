// src/store/adminTransactionsSlice.ts
import axiosInstance from "@/api/axiosInstance";
import {
  GridState,
  mapGridStateToDataTablesParams,
} from "@/components/ui/DataTablesMapper";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

interface TransactionsState {
  draw: number;
  recordsTotal: number;
  recordsFiltered: number;
  data: any[];
  status: "idle" | "loading" | "failed";
  error: string | null;
}

const initialState: TransactionsState = {
  draw: 0,
  recordsTotal: 0,
  recordsFiltered: 0,
  data: [],
  status: "idle",
  error: null,
};

export const fetchDeposits = createAsyncThunk<
  any, // payload: raw response.data
  { urlPart: string; gridState: GridState }, // arg type
  { rejectValue: string }
>("transactions/fetchDeposits", async (params, { rejectWithValue }) => {
  try {
    const dataTablesParams = mapGridStateToDataTablesParams(params.gridState, {
      urlPart: params.urlPart,
      action: "select",
    });

    const response = await axiosInstance.post(
      "/admintransactions",
      dataTablesParams,
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
    return response.data;
  } catch (e: any) {
    return rejectWithValue(e.message || "Failed to fetch deposits");
  }
});

export const fetchWithdrawals = createAsyncThunk<
  any, // payload: raw response.data
  { urlPart: string; gridState: GridState }, // arg type
  { rejectValue: string }
>("transactions/fetchWithdrawals", async (params, { rejectWithValue }) => {
  try {
    const dataTablesParams = mapGridStateToDataTablesParams(params.gridState, {
      urlPart: params.urlPart,
      action: "selectWithdrawals",
    });

    const response = await axiosInstance.post(
      "/admintransactions",
      dataTablesParams,
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
    return response.data;
  } catch (e: any) {
    return rejectWithValue(e.message || "Failed to fetch withdrawals");
  }
});

export const fetchInternals = createAsyncThunk<
  any, // payload: raw response.data
  { urlPart: string; gridState: GridState }, // arg type
  { rejectValue: string }
>("transactions/fetchInternals", async (params, { rejectWithValue }) => {
  try {
    const dataTablesParams = mapGridStateToDataTablesParams(params.gridState, {
      urlPart: params.urlPart,
      action: "selectInternalTransfers",
    });

    const response = await axiosInstance.post(
      "/admintransactions",
      dataTablesParams,
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
    return response.data;
  } catch (e: any) {
    return rejectWithValue(e.message || "Failed to fetch internal transfers");
  }
});

export const fetchCards = createAsyncThunk<
  any, // payload: raw response.data
  { urlPart: string; gridState: GridState }, // arg type
  { rejectValue: string }
>("transactions/fetchCards", async (params, { rejectWithValue }) => {
  try {
    const dataTablesParams = mapGridStateToDataTablesParams(params.gridState, {
      urlPart: params.urlPart,
      action: "selectCreditCards",
    });

    const response = await axiosInstance.post(
      "/admintransactions",
      dataTablesParams,
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
    return response.data;
  } catch (e: any) {
    return rejectWithValue(e.message || "Failed to fetch credit cards");
  }
});

const adminTransactionsSlice = createSlice({
  name: "admintransactions",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    const parseAndAssign = (state: TransactionsState, payload: any) => {
      let parsed;
      try {
        parsed =
          typeof payload.data === "string"
            ? JSON.parse(payload.data)
            : payload.data;
      } catch {
        parsed = { draw: 0, recordsTotal: 0, recordsFiltered: 0, data: [] };
      }
      state.draw = parsed.draw;
      state.recordsTotal = parsed.recordsTotal;
      state.recordsFiltered = parsed.recordsFiltered;
      state.data = parsed.data;
    };

    builder
      .addCase(fetchDeposits.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchDeposits.fulfilled, (state, action) => {
        state.status = "idle";
        parseAndAssign(state, action.payload);
      })
      .addCase(fetchDeposits.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload ?? action.error.message ?? "Failed to fetch deposits";
      })

      .addCase(fetchWithdrawals.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchWithdrawals.fulfilled, (state, action) => {
        state.status = "idle";
        parseAndAssign(state, action.payload);
      })
      .addCase(fetchWithdrawals.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload ??
          action.error.message ??
          "Failed to fetch withdrawals";
      })

      .addCase(fetchInternals.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchInternals.fulfilled, (state, action) => {
        state.status = "idle";
        parseAndAssign(state, action.payload);
      })
      .addCase(fetchInternals.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload ??
          action.error.message ??
          "Failed to fetch internal transfers";
      })

      .addCase(fetchCards.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCards.fulfilled, (state, action) => {
        state.status = "idle";
        parseAndAssign(state, action.payload);
      })
      .addCase(fetchCards.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload ??
          action.error.message ??
          "Failed to fetch credit cards";
      });
  },
});

export default adminTransactionsSlice.reducer;
