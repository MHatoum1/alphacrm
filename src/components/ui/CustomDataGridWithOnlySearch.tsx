import React from "react";
import BaseDataGrid, { BaseDataGridProps } from "./BaseDataGrid";
import CustomOnlySearchToolbar from "./CustomOnlySearchToolbar";

export type CustomGridProps = Omit<BaseDataGridProps, "Toolbar">;

const CustomDataGridWithOnlySearch: React.FC<CustomGridProps> = (props) => (
  <BaseDataGrid {...props} Toolbar={CustomOnlySearchToolbar} />
);

export default CustomDataGridWithOnlySearch;
