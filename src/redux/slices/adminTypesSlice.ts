// src/redux/slices/adminTypesSlice.ts
import {
  createSlice,
  createAsyncThunk,
  isPending,
  isRejected,
  PayloadAction,
} from "@reduxjs/toolkit";
import axiosInstance from "@/api/axiosInstance";
import {
  GridState,
  mapGridStateToDataTablesParams,
} from "@/components/ui/DataTablesMapper";

export interface TypeRecord {
  id: number;
  type: string;
  shortval: string;
  initial: number;
  spread: string;
  commission: number;
  leverage: number;
  hosting: number;
  strategy: string;
  iseuropean: "0" | "1";
  islive: "0" | "1";
  enabled: "0" | "1";
  server: "mt4" | "mt5";
  server_name: string;
}

export interface ServerInfo {
  id: string;
  server_name: string;
  server_type: string;
  global_type: string;
}

interface TypesState {
  data: any[][]; // raw rows for DataTables
  recordsTotal: number;
  recordsFiltered: number;

  current?: TypeRecord;
  servers: any;
  reportServers: ServerInfo[];
  loading: boolean;
  error?: string;
}

const initialState: TypesState = {
  data: [],
  recordsTotal: 0,
  recordsFiltered: 0,

  servers: {},
  reportServers: [],
  loading: false,
};

export interface DataTablesPayload {
  draw: number;
  recordsTotal: number;
  recordsFiltered: number;
  data: any[];
}
const API_PATH = "/admintypes";

// switch fetchTypes to pull in DataTables params…
export const fetchTypes = createAsyncThunk<
  DataTablesPayload, // { draw, recordsTotal, recordsFiltered, data }
  { urlPart: string; gridState: GridState },
  { rejectValue: string }
