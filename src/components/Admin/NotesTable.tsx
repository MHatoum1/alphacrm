// src/components/Admin/NotesTable.tsx
import {
  Box,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Note } from "@/utils/commonData";
import { useTranslation } from "react-i18next";
import { useTheme, useMediaQuery } from "@mui/material";

export default function NotesTable({
  notes,
  onEditNote,
  onDeleteNote,
}: {
  notes: Note[];
  onEditNote: (note: Note) => void;
  onDeleteNote: (id: number) => void;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));

  // Shared SX to avoid breaking inside words on mobile
  const wrapCleanly = {
    whiteSpace: "pre-wrap",            // respect newlines while allowing wrap
    wordBreak: { xs: "keep-all", sm: "normal" }, // don't split words on XS
    overflowWrap: "break-word",        // but allow breaking *between* words if needed
    hyphens: "auto" as const,          // hyphenate long words when possible
  };

  return (
    <TableContainer
      component={Box}
      sx={{
        width: "100%",
        boxSizing: "border-box",
        overflowX: "auto",
      }}
    >
      <Table
        size="small"
        sx={{
          minWidth: 0,
          width: "100%",
          // Fixed layout on XS gives more predictable wrapping
          tableLayout: { xs: "fixed", sm: "auto" },
        }}
      >
        {/* Optional: guide widths so the note cell gets space on mobile */}
        <colgroup>
          <col style={{ width: isSm ? "24%" : "auto" }} />
          <col style={{ width: isSm ? "52%" : "auto" }} />
          {!isSm && <col />}
          <col style={{ width: isSm ? "24%" : "auto" }} />
          {!isSm && <col />}
          <col style={{ width: 48 }} />
          <col style={{ width: 48 }} />
        </colgroup>

        <TableHead>
          <TableRow>
            <TableCell>{t("type")}</TableCell>
            <TableCell>{t("note")}</TableCell>
            <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
              {t("future_date")}
            </TableCell>
            <TableCell>{t("creator")}</TableCell>
            <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
              {t("created")}
            </TableCell>
            <TableCell align="center">{t("edit")}</TableCell>
            <TableCell align="center">{t("delete")}</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {notes.map((n) => (
            <TableRow key={n.id}>
              <TableCell>{n.sub_type}</TableCell>
              <TableCell sx={wrapCleanly}>{n.message}</TableCell>
              {!isSm && <TableCell>{n.future_date}</TableCell>}
              <TableCell>{n.owner_name}</TableCell>
              {!isSm && <TableCell>{n.created}</TableCell>}
              <TableCell align="center">
                <IconButton size="small" onClick={() => onEditNote(n)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </TableCell>
              <TableCell align="center">
                <IconButton size="small" onClick={() => onDeleteNote(n.id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
