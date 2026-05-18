// src\components\ui\CustomTabSwitcher.tsx
import React from "react";
import { Box, Button } from "@mui/material";

// Define tab options to ensure type safety
type TabOptions = any;

interface CustomTabSwitcherProps {
  tabs: { key: TabOptions; label: string; iconClass: string }[];
  activeTab: TabOptions;
  onTabChange: (tab: TabOptions) => void;
}

const CustomTabSwitcher: React.FC<CustomTabSwitcherProps> = ({
  tabs,
  activeTab,
  onTabChange,
}) => {
  return (
    <Box>
      {tabs.map((tab) => (
        <Button
          key={tab.key}
          variant={activeTab === tab.key ? "contained" : "outlined"}
          startIcon={
            <i className={`la ${tab.iconClass}`} style={{ fontSize: 20 }} />
          }
          onClick={() => onTabChange(tab.key)} // ✅ Ensures type safety
          sx={{
            textTransform: "none",
            mr: 1,
            minWidth: "70px",
            ...(activeTab === tab.key
              ? { backgroundColor: "#5E81F4", color: "white" }
              : { backgroundColor: "rgb(239, 242, 254)",border: "none",  color: "#5E81F4" }),
          }}
        >
          {tab.label}
        </Button>
      ))}
    </Box>
  );
};

export default CustomTabSwitcher;
