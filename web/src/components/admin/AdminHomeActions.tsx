"use client";

import { useState } from "react";
import { PlusCircle } from "lucide-react";
import AddSareeDrawer from "./AddSareeDrawer";

export default function AdminHomeActions() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [category, setCategory] = useState<string>("Saree");

  const openDrawer = (cat: string) => {
    setCategory(cat);
    setDrawerOpen(true);
  };

  return (
    <>
      <div style={{
        backgroundColor: "var(--color-cream)",
        borderBottom: "1px solid rgba(212,175,55,0.4)",
        padding: "1rem 0",
      }}>
        <div className="section-container" style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--color-maroon)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Admin Shortcuts:
          </span>
          <button 
            onClick={() => openDrawer("Saree")} 
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", fontSize: "0.8rem", border: "1px solid var(--color-maroon)", background: "transparent", color: "var(--color-maroon)", borderRadius: "2px", cursor: "pointer", fontWeight: 600 }}
          >
            <PlusCircle size={16} /> Add Saree
          </button>
          <button 
            onClick={() => openDrawer("Kurta Set")} 
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", fontSize: "0.8rem", border: "1px solid var(--color-maroon)", background: "transparent", color: "var(--color-maroon)", borderRadius: "2px", cursor: "pointer", fontWeight: 600 }}
          >
            <PlusCircle size={16} /> Add Kurta Set
          </button>
          <button 
            onClick={() => openDrawer("Jewellery")} 
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", fontSize: "0.8rem", border: "1px solid var(--color-maroon)", background: "transparent", color: "var(--color-maroon)", borderRadius: "2px", cursor: "pointer", fontWeight: 600 }}
          >
            <PlusCircle size={16} /> Add Jewellery
          </button>
        </div>
      </div>

      <AddSareeDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onCreated={() => window.location.reload()}
        defaultCategory={category}
      />
    </>
  );
}
