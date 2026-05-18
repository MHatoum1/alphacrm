// src/components/Admin/DocumentsGallery.tsx
import { ImageList, ImageListItem } from "@mui/material";
import { FileRecord } from "@/utils/commonData";

export default function DocumentsGallery({ files }: { files: FileRecord[] }) {
  return (
    <ImageList cols={2} rowHeight={140}>
      {files.map((f) => (
        <ImageListItem key={f.file_name}>
          <img
            src={`/document/preview/${f.file_name}`}
            alt={f.file_name}
            loading="lazy"
          />
        </ImageListItem>
      ))}
    </ImageList>
  );
}
