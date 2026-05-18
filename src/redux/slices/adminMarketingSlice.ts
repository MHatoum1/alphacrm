// src/store/marketingSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/api/axiosInstance";
import {
  GridState,
  mapGridStateToDataTablesParams,
} from "@/components/ui/DataTablesMapper";

interface MarketingState {
  draw: number;
  recordsTotal: number;
  recordsFiltered: number;
  data: any[];
  status: "idle" | "loading" | "failed";
  error: string | null;
  details: {
    status: "idle" | "loading" | "failed";
    error: string | null;
    data: any;
  };
}

const initial: MarketingState = {
  draw: 0,
  recordsTotal: 0,
  recordsFiltered: 0,
  data: [],
  status: "idle",
  error: null,
  details: { status: "idle", error: null, data: {} },
};

/* ─── table – active ───────────────────────────────────────── */
export const fetchCampaigns = createAsyncThunk<
  any, // payload: raw response
  { urlPart: string; gridState: GridState },
  { rejectValue: string }
>("marketing/fetch", async (p, { rejectWithValue }) => {
  try {
    const body = mapGridStateToDataTablesParams(p.gridState, {
      urlPart: p.urlPart,
      action: "select",
    });
    const { data } = await axiosInstance.post("/adminmarketing", body, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return data;
  } catch (e: any) {
    return rejectWithValue(e.message || "Failed to fetch campaigns");
  }
});

/* ─── table – archived ──────────────────────────────────────── */
export const fetchCampaignsArchived = createAsyncThunk<
  any, // payload: raw response
  { urlPart: string; gridState: GridState },
  { rejectValue: string }
>("marketing/fetchArchived", async (p, { rejectWithValue }) => {
  try {
    const body = mapGridStateToDataTablesParams(p.gridState, {
      urlPart: p.urlPart,
      action: "select-archived",
    });
    const { data } = await axiosInstance.post("/adminmarketing", body, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return data;
  } catch (e: any) {
    return rejectWithValue(e.message || "Failed to fetch archived campaigns");
  }
});

/* ─── create ───────────────────────────────────────────────── */
export const createCampaign = createAsyncThunk<
  any, // payload: raw response
  {
    code: string;
    link?: string;
    type?: string;
    placement?: string;
  },
  { rejectValue: string }
>("marketing/create", async (p, { rejectWithValue }) => {
  try {
    const form = new URLSearchParams({
      action: "createCampaign",
      code: p.code,
      link: p.link ?? "",
      type: p.type ?? "",
      placement: p.placement ?? "",
    });
    const { data } = await axiosInstance.post("/adminmarketing", form);
    return data;
  } catch (e: any) {
    return rejectWithValue(e.message || "Failed to create campaign");
  }
});

/* ─── toggle status ────────────────────────────────────────── */
export const toggleCampaignStatus = createAsyncThunk<
  { id: number; enabled: boolean }, // payload: {id,enabled}
  { id: number; enabled: boolean },
  { rejectValue: string }
>("marketing/toggleStatus", async (p, { rejectWithValue }) => {
  try {
    const form = new URLSearchParams({
      action: "toggleCampaign",
      id: String(p.id),
      ...(p.enabled ? { enabled: "1" } : {}),
    });
    await axiosInstance.post("/adminmarketing", form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return p;
  } catch (e: any) {
    return rejectWithValue(e.message || "Failed to toggle campaign status");
  }
});

/* ─── stats ────────────────────────────────────────────────── */
export const fetchCampaignStats = createAsyncThunk<
  any, // payload: raw response
  {
    campaign_id: string; // "12" or "12,15,18"
    from: string; // YYYY-MM-DD
    to: string; // YYYY-MM-DD
    country: string[]; // []
  },
  { rejectValue: string }
>("marketing/fetchStats", async (p, { rejectWithValue }) => {
  try {
    const form = new URLSearchParams({
      action: "getCampaignStats",
      campaign_id: p.campaign_id,
      from: p.from,
      to: p.to,
      country: (p.country ?? []).join(","),
    });
    const { data } = await axiosInstance.post("/adminmarketing", form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return data;
  } catch (e: any) {
    return rejectWithValue(e.message || "Failed to fetch campaign stats");
  }
});

/* ─── save params ──────────────────────────────────────────── */
export const saveCampaignParams = createAsyncThunk<
  any, // payload: raw response
  {
    campaign_id: string;
    link: string;
    script: string;
    enabled: boolean;
  },
  { rejectValue: string }
>("marketing/saveParams", async (p, { rejectWithValue }) => {
  try {
    const form = new URLSearchParams({
      action: "updateCampaign",
      campaign_id: p.campaign_id,
      link: p.link,
      script: p.script,
      status: p.enabled ? "1" : "",
    });
    const { data } = await axiosInstance.post("/adminmarketing", form);
    return data;
  } catch (e: any) {
    return rejectWithValue(e.message || "Failed to save campaign parameters");
  }
});

const slice = createSlice({
  name: "marketing",
  initialState: { ...initial, details: initial.details },
  reducers: {},
  extraReducers: (builder) => {
    const fulfilled = (s: any, a: any) => {
      s.status = "idle";
      const d =
        typeof a.payload.data === "string"
          ? JSON.parse(a.payload.data)
          : a.payload.data;
      Object.assign(s, d); // draw, records*, data
    };

    /* ─── fetchCampaigns ───────────────────────────────────── */
    builder
      .addCase(fetchCampaigns.pending, (s) => {
        s.status = "loading";
        s.error = null;
      })
      .addCase(fetchCampaigns.fulfilled, fulfilled)
      .addCase(fetchCampaigns.rejected, (s, a) => {
        s.status = "failed";
        s.error = a.payload ?? a.error.message ?? "Error";
      });

    /* ─── fetchCampaignsArchived ───────────────────────────── */
    builder
      .addCase(fetchCampaignsArchived.pending, (s) => {
        s.status = "loading";
        s.error = null;
      })
      .addCase(fetchCampaignsArchived.fulfilled, fulfilled)
      .addCase(fetchCampaignsArchived.rejected, (s, a) => {
        s.status = "failed";
        s.error = a.payload ?? a.error.message ?? "Error";
      });

    /* ─── toggleCampaignStatus ─────────────────────────────── */
    builder.addCase(toggleCampaignStatus.fulfilled, (s, a) => {
      // rows are still raw arrays in state.data ― find the one to patch
      const idx = s.data.findIndex((r: any[]) => r[0] === a.payload.id);
      if (idx !== -1) {
        // r[8] was the old html switch → replace with plain bool
        s.data[idx][8] = a.payload.enabled;
      }
    });

    /* ─── createCampaign ───────────────────────────────────── */
    builder
      .addCase(createCampaign.pending, (s) => {
        s.status = "loading";
        s.error = null;
      })
      .addCase(createCampaign.fulfilled, (s, a) => {
        s.status = "idle";
        // backend sends { data:[id,code,…,htmlSwitch] }
        const newRow = Array.isArray(a.payload.data) ? a.payload.data : null;
        if (newRow) {
          s.data.unshift(newRow);
          s.recordsTotal += 1;
          s.recordsFiltered += 1;
        }
      })
      .addCase(createCampaign.rejected, (s, a) => {
        s.status = "failed";
        s.error = a.payload ?? a.error.message ?? "Error";
      });

    /* ─── fetchCampaignStats ───────────────────────────────── */
    builder
      .addCase(fetchCampaignStats.pending, (s) => {
        s.details.status = "loading";
        s.details.error = null;
      })
      .addCase(fetchCampaignStats.fulfilled, (s, a) => {
        s.details.status = "idle";
        s.details.data = a.payload.data;
      })
      .addCase(fetchCampaignStats.rejected, (s, a) => {
        s.details.status = "failed";
        s.details.error = a.payload ?? a.error.message ?? "Error";
      });

    /* ─── saveCampaignParams ──────────────────────────────── */
    builder
      .addCase(saveCampaignParams.pending, (s) => {
        s.details.status = "loading";
        s.details.error = null;
      })
      .addCase(saveCampaignParams.fulfilled, (s) => {
        s.details.status = "idle";
      })
      .addCase(saveCampaignParams.rejected, (s, a) => {
        s.details.status = "failed";
        s.details.error = a.payload ?? a.error.message ?? "Error";
      });
  },
});

export default slice.reducer;
