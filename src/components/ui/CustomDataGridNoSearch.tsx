import React from "react";
import BaseDataGrid, { BaseDataGridProps } from "./BaseDataGrid";

/** Same idea – forbid external Toolbar overrides */
export type NoSearchGridProps = Omit<BaseDataGridProps, "Toolbar">;

const CustomDataGridNoSearch: React.FC<NoSearchGridProps> = (props) => (
  <BaseDataGrid
    {...props}
    Toolbar={undefined} // ⇢ no toolbar / search box
    autoHeight={props.autoHeight}
    getRowHeight={props.getRowHeight}
  />
);

export default CustomDataGridNoSearch;
