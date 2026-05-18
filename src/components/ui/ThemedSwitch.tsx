import { Switch, SwitchProps } from "@mui/material";
import { styled } from "@mui/material/styles";

const ThemedSwitch = styled((props: SwitchProps) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 44,
  height: 24,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 2,
    transitionDuration: "150ms",
    "&.Mui-checked": {
      transform: "translateX(20px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: theme.palette.primary.main,
        opacity: 1,
      },
    },
  },
  "& .MuiSwitch-thumb": { width: 20, height: 20, boxShadow: "none" },
  "& .MuiSwitch-track": {
    borderRadius: 24 / 2,
    backgroundColor: theme.palette.action.disabledBackground,
    opacity: 1,
  },
}));

export default ThemedSwitch;
