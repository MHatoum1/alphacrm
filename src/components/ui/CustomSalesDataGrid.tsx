import React, { ReactNode, useMemo } from "react";
import BaseDataGrid, { BaseDataGridProps } from "./BaseDataGrid";
import CustomSalesSearchToolbar from "./CustomSalesSearchToolbar";
import { GridToolbarQuickFilter } from "@mui/x-data-grid";
import { useTranslation } from "react-i18next";

/** Public API = BaseDataGrid minus the Toolbar override, plus headerActions */
export type CustomSalesGridProps = Omit<BaseDataGridProps, "Toolbar"> & {
  /** Actions to render in the grid header (e.g. Assign, Export, Filter) */
  headerActions?: ReactNode;
};

const CustomSalesDataGrid: React.FC<CustomSalesGridProps> = (props) => {
  const { headerActions, rowHeight, gridExtraProps, ...rest } = props;
  const { t } = useTranslation();

  // keep latest headerActions without changing component identity
  const headerRef = React.useRef<React.ReactNode>(null);
  headerRef.current = headerActions;

  const ToolbarWithActions = useMemo(() => {
    const Comp: React.FC<any> = (toolbarProps) => (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          padding: "6px 8px",
          flexWrap: "wrap",
        }}
      >
        {/* Left side = title */}
        <CustomSalesSearchToolbar {...toolbarProps} />

        {/* Right side = search + actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <GridToolbarQuickFilter
    placeholder={t("search")}
    quickFilterParser={(input) =>
      input
        .trim()
        .split(/\s+/)          // ← split by spaces (also works with multiple spaces)
        .filter(Boolean)
    }
  />
          {headerRef.current /* ← never remounts toolbar */}
        </div>
      </div>
    );
    Comp.displayName = "ToolbarWithActions";
    return Comp;
  }, [t]); // ← NOTE: no headerActions here

  return (
    <BaseDataGrid
      {...rest}
      Toolbar={ToolbarWithActions}
      rowHeight={rowHeight ?? 40}
      gridExtraProps={gridExtraProps}
    />
  );
};

export default CustomSalesDataGrid;
