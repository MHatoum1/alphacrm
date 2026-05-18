import {
  createSlice,
  createAsyncThunk,
  isPending,
  isRejected,
} from "@reduxjs/toolkit";
import axiosInstance from "@/api/axiosInstance";
import {
  GridState,
  mapGridStateToDataTablesParams,
} from "@/components/ui/DataTablesMapper";

export interface GroupRecord {
  id: number;
  grp: string;
  platform: string;
  currency: string;
  configId: number;
  liveglobal: string;
}

interface GroupsState {
  data: any[][];
  recordsTotal: number;
  recordsFiltered: number;
  current?: GroupRecord;
  loading: boolean;
  error?: string;
}

const initialState: GroupsState = {
  data: [],
  recordsTotal: 0,
  recordsFiltered: 0,
  loading: false,
};

export const fetchGroups = createAsyncThunk<
  {
    draw: number;
    recordsTotal: number;
    recordsFiltered: number;
    data: any[][];
  },
  { urlPart: string; gridState: GridState },
  { rejectValue: string }
>("adminGroups/fetchGroups", async ({ gridState }, { rejectWithValue }) => {
  try {
    const form = mapGridStateToDataTablesParams(gridState, {
      action: "select",
    });
    const resp = await axiosInstance.post<{ data: any }>("/admingroups", form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    const dt =
      typeof resp.data.data === "string"
        ? JSON.parse(resp.data.data)
        : resp.data.data;
    return dt;
  } catch (e: any) {
    return rejectWithValue(e.message);
  }
});

export const fetchGroup = createAsyncThunk<
  GroupRecord,
  number,
  { rejectValue: string }
>("adminGroups/fetchGroup", async (id, { rejectWithValue }) => {
  try {
    const form = new FormData();
    form.append("action", "selectOne");
    form.append("id", String(id));
    const resp = await axiosInstance.post<{ data: any }>("/admingroups", form);
    return resp.data.data as GroupRecord;
  } catch (e: any) {
    return rejectWithValue(e.message);
  }
});

export const fetchGroupsByConfig = createAsyncThunk<
  { Id: number; Grp: string }[],
  number,
  { rejectValue: string }
>("adminGroups/fetchGroupsByConfig", async (configId, { rejectWithValue }) => {
  try {
    const form = new FormData();
    form.append("action", "getByConfig");
    form.append("configId", String(configId));
    const resp = await axiosInstance.post<{ data: any }>("/admingroups", form);
    return resp.data.data;
  } catch (e: any) {
    return rejectWithValue(e.message);
  }
});

// New: this returns a string[] and takes the server key (string)
export const fetchGroupsByServer = createAsyncThunk<
  string[],
  string,
  { rejectValue: string }
>("adminGroups/fetchGroupsByServer", async (serverKey, { rejectWithValue }) => {
  try {
    const form = new FormData();
    form.append("action", "getByServer");
    form.append("server_name", serverKey);
    const resp = await axiosInstance.post<{ data: string[] }>(
      "/admingroups",
      form
    );
    return resp.data.data; // now correctly typed as string[]
  } catch (e: any) {
    return rejectWithValue(e.message);
  }
});

export const createGroup = createAsyncThunk<
  GroupRecord,
  Partial<GroupRecord>,
  { rejectValue: string }
>("adminGroups/createGroup", async (payload, { rejectWithValue }) => {
  try {
    const form = new FormData();
    form.append("action", "add");
    Object.entries(payload).forEach(([k, v]) => form.append(k, String(v)));
    const resp = await axiosInstance.post<{ data: any }>("/admingroups", form);
    return resp.data.data as GroupRecord;
  } catch (e: any) {
    return rejectWithValue(e.message);
  }
});

export const updateGroup = createAsyncThunk<
  GroupRecord,
  GroupRecord,
  { rejectValue: string }
>("adminGroups/updateGroup", async (payload, { rejectWithValue }) => {
  try {
    const form = new FormData();
    form.append("action", "edit");
    Object.entries(payload).forEach(([k, v]) => form.append(k, String(v)));
    const resp = await axiosInstance.post<{ data: any }>("/admingroups", form);
    return resp.data.data as GroupRecord;
  } catch (e: any) {
    return rejectWithValue(e.message);
  }
});

export const deleteGroup = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("adminGroups/deleteGroup", async (id, { rejectWithValue }) => {
  try {
    const form = new FormData();
    form.append("action", "delete");
    form.append("id", String(id));
    await axiosInstance.post("/admingroups", form);
    return id;
  } catch (e: any) {
    return rejectWithValue(e.message);
  }
});

const slice = createSlice({
  name: "adminGroups",
  initialState,
  reducers: {},
  extraReducers: (b) =>
    b
      .addCase(fetchGroups.pending, (s) => {
        s.loading = true;
        s.error = undefined;
      })
      .addCase(fetchGroups.fulfilled, (s, { payload }) => {
        s.loading = false;
        s.data = payload.data;
        s.recordsTotal = payload.recordsTotal;
        s.recordsFiltered = payload.recordsFiltered;
      })
      .addCase(fetchGroups.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload ?? a.error.message;
      })
      .addCase(fetchGroup.fulfilled, (s, { payload }) => {
        s.loading = false;
        s.current = payload;
      })
      // .addCase(fetchGroupsByConfig.fulfilled, (s, { payload }) => {
      //   // not stored in slice; consumed in component
      // })
      // .addCase(fetchGroupsByServer.fulfilled, (s, { payload }) => {
      //   // not stored in slice; consumed in component
      // })
      .addCase(createGroup.fulfilled, (s) => {
        s.loading = false;
      })
      .addCase(updateGroup.fulfilled, (s) => {
        s.loading = false;
      })
      .addCase(deleteGroup.fulfilled, (s) => {
        s.loading = false;
      })
      .addMatcher(
        isPending(fetchGroup, createGroup, updateGroup, deleteGroup),
        (s) => {
          s.loading = true;
          s.error = undefined;
        }
      )
      .addMatcher(
        isRejected(fetchGroup, createGroup, updateGroup, deleteGroup),
        (s, a) => {
          s.loading = false;
          s.error = a.payload ?? a.error.message;
        }
      ),
});

export default slice.reducer;
