//  src/pages/User/Accounts/Details/AccOpenTradesTab.tsx
import { DataGrid } from "@mui/x-data-grid";
import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchAccOpenTrades } from "@/redux/slices/accountDetailSlice";
import { useTranslation } from "react-i18next";

export default function AccOpenTradesTab() {
  const { uid = "" } = useParams<"uid">();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  /* rows + loader ------------------------------------------------ */
  const rows = useAppSelector((s) => s.accountDetails.openTrades);
  const loading =
    useAppSelector((s) => s.accountDetails.statusOT) === "loading";

  /* load once per uid ------------------------------------------- */
  useEffect(() => {
    dispatch(fetchAccOpenTrades(uid));
  }, [uid, dispatch]);

  return (
    <DataGrid
      autoHeight
      rows={rows}
      loading={loading}
      /* field names match the API keys exactly */
      columns={[
        { field: "Order", headerName: t("order"), flex: 1 },
        { field: "OpenTime", headerName: t("open_time"), flex: 1 },
        { field: "Cmd", headerName: t("type"), flex: 1 },
        { field: "Volume", headerName: t("size"), flex: 1 },
        { field: "Symbol", headerName: t("symbol"), flex: 1 },
        { field: "OpenPrice", headerName: t("open_price"), flex: 1 },
        { field: "ClosePrice", headerName: t("close_price"), flex: 1 },
        { field: "Profit", headerName: t("profit"), flex: 1 },
      ]}
      getRowId={(r) => r.Order}
      disableRowSelectionOnClick
      density="compact"
    />
  );
}