>("adminTypes/fetchTypes", async ({ gridState }, { rejectWithValue }) => {
  try {
    // now map the GridState → DataTables params here:
    const payload = mapGridStateToDataTablesParams(gridState, {
      action: "select",
    });
    const resp = await axiosInstance.post<{ data: any }>(
      "/admintypes",
      payload,
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
    const dt =
      typeof resp.data.data === "string"
        ? JSON.parse(resp.data.data)
        : resp.data.data;
    return dt as DataTablesPayload;
  } catch (e: any) {
    return rejectWithValue(e.message);
  }
});

/** fetch one type by id */
export const fetchType = createAsyncThunk<
  TypeRecord,
  number,
  { rejectValue: string }
>("adminTypes/fetchType", async (id, { rejectWithValue }) => {
  try {
    const form = new FormData();
    form.append("action", "selectOne");
    form.append("id", String(id));
    const resp = await axiosInstance.post<{ data: any }>(API_PATH, form);
    const x = resp.data.data;

    return {
      id: Number(x.Id),
      type: x.Type,
      shortval: x.Shortval,
      initial: Number(x.Initial),
      spread: x.Spread,
      commission: Number(x.Commission),
      leverage: Number(x.Leverage),
      hosting: Number(x.Hosting),
      strategy: x.Strategy,
      iseuropean: x.IsEuropean ? "1" : "0",
      islive: x.IsLive ? "1" : "0",
      enabled: x.Enabled ? "1" : "0",
      server: x.Server,
      server_name: x.ServerName ?? "",
    };
  } catch (e: any) {
    return rejectWithValue(e.message);
  }
});

/** fetch report‑servers list */
export const fetchReportServers = createAsyncThunk<
  ServerInfo[],
  void,
  { rejectValue: string }
>("adminTypes/fetchReportServers", async (_, { rejectWithValue }) => {
  try {
    const form = new FormData();
    form.append("action", "getReportServers");
    const resp = await axiosInstance.post<{ data: ServerInfo[] }>(
      API_PATH,
      form
    );
    return resp.data.data;
  } catch (e: any) {
    return rejectWithValue(e.message);
  }
});

/** fetch servers‑by‑type */
export const fetchServersByType = createAsyncThunk<
  any,
  number,
  { rejectValue: string }
>("adminTypes/fetchServersByType", async (typeId, { rejectWithValue }) => {
  try {
    const form = new FormData();
    form.append("action", "getServersByType");
    form.append("typeId", String(typeId));
    const resp = await axiosInstance.post<{ data: any }>(API_PATH, form);
    return resp.data.data;
  } catch (e: any) {
    return rejectWithValue(e.message);
  }
});

/** create a new type */
export const createType = createAsyncThunk<
  TypeRecord,
  Partial<TypeRecord>,
  { rejectValue: string }
>("adminTypes/createType", async (payload, { rejectWithValue }) => {
  try {
    const form = new FormData();
    form.append("action", "add");
    Object.entries(payload).forEach(([k, v]) => {
      if (v !== undefined) form.append(k, String(v));
    });
    const resp = await axiosInstance.post<{ data: any }>(API_PATH, form);
    const x = resp.data.data;
    // normalize the response exactly like fetchType
    return {
      id: Number(x.Id),
      type: x.Type,
      shortval: x.Shortval,
      initial: Number(x.Initial),
      spread: x.Spread,
      commission: Number(x.Commission),
      leverage: Number(x.Leverage),
      hosting: Number(x.Hosting),
      strategy: x.Strategy,
      iseuropean: x.IsEuropean ? "1" : "0",
      islive: x.IsLive ? "1" : "0",
      enabled: x.Enabled ? "1" : "0",
      server: x.Server,
      server_name: x.ServerName ?? "",
    };
  } catch (e: any) {
    return rejectWithValue(e.message);
  }
});

/** update an existing type */
export const updateType = createAsyncThunk<
  TypeRecord,
  TypeRecord,
  { rejectValue: string }
>("adminTypes/updateType", async (payload, { rejectWithValue }) => {
  try {
    const form = new FormData();
    form.append("action", "edit");
    Object.entries(payload).forEach(([k, v]) => {
      form.append(k, String(v));
    });
    const resp = await axiosInstance.post<{ data: any }>(API_PATH, form);
    const x = resp.data.data;
    return {
      id: Number(x.Id),
      type: x.Type,
      shortval: x.Shortval,
      initial: Number(x.Initial),
      spread: x.Spread,
      commission: Number(x.Commission),
      leverage: Number(x.Leverage),
      hosting: Number(x.Hosting),
      strategy: x.Strategy,
      iseuropean: x.IsEuropean ? "1" : "0",
      islive: x.IsLive ? "1" : "0",
      enabled: x.Enabled ? "1" : "0",
      server: x.Server,
      server_name: x.ServerName ?? "",
    };
  } catch (e: any) {
    return rejectWithValue(e.message);
  }
});

/** delete a type */
export const deleteType = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("adminTypes/deleteType", async (id, { rejectWithValue }) => {
  try {
    const form = new FormData();
    form.append("action", "delete");
    form.append("id", String(id));
    await axiosInstance.post(API_PATH, form);
    return id;
  } catch (e: any) {
    return rejectWithValue(e.message);
  }
});

// ─── the slice ──────────────────────────────────────────────
const slice = createSlice({
  name: "adminTypes",
  initialState,
  reducers: {
    clearCurrent(state) {
      state.current = undefined;
      state.error = undefined;
    },
  },
  extraReducers: (builder) =>
    builder
      // individual fulfilled handlers:
      .addCase(fetchTypes.pending, (s) => {
        s.loading = true;
        s.error = undefined;
      })
      .addCase(
        fetchTypes.fulfilled,
        (
          s,
          {
            payload: { data, recordsTotal, recordsFiltered },
          }: PayloadAction<{
            draw: number;
            recordsTotal: number;
            recordsFiltered: number;
            data: any[][];
          }>
        ) => {
          s.loading = false;
          s.data = data;
          s.recordsTotal = recordsTotal;
          s.recordsFiltered = recordsFiltered;
        }
      )
      .addCase(fetchTypes.rejected, (s, action) => {
        s.loading = false;
        s.error = action.payload ?? action.error.message;
      })
      .addCase(fetchType.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.current = payload;
      })
      .addCase(fetchReportServers.fulfilled, (state, { payload }) => {
        state.reportServers = payload;
      })
      .addCase(fetchServersByType.fulfilled, (state, { payload }) => {
        state.servers = payload;
      })
      // .addCase(createType.fulfilled, (state, { payload }) => {
      //   state.list.push(payload);
      // })
      // .addCase(updateType.fulfilled, (state, { payload }) => {
      //   const idx = state.list.findIndex((t) => t.id === payload.id);
      //   if (idx >= 0) state.list[idx] = payload;
      // })
      // .addCase(deleteType.fulfilled, (state, { payload }) => {
      //   state.list = state.list.filter((t) => t.id !== payload);
      // })

      // catch *any* pending of these thunks:
      .addMatcher(
        isPending(
          fetchTypes,
          fetchType,
          fetchReportServers,
          fetchServersByType,
          createType,
          updateType,
          deleteType
        ),
        (state) => {
          state.loading = true;
          state.error = undefined;
        }
      )

      // catch *any* rejection of these thunks:
      .addMatcher(
        isRejected(
          fetchTypes,
          fetchType,
          fetchReportServers,
          fetchServersByType,
          createType,
          updateType,
          deleteType
        ),
        (state, action) => {
          state.loading = false;
          // action.payload is defined if you used rejectWithValue
          state.error = (action.payload as string) ?? action.error.message;
        }
      ),
});

export const { clearCurrent } = slice.actions;
export default slice.reducer;
