"use client";

import { useState } from "react";
import { Edit3 } from "lucide-react";
import EditBannerDrawer from "./EditBannerDrawer";
import { BannerType } from "@prisma/client";

interface EditSectionButtonProps {
  bannerType: BannerType;
  sectionName: string;
  recommendedSize: string;
  position?: "absolute" | "relative";
  top?: string;
  right?: string;
}

export default function EditSectionButton({ 
  bannerType, 
  sectionName, 
  recommendedSize,
  position = "absolute",
  top = "20px",
  right = "20px"
}: EditSectionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleUpdated = () => {
    window.location.reload();
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: position,
          top: top,
          right: right,
          zIndex: 50,
          background: "rgba(212,175,55,0.9)",
          color: "#1a0a0e",
          border: "none",
          borderRadius: "4px",
          padding: "8px 16px",
          fontSize: "0.85rem",
          fontWeight: 700,
          letterSpacing: "0.05em",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        }}
      >
        <Edit3 size={16} /> Edit {sectionName} Images
      </button>

      <EditBannerDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        bannerType={bannerType}
        sectionName={sectionName}
        recommendedSize={recommendedSize}
        onUpdated={handleUpdated}
      />
    </>
  );
}
