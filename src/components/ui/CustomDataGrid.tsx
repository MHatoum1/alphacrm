import React from "react";
import BaseDataGrid, { BaseDataGridProps } from "./BaseDataGrid";
import CustomSearchToolbar from "./CustomSearchToolbar";

export type CustomGridProps = Omit<BaseDataGridProps, "Toolbar">;

const CustomDataGrid: React.FC<CustomGridProps> = (props) => (
  <BaseDataGrid {...props} Toolbar={CustomSearchToolbar} />
);

export default CustomDataGrid;
