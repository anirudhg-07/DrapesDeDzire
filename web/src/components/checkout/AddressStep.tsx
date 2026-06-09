"use client";
// src/components/checkout/AddressStep.tsx
// Step 1: Shipping address form with Zod validation

import React, { useState } from "react";
import { AddressSchema, type AddressInput, INDIAN_STATES } from "@/types/checkout";

interface AddressStepProps {
  onNext: (address: AddressInput) => void;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  border: "1px solid rgba(74,14,23,0.2)",
  borderRadius: "3px",
  background: "#fff",
  fontSize: "0.95rem",
  fontFamily: "inherit",
  color: "#1a0a0e",
  outline: "none",
  transition: "border-color 0.2s",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.75rem",
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#6b4c3b",
  marginBottom: "6px",
};

const errorStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  color: "#c0392b",
  marginTop: "4px",
};

export default function AddressStep({ onNext }: AddressStepProps) {
  const [form, setForm] = useState<Record<string, string>>({
    fullName: "",
    phone: "",
    alternatePhone: "",
    line1: "",
    line2: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = AddressSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as string] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }
    onNext(result.data);
  };

  const renderField = ({
    name,
    label,
    required,
    type = "text",
    placeholder,
    half,
  }: {
    name: string;
    label: string;
    required?: boolean;
    type?: string;
    placeholder?: string;
    half?: boolean;
  }) => (
    <div key={name} style={{ gridColumn: half ? "span 1" : "span 2" }}>
      <label htmlFor={`addr-${name}`} style={labelStyle}>
        {label} {required && <span style={{ color: "#c0392b" }}>*</span>}
      </label>
      <input
        id={`addr-${name}`}
        type={type}
        value={form[name] || ""}
        onChange={(e) => handleChange(name, e.target.value)}
        placeholder={placeholder}
        style={{
          ...inputStyle,
          borderColor: errors[name] ? "#c0392b" : "rgba(74,14,23,0.2)",
        }}
        onFocus={(e) => (e.target.style.borderColor = "#D4AF37")}
        onBlur={(e) =>
          (e.target.style.borderColor = errors[name] ? "#c0392b" : "rgba(74,14,23,0.2)")
        }
      />
      {errors[name] && <p style={errorStyle}>{errors[name]}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h2
        style={{
          fontFamily: "'Cormorant Garamond', 'Playfair Display', serif",
          fontSize: "1.6rem",
          fontWeight: 500,
          color: "#1a0a0e",
          margin: "0 0 6px",
        }}
      >
        Delivery Address
      </h2>
      <p style={{ fontSize: "0.85rem", color: "#9a7a50", margin: "0 0 32px" }}>
        Where shall we deliver your saree?
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
        }}
      >
        {renderField({ name: "fullName", label: "Full Name", required: true, placeholder: "e.g. Priya Sharma" })}
        {renderField({
          name: "phone",
          label: "Mobile Number",
          required: true,
          type: "tel",
          placeholder: "10-digit number",
          half: true,
        })}
        {renderField({
          name: "alternatePhone",
          label: "Alternate Phone",
          type: "tel",
          placeholder: "Optional",
          half: true,
        })}
        {renderField({ name: "line1", label: "Address Line 1", required: true, placeholder: "House no., Building, Street" })}
        {renderField({ name: "line2", label: "Address Line 2", placeholder: "Area, Colony (optional)" })}
        {renderField({ name: "landmark", label: "Landmark", placeholder: "Near a landmark (optional)" })}
        {renderField({ name: "city", label: "City", required: true, placeholder: "e.g. Chennai", half: true })}
        <div>
          <label htmlFor="addr-state" style={labelStyle}>
            State <span style={{ color: "#c0392b" }}>*</span>
          </label>
          <select
            id="addr-state"
            value={form.state}
            onChange={(e) => handleChange("state", e.target.value)}
            style={{
              ...inputStyle,
              borderColor: errors.state ? "#c0392b" : "rgba(74,14,23,0.2)",
              cursor: "pointer",
            }}
          >
            <option value="">Select state</option>
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {errors.state && <p style={errorStyle}>{errors.state}</p>}
        </div>
        {renderField({
          name: "pincode",
          label: "PIN Code",
          required: true,
          placeholder: "6-digit PIN",
          half: true,
        })}
      </div>

      <button
        type="submit"
        style={{
          marginTop: "32px",
          width: "100%",
          padding: "16px",
          background: "linear-gradient(135deg, #4A0E17, #6d1422)",
          color: "#FCFBF7",
          border: "none",
          borderRadius: "3px",
          cursor: "pointer",
          fontSize: "0.9rem",
          fontWeight: 600,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          fontFamily: "inherit",
          transition: "opacity 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
      >
        Continue to Review Order →
      </button>
    </form>
  );
}
