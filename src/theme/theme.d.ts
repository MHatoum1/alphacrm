import "@mui/material/styles";

declare module "@mui/material/styles" {
  interface StatusColor {
    bg: string;
    color: string;
  }

  interface StatusPalette {
    limited: StatusColor;
    dormant: StatusColor;
    unverified: StatusColor;
    verified: StatusColor;
    success: StatusColor;
    warning: StatusColor;
    pending: StatusColor;
    new: StatusColor;
    not_processed: StatusColor;
    failed: StatusColor;
    declined: StatusColor;
    error: StatusColor;
    default: StatusColor;
    confirmed: StatusColor;
    completed: StatusColor;
    unconfirmed: StatusColor;
    true: StatusColor;
    false: StatusColor;
    green: StatusColor;
    approved: StatusColor;
  }

  interface Palette {
    status: StatusPalette;
  }

  interface PaletteOptions {
    status?: Partial<StatusPalette>;
  }
}
