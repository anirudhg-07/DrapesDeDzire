"use client";

import { useState } from "react";
import { Loader, Search, Trash2, ImageOff, CheckCircle } from "lucide-react";
import { scanOrphanImagesAction, deleteOrphanImagesAction, type OrphanScanResult } from "@/actions/admin-media";

function formatBytes(bytes: number): string {
  if (!bytes) return "0 KB";
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default function MediaCleanupClient() {
  const [scan, setScan] = useState<OrphanScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  const runScan = async () => {
    setIsScanning(true);
    setDone(null);
    const res = await scanOrphanImagesAction();
    setScan(res);
    setIsScanning(false);
  };

  const runDelete = async () => {
    if (!scan?.orphans || scan.orphans.length === 0) return;
    if (!confirm(`Permanently delete ${scan.orphans.length} unused image(s) from Cloudinary? This cannot be undone.`)) return;
    setIsDeleting(true);
    const res = await deleteOrphanImagesAction(scan.orphans.map((o) => o.publicId));
    setIsDeleting(false);
    if (res.success) {
      setDone(`Deleted ${res.deleted} unused image(s).`);
      setScan(null);
    } else {
      alert(res.error || "Delete failed.");
    }
  };

  const orphanCount = scan?.orphans?.length ?? 0;

  return (
    <div style={{ maxWidth: "720px" }}>
      <h1 style={{ fontSize: "1.6rem", fontFamily: "var(--font-serif)", color: "#4A0E17", marginBottom: "8px" }}>
        Image Cleanup
      </h1>
      <p style={{ fontSize: "0.9rem", color: "#6b4c3b", lineHeight: 1.7, marginBottom: "24px" }}>
        Finds images on Cloudinary that are no longer used by any product or banner (e.g. photos uploaded
        but never saved) and lets you remove them to free up storage. Images uploaded in the last 24 hours
        are never touched. Always scan first to preview.
      </p>

      <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
        <button onClick={runScan} disabled={isScanning || isDeleting} style={btn(false)}>
          {isScanning ? <Loader size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Search size={16} />}
          {isScanning ? "Scanning…" : "Scan for unused images"}
        </button>

        {orphanCount > 0 && (
          <button onClick={runDelete} disabled={isDeleting || isScanning} style={btn(true)}>
            {isDeleting ? <Loader size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Trash2 size={16} />}
            {isDeleting ? "Deleting…" : `Delete ${orphanCount} unused (${formatBytes(scan?.orphanBytes ?? 0)})`}
          </button>
        )}
      </div>

      {done && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "14px 16px", background: "#f0fff4", border: "1px solid rgba(39,174,96,0.3)", borderRadius: "8px", color: "#1e7e44", fontSize: "0.9rem" }}>
          <CheckCircle size={18} /> {done}
        </div>
      )}

      {scan && !scan.success && (
        <div style={{ padding: "14px 16px", background: "#fff1f1", border: "1px solid rgba(192,57,43,0.25)", borderRadius: "8px", color: "#c0392b", fontSize: "0.9rem" }}>
          ⚠ {scan.error}
        </div>
      )}

      {scan && scan.success && (
        <div>
          {/* Summary cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px", marginBottom: "20px" }}>
            <Stat label="Total on Cloudinary" value={String(scan.totalAssets ?? 0)} />
            <Stat label="In use" value={String(scan.referenced ?? 0)} />
            <Stat label="Unused" value={String(orphanCount)} highlight={orphanCount > 0} />
            <Stat label="Reclaimable" value={formatBytes(scan.orphanBytes ?? 0)} highlight={orphanCount > 0} />
          </div>

          {scan.skippedRecent ? (
            <p style={{ fontSize: "0.8rem", color: "#9a7a50", marginBottom: "16px" }}>
              {scan.skippedRecent} recently-uploaded image(s) were skipped for safety (under 24h old).
            </p>
          ) : null}

          {orphanCount === 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "20px", background: "#fff", border: "1px solid rgba(74,14,23,0.1)", borderRadius: "8px", color: "#6b4c3b" }}>
              <CheckCircle size={20} style={{ color: "#27ae60" }} /> No unused images — your storage is clean.
            </div>
          ) : (
            <div style={{ border: "1px solid rgba(74,14,23,0.1)", borderRadius: "8px", overflow: "hidden", background: "#fff" }}>
              <div style={{ padding: "10px 14px", borderBottom: "1px solid rgba(74,14,23,0.08)", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#6b4c3b", display: "flex", alignItems: "center", gap: "8px" }}>
                <ImageOff size={14} /> Unused images
              </div>
              <div style={{ maxHeight: "320px", overflowY: "auto" }}>
                {scan.orphans!.map((o) => (
                  <div key={o.publicId} style={{ display: "flex", justifyContent: "space-between", gap: "12px", padding: "10px 14px", borderBottom: "1px solid rgba(74,14,23,0.05)", fontSize: "0.82rem" }}>
                    <span style={{ color: "#1a0a0e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.publicId}</span>
                    <span style={{ color: "#9a7a50", flexShrink: 0 }}>{formatBytes(o.bytes)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ padding: "14px 16px", background: highlight ? "rgba(212,175,55,0.1)" : "#fff", border: `1px solid ${highlight ? "rgba(212,175,55,0.4)" : "rgba(74,14,23,0.1)"}`, borderRadius: "8px" }}>
      <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#4A0E17", fontFamily: "var(--font-serif)" }}>{value}</div>
      <div style={{ fontSize: "0.72rem", color: "#6b4c3b", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: "2px" }}>{label}</div>
    </div>
  );
}

const btn = (danger: boolean): React.CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "10px 18px",
  borderRadius: "6px",
  border: "none",
  cursor: "pointer",
  fontSize: "0.85rem",
  fontWeight: 600,
  fontFamily: "inherit",
  color: "#FCFBF7",
  background: danger ? "linear-gradient(135deg, #b1342a, #c0392b)" : "linear-gradient(135deg, #4A0E17, #6d1422)",
});
