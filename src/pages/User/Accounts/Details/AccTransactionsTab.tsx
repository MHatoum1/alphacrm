// src/pages/User/Accounts/Details/AccTransactionsTab.tsx
import { DataGrid } from "@mui/x-data-grid";
import { useParams } from "react-router-dom";
import { fetchAccTransactions } from "@/redux/slices/accountDetailSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function AccTransactionsTab() {
  const { uid = "" } = useParams<"uid">();
  const { t } = useTranslation();

  const dispatch = useAppDispatch();
  const rows = useAppSelector((s) => s.accountDetails.transactions ?? []);
  const loading =
    useAppSelector((s) => s.accountDetails.statusTx) === "loading";

  useEffect(() => {
    dispatch(fetchAccTransactions(uid));
  }, [uid, dispatch]);

  return (
    <DataGrid
      autoHeight
      loading={loading}
      rows={rows}
      columns={[
        { field: "date_created", headerName: t("date"), flex: 1 },
        { field: "type", headerName: t("type"), flex: 1 },
        { field: "amount", headerName: t("amount"), flex: 1 },
        { field: "currency", headerName: t("currency"), flex: 1 },
        { field: "method", headerName: t("method"), flex: 1 },
        { field: "status", headerName: t("status"), flex: 1 },
      ]}
      getRowId={(r) => r.id || r.order || r.date_created}
      disableRowSelectionOnClick
      density="compact"
    />
  );
}
