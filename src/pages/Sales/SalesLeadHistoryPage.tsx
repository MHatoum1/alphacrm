// src/pages/SalesLeadHistoryPage.tsx

import { GridColDef } from "@mui/x-data-grid";
import { useTranslation } from "react-i18next";
import EntityNoTabPage from "@/components/ui/EntityNoTabPage";

import {
  fetchHistoryTransactions,
  HistoryRow,
} from "@/redux/slices/salesLeadHistorySlice";
import { RootState } from "@/redux/store";
import { useParams } from "react-router-dom";

/** 1) backend column → index map (not really used by our JSON-API, but required) */
const backendCols: Record<string, number> = {
  date_created: 0,
  type: 1,
  method: 2,
  reference: 3,
  account: 4,
  currency: 5,
  amount: 6,
  status: 7,
};

/** 2) raw → UI row (adds an `id` field) */
const mapRow = (r: HistoryRow, idx: number) => ({
  ...r,
  id: idx, // ← this will now override any `r.id`
});

/** 3) columns factory */
const buildColumns = ({
  isMobile,
}: {
  isMobile: boolean;
  theme: any;
}): GridColDef<ReturnType<typeof mapRow>>[] => {
  if (isMobile) {
    return [
      {
        field: "date_created",
        headerName: "Date",
        flex: 1,
      },
      {
        field: "type",
        headerName: "Type",
        flex: 1,
      },
    ];
  }
  return [
    { field: "date_created", headerName: "Date", width: 140 },
    { field: "type", headerName: "Type", width: 100 },
    { field: "method", headerName: "Method", flex: 1 },
    { field: "reference", headerName: "Reference", flex: 1 },
    { field: "account", headerName: "Account", width: 140 },
    { field: "currency", headerName: "Currency", width: 100 },
    { field: "amount", headerName: "Amount", width: 120 },
    { field: "status", headerName: "Status", width: 120 },
  ];
};

export default function SalesLeadHistoryPage() {
  const { t } = useTranslation();

  const user_id = JSON.parse(localStorage.getItem("user") || "{}")
    ?.userID as string;
  const { id } = useParams<{ id: string }>();
  return (
    <EntityNoTabPage<
      // FetchArg
      {
        client_id: string;
        user_id: string;
        take: number;
        skip: number;
        filterText: string;
        sort: { field: string; dir: "asc" | "desc" };
      },
      // RawRow
      HistoryRow,
      // Row
      ReturnType<typeof mapRow>
    >
      title={t("transaction_history")}
      fetchThunk={fetchHistoryTransactions}
      selectSlice={(s: RootState) => ({
        data: s.salesLeadHistory.rows,
        recordsTotal: s.salesLeadHistory.total,
        status: s.salesLeadHistory.status,
        recordsFiltered: s.salesLeadHistory.total,
      })}
      mapRow={mapRow}
      buildColumns={buildColumns}
      getBackendColumns={() => backendCols}
      buildFetchArg={({ grid }) => {
        const sortItem = grid.sortModel?.[0] ?? {
          field: "date_created",
          sort: "desc",
        };
        return {
          user_id: user_id,
          client_id: id ?? "",
          take: grid.pageSize,
          skip: grid.page * grid.pageSize,
          filterText: grid.filterValue ?? "",
          sort: { field: sortItem.field, dir: sortItem.sort ?? "desc" },
        };
      }}
      initialGrid={{
        page: 0,
        pageSize: 10,
        sortModel: [{ field: "date_created", sort: "desc" }],
        filterValue: "",
        columns: [],
        backendColumns: {},
        draw: 1,
        order: 0,
      }}
    />
  );
}
