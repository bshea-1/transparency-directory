import React from "react";
import Link from "next/link";
import {
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  MapPin,
  Building2,
  ArrowRight,
} from "lucide-react";
import { DirectoryEntry } from "../lib/types";

interface DirectoryCardProps {
  entry: DirectoryEntry;
}

export function DirectoryCard({ entry }: DirectoryCardProps) {
  const isVerified = entry.status === "verified" && Boolean(entry.portalUrl);

  const getAgencyTypeLabel = (type: string) => {
    switch (type) {
      case "county-sheriff":
        return "County Sheriff's Office";
      case "county-police":
        return "County Police";
      case "municipal-police":
        return "Municipal Police";
      case "university-police":
        return "Campus Police";
      case "tribal-police":
        return "Tribal Police";
      case "special-district":
        return "Special District";
      case "state-agency":
        return "State Agency";
      default:
        return entry.category === "county" ? "County Agency" : "Local Agency";
    }
  };

  if (isVerified && entry.portalUrl) {
    return (
      <a
        href={`/api/portal-redirect?url=${encodeURIComponent(entry.portalUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="glass-panel directory-card card-verified"
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "20px",
          borderRadius: "var(--radius-md)",
          textDecoration: "none",
          color: "inherit",
          position: "relative",
          cursor: "pointer",
          minHeight: "180px",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "28px",
                  height: "24px",
                  borderRadius: "var(--radius-sm)",
                  background: "rgba(56, 189, 248, 0.15)",
                  color: "#38bdf8",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  border: "1px solid rgba(56, 189, 248, 0.3)",
                }}
              >
                {entry.stateCode}
              </span>
              <span style={{ fontSize: "0.8125rem", color: "#94a3b8", fontWeight: 500 }}>
                {entry.stateName}
              </span>
            </div>

            <span className="badge badge-verified">
              <ShieldCheck size={12} />
              Verified Report
            </span>
          </div>

          <h3
            style={{
              fontSize: "1.125rem",
              fontWeight: 700,
              color: "#ffffff",
              marginBottom: "6px",
              lineHeight: 1.3,
            }}
          >
            {entry.name}
          </h3>

          <div
            style={{
              fontSize: "0.8125rem",
              color: "#94a3b8",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginBottom: "12px",
            }}
          >
            {entry.category === "county" ? (
              <MapPin size={13} color="#38bdf8" />
            ) : (
              <Building2 size={13} color="#a855f7" />
            )}
            <span>{getAgencyTypeLabel(entry.agencyType)}</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "14px",
            borderTop: "1px solid rgba(255, 255, 255, 0.06)",
            marginTop: "8px",
          }}
        >
          <span
            style={{
              fontSize: "0.75rem",
              fontFamily: "var(--font-mono)",
              color: "#64748b",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "180px",
            }}
          >
            /{entry.portalSlug}
          </span>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: "var(--accent-green)",
            }}
          >
            <span>Open Report</span>
            <ExternalLink size={14} />
          </div>
        </div>
      </a>
    );
  }

  return (
    <Link
      href={`/county/${entry.fips}`}
      className="glass-panel directory-card card-unverified"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "20px",
        borderRadius: "var(--radius-md)",
        color: "inherit",
        textDecoration: "none",
        position: "relative",
        minHeight: "180px",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
      }}
    >
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "28px",
                height: "24px",
                borderRadius: "var(--radius-sm)",
                background: "rgba(239, 68, 68, 0.15)",
                color: "#f87171",
                fontSize: "0.75rem",
                fontWeight: 700,
                border: "1px solid rgba(239, 68, 68, 0.3)",
              }}
            >
              {entry.stateCode}
            </span>
            <span style={{ fontSize: "0.8125rem", color: "#94a3b8", fontWeight: 500 }}>
              {entry.stateName}
            </span>
          </div>

          <span className="badge badge-unverified">
            <AlertCircle size={12} />
            Unavailable
          </span>
        </div>

        <h3
          style={{
            fontSize: "1.125rem",
            fontWeight: 700,
            color: "var(--text-unverified)",
            marginBottom: "6px",
            lineHeight: 1.3,
          }}
        >
          {entry.name}
        </h3>

        <div
          style={{
            fontSize: "0.8125rem",
            color: "#64748b",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "12px",
          }}
        >
          <MapPin size={13} color="#94a3b8" />
          <span>{getAgencyTypeLabel(entry.agencyType)}</span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: "14px",
          borderTop: "1px solid rgba(239, 68, 68, 0.15)",
          marginTop: "8px",
        }}
      >
        <span
          style={{
            fontSize: "0.75rem",
            color: "#f87171",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <ArrowRight size={12} color="#f87171" />
          Contact your representatives
        </span>

        <span
          style={{
            fontSize: "0.6875rem",
            color: "#64748b",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          FIPS {entry.fips}
        </span>
      </div>
    </Link>
  );
}
