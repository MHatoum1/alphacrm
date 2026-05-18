// src/store/adminProfilesSlice.ts
import axiosInstance from "@/api/axiosInstance";
import {
  GridState,
  mapGridStateToDataTablesParams,
} from "@/components/ui/DataTablesMapper";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

interface ProfileState {
  draw: number;
  recordsTotal: number;
  recordsFiltered: number;
  data: any[];
  status: "idle" | "loading" | "failed";
  error: string | null;
}

const initialState: ProfileState = {
  draw: 0,
  recordsTotal: 0,
  recordsFiltered: 0,
  data: [],
  status: "idle",
  error: null,
};

export const fetchProfiles = createAsyncThunk<
  any, // payload: raw response.data
  { urlPart: string; campaign: string; gridState: GridState }, // arg type
  { rejectValue: string }
>("profiles/fetchProfiles", async (params, { rejectWithValue }) => {
  try {
    const dataTablesParams = mapGridStateToDataTablesParams(params.gridState, {
      urlPart: params.urlPart,
      campaign: params.campaign,
      action: "select",
    });

    const response = await axiosInstance.post(
      "/adminprofiles",
      dataTablesParams,
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
    return response.data;
  } catch (e: any) {
    return rejectWithValue(e.message || "Failed to fetch profiles");
  }
});

const adminProfilesSlice = createSlice({
  name: "adminprofiles",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfiles.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchProfiles.fulfilled, (state, action) => {
        state.status = "idle";
        let parsed;
        try {
          parsed =
            typeof action.payload.data === "string"
              ? JSON.parse(action.payload.data)
              : action.payload.data;
        } catch {
          parsed = { draw: 0, recordsTotal: 0, recordsFiltered: 0, data: [] };
        }
        state.draw = parsed.draw;
        state.recordsTotal = parsed.recordsTotal;
        state.recordsFiltered = parsed.recordsFiltered;
        state.data = parsed.data;
      })
      .addCase(fetchProfiles.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload ?? action.error.message ?? "Failed to fetch profiles";
      });
  },
});

export default adminProfilesSlice.reducer;
