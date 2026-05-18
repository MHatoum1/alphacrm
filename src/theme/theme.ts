import { createTheme } from "@mui/material/styles";
import "./theme.d.ts";

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#5E81F4",
    },
    secondary: {
      main: "#9698D6",
      light: "rgba(150, 152, 214, 0.1)",
    },
    error: {
      main: "#FF808B",
      light: "rgba(255, 128, 139, 0.1)",
    },
    warning: {
      main: "#F4BE5E",
      light: "rgba(244, 190, 94, 0.1)",
    },
    info: {
      main: "#5E81F4",
      light: "rgba(94,129,244,0.1)",
    },
    success: {
      main: "#7CE7AC",
      contrastText: "#000", // Black text for better contrast
    },
    background: {
      default: "#F5F5FA",
      paper: "#FBFBFD",
    },
    text: {
      primary: "#1C1D21",
      secondary: "#8181A5",
    },
    // Your custom "status" colors:
    status: {
      true: {
        bg: "rgba(51,204, 51, 0.1)",
        color: "#33CC33",
      },
      false: {
        bg: "rgba(255, 128, 139, 0.1)",
        color: "#FF808B",
      },
      green: {
        bg: "rgba(51,204, 51, 0.1)",
        color: "#33CC33",
      },
      enabled: {
        bg: "rgba(51,204, 51, 0.1)",
        color: "#33CC33",
      },
      limited: {
        bg: "rgba(244, 190, 94, 0.1)",
        color: "#F4BE5E",
      },
      dormant: {
        bg: "rgba(244, 190, 94, 0.1)",
        color: "#F4BE5E",
      },
      unverified: {
        bg: "rgba(255, 128, 139, 0.1)",
        color: "#FF808B",
      },
      unconfirmed: {
        bg: "rgba(255, 128, 139, 0.1)",
        color: "#FF808B",
      },
      confirmed: {
        bg: "rgba(51,204, 51, 0.1)",
        color: "#33CC33",
      },
      completed: {
        bg: "rgba(244, 190, 94, 0.1)",
        color: "#F4BE5E",
      },
      verified: {
        bg: "rgba(94, 129, 244, 0.1)",
        color: "#5E81F4",
      },
      success: {
        bg: "rgba(94, 129, 244, 0.1)",
        color: "#5E81F4",
      },
      approved: {
        bg: "rgba(94, 129, 244, 0.1)",
        color: "#5E81F4",
      },
      pending: {
        bg: "rgba(244, 190, 94, 0.1)",
        color: "#F4BE5E",
      },
      new: {
        bg: "rgba(244, 190, 94, 0.1)",
        color: "#F4BE5E",
      },
      not_processed: {
        bg: "rgba(244, 190, 94, 0.1)",
        color: "#F4BE5E",
      },
      failed: {
        bg: "rgba(255, 128, 139, 0.1)",
        color: "#FF808B",
      },
      declined: {
        bg: "rgba(255, 128, 139, 0.1)",
        color: "#FF808B",
      },
      error: {
        bg: "rgba(255, 128, 139, 0.1)",
        color: "#FF808B",
      },
       disabled: {
     bg: "rgba(255, 128, 139, 0.1)",
        color: "#FF808B",
    },
      gray: {
        bg: "rgba(94, 129, 244, 0.1)",
        color: "#A0A0A0",
      },

      default: {
        bg: "rgba(94, 129, 244, 0.1)",
        color: "#6aa84f",
      },
    },
  },

  typography: {
    fontFamily: "Lato, sans-serif",
    fontSize: 14,
    body1: {
      lineHeight: 1.5,
    },
    h6: {
      fontSize: "20px",
      fontWeight: 700,
    },
    subtitle2: {
      color: "#8181A5",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 700,
          borderRadius: 6,
          // backgroundColor: "#EFF2FE",
          // borderColor: "#EFF2FE",
          color: "#5E81F4",
          "&:hover": {
            backgroundColor: "#d7dffd",
            borderColor: "#d7dffd",
          },
          "&:disabled": {
            backgroundColor: "#F6F6F6",
            borderColor: "#F6F6F6",
            color: "#8181A5",
          },
          "&.MuiButton-contained": {
            backgroundColor: "#5E81F4",
            color: "white",
            "&:hover": {
              backgroundColor: "#5E81F4", // No change on hover when active
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper,
        }),
      },
    },
    // MuiPaper: {
    //   styleOverrides: {
    //     root: {
    //       boxShadow: "none", // Removes shadow
    //     },
    //   },
    // },
    MuiContainer: {
      styleOverrides: {
        root: {
          transition: "padding-left 0.3s",
          paddingLeft: "84px",
          "@media (min-width:1340px)": {
            paddingLeft: "242px",
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          width: "84px",
          transition: "width 0.3s",
          backgroundColor: "#FFFFFF",
          borderRight: "1px solid #F0F0F3",
          "@media (min-width:1340px)": {
            width: "242px",
          },
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#5E81F4",
    },
    background: {
      default: "#1C1D21",
      paper: "#2C2D31",
    },
    secondary: {
      main: "#9698D6",
      light: "rgba(150, 152, 214, 0.1)",
    },
    error: {
      main: "#FF808B",
      light: "rgba(255, 128, 139, 0.1)",
    },

    warning: {
      main: "#F4BE5E",
      light: "rgba(244, 190, 94, 0.1)",
    },
    info: {
      main: "#5E81F4",
      light: "rgba(94,129,244,0.1)",
    },
    success: {
      main: "#7CE7AC",
      contrastText: "#000",
    },
    text: {
      primary: "#FFFFFF",
      secondary: "#A0A0A0",
    },
    status: {
      true: {
        bg: "rgba(51,204, 51, 0.1)",
        color: "#33CC33",
      },
      false: {
        bg: "rgba(255, 128, 139, 0.1)",
        color: "#FF808B",
      },
      green: {
        bg: "rgba(51,204, 51, 0.1)",
        color: "#33CC33",
      },
enabled: {
        bg: "rgba(51,204, 51, 0.1)",
        color: "#33CC33",
      },
      limited: {
        bg: "rgba(244, 190, 94, 0.1)",
        color: "#F4BE5E",
      },
      dormant: {
        bg: "rgba(244, 190, 94, 0.1)",
        color: "#F4BE5E",
      },
      unverified: {
        bg: "rgba(255, 128, 139, 0.1)",
        color: "#FF808B",
      },
      unconfirmed: {
        bg: "rgba(255, 128, 139, 0.1)",
        color: "#FF808B",
      },
      verified: {
        bg: "rgba(94, 129, 244, 0.1)",
        color: "#5E81F4",
      },
      confirmed: {
        bg: "rgba(51,204, 51, 0.1)",
        color: "#33CC33",
      },
      completed: {
        bg: "rgba(244, 190, 94, 0.1)",
        color: "#F4BE5E",
      },
      success: {
        bg: "rgba(94, 129, 244, 0.1)",
        color: "#5E81F4",
      },
      approved: {
        bg: "rgba(94, 129, 244, 0.1)",
        color: "#5E81F4",
      },
      pending: {
        bg: "rgba(244, 190, 94, 0.1)",
        color: "#F4BE5E",
      },
      new: {
        bg: "rgba(244, 190, 94, 0.1)",
        color: "#F4BE5E",
      },
      not_processed: {
        bg: "rgba(244, 190, 94, 0.1)",
        color: "#F4BE5E",
      },
      failed: {
        bg: "rgba(255, 128, 139, 0.1)",
        color: "#FF808B",
      },
      declined: {
        bg: "rgba(255, 128, 139, 0.1)",
        color: "#FF808B",
      },
      error: {
        bg: "rgba(255, 128, 139, 0.1)",
        color: "#FF808B",
      },
       disabled: {
     bg: "rgba(255, 128, 139, 0.1)",
        color: "#FF808B",
    },
      gray: {
        bg: "rgba(94, 129, 244, 0.1)",
        color: "#fbf824",
      },

      default: {
        bg: "rgba(94, 129, 244, 0.1)",
        color: "#5E81F4",
      },
    },
  },
  typography: {
    fontFamily: "Lato, sans-serif",
    fontSize: 14,
    body1: {
      lineHeight: 1.5,
    },
    h6: {
      fontSize: "20px",
      fontWeight: 700,
    },
    subtitle2: {
      color: "#A0A0A0",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 700,
          borderRadius: 6,
          backgroundColor: "#2C2D31",
          color: "#A0A0A0",
          "&:hover": {
            backgroundColor: "#3C3D41",
            color: "#FFFFFF",
          },
          "&:disabled": {
            backgroundColor: "#3C3D41",
            borderColor: "#3C3D41",
            color: "#8181A5",
          },
          "&.MuiButton-contained": {
            backgroundColor: "#5E81F4",
            color: "white",
            "&:hover": {
              backgroundColor: "#5E81F4", // No change on hover when active
            },
          },
        },
      },
    },
    // MuiPaper: {
    //   styleOverrides: {
    //     root: {
    //       boxShadow: "none", // Removes shadow
    //     },
    //   },
    // },
    MuiContainer: {
      styleOverrides: {
        root: {
          transition: "padding-left 0.3s",
          paddingLeft: "84px",
          "@media (min-width:1340px)": {
            paddingLeft: "242px",
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          width: "84px",
          transition: "width 0.3s",
          backgroundColor: "#1C1D21",
          borderRight: "1px solid #2C2D31",
          "@media (min-width:1340px)": {
            width: "242px",
          },
        },
      },
    },
  },
});
