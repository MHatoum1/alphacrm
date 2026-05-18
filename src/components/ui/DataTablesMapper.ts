// src/utils/dataTablesMapper.ts
import { GridColDef } from "@mui/x-data-grid";

export interface GridState {
  page: number; // zero-indexed page number
  pageSize: number;
  sortModel?: { field: string; sort: "asc" | "desc" }[];
  filterValue?: string;
  columns: GridColDef[];
  backendColumns: Record<string, number>;
  draw?: number;
  order?: number;
}

export interface DataTablesOptions {
  urlPart?: string;
  campaign?: string;
  /** if you don’t pass this, it’ll default to `"select"` */
  action?: string;
  user_id?: string;
}

export const mapGridStateToDataTablesParams = (
  gridState: GridState,
  options: DataTablesOptions
): URLSearchParams => {
  const {
    urlPart = "",
    campaign = "",
    action = "select",
    user_id = "",
  } = options;
  const params = new URLSearchParams();

  // Basic fields
  params.append("action", action);
  params.append("url_part", urlPart);
  params.append("campaign", campaign);
  params.append("user_id", user_id);

  // Append user_id from localStorage (assuming user is stored as JSON)
  const storedUser = localStorage.getItem("user") || "";
  const user = storedUser ? JSON.parse(storedUser) : null;
  if (!user || !user.uid) {
    throw new Error("User not found in localStorage");
  }

  var admin_id= user.uid;
  if (user.acl=="sales") {
   admin_id = user.userID;
  }
  params.append("admin_id", admin_id);

  // Use provided draw or default to 1
  params.append("draw", (gridState.draw ?? 1).toString());

  // Calculate start and length based on pagination
  params.append("start", (gridState.page * gridState.pageSize).toString());
  params.append("length", gridState.pageSize.toString());

  // Search parameters (using a quick filter value)
  params.append("search[value]", gridState.filterValue || "");
  params.append("search[regex]", "false");

  // Build the columns array dynamically from your grid columns
  gridState.columns.forEach((col, index) => {
    params.append(`columns[${index}][data]`, col.field);
    params.append(`columns[${index}][name]`, col.headerName || "");
    // You can adjust these as needed
    params.append(`columns[${index}][searchable]`, "true");
    params.append(`columns[${index}][orderable]`, "true");
    params.append(`columns[${index}][search][value]`, "");
    params.append(`columns[${index}][search][regex]`, "false");
  });

  // Order: If you have a sort model, find the index of the sorted column in your columns array.
  if (gridState.sortModel && gridState.sortModel.length > 0) {
    const sort = gridState.sortModel[0];
    const colIndex = gridState.backendColumns[sort.field];
    params.append(
      "order[0][column]",
      colIndex !== undefined ? colIndex.toString() : "0"
    );
    params.append("order[0][dir]", sort.sort);
  } else {
    // Optionally, you can set a default order if none is provided
    params.append("order[0][column]", gridState.order?.toString() || "0");
    params.append("order[0][dir]", "desc");
  }

  return params;
};
