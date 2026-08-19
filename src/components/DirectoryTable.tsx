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

interface DirectoryTableProps {
  entries: DirectoryEntry[];
}

export function DirectoryTable({ entries }: DirectoryTableProps) {
  const getAgencyTypeLabel = (type: string) => {
    switch (type) {
      case "county-sheriff":
        return "County Sheriff";
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
        return "Agency";
    }
  };

  return (
    <div
      className="directory-table-wrap"
      style={{
        width: "100%",
        overflowX: "auto",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border-card)",
        background: "var(--bg-secondary)",
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          textAlign: "left",
          fontSize: "0.875rem",
        }}
      >
        <thead>
          <tr
            style={{
              background: "rgba(16, 28, 48, 0.9)",
              borderBottom: "1px solid var(--border-card)",
              color: "#94a3b8",
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            <th style={{ padding: "14px 18px", fontWeight: 600 }}>Jurisdiction / Name</th>
            <th style={{ padding: "14px 18px", fontWeight: 600 }}>State</th>
            <th style={{ padding: "14px 18px", fontWeight: 600 }}>Agency Type</th>
            <th style={{ padding: "14px 18px", fontWeight: 600 }}>Report Status</th>
            <th style={{ padding: "14px 18px", fontWeight: 600, textAlign: "right" }}>
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const isVerified = entry.status === "verified" && Boolean(entry.portalUrl);

            return (
              <tr
                key={entry.id}
                className={
                  isVerified
                    ? "table-row table-row-verified"
                    : "table-row table-row-unverified"
                }
              >
                <td style={{ padding: "14px 18px" }}>
                  <div style={{ fontWeight: 600, color: isVerified ? "#ffffff" : "var(--text-unverified)" }}>
                    {entry.name}
                  </div>
                  {entry.portalSlug && (
                    <div
                      style={{
                        fontSize: "0.75rem",
                        fontFamily: "var(--font-mono)",
                        color: "#64748b",
                        marginTop: "2px",
                      }}
                    >
                      /{entry.portalSlug}
                    </div>
                  )}
                </td>

                <td style={{ padding: "14px 18px", whiteSpace: "nowrap" }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      background: "rgba(255, 255, 255, 0.06)",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      color: "#cbd5e1",
                      marginRight: "6px",
                    }}
                  >
                    {entry.stateCode}
                  </span>
                  <span style={{ color: "#94a3b8" }}>{entry.stateName}</span>
                </td>

                <td style={{ padding: "14px 18px", color: "#94a3b8", whiteSpace: "nowrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    {entry.category === "county" ? (
                      <MapPin size={13} color="#38bdf8" />
                    ) : (
                      <Building2 size={13} color="#a855f7" />
                    )}
                    <span>{getAgencyTypeLabel(entry.agencyType)}</span>
                  </div>
                </td>

                <td style={{ padding: "14px 18px", whiteSpace: "nowrap" }}>
                  {isVerified ? (
                    <span className="badge badge-verified" style={{ fontSize: "0.6875rem" }}>
                      <ShieldCheck size={12} />
                      Verified
                    </span>
                  ) : (
                    <span className="badge badge-unverified" style={{ fontSize: "0.6875rem" }}>
                      <AlertCircle size={12} />
                      No Verified Report Found
                    </span>
                  )}
                </td>

                <td style={{ padding: "14px 18px", textAlign: "right", whiteSpace: "nowrap" }}>
                  {isVerified && entry.portalUrl ? (
                    <a
                      href={`/api/portal-redirect?url=${encodeURIComponent(entry.portalUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary"
                      style={{
                        padding: "6px 12px",
                        fontSize: "0.75rem",
                        color: "var(--accent-green)",
                        borderColor: "rgba(34, 197, 94, 0.3)",
                      }}
                    >
                      <span>View Report</span>
                      <ExternalLink size={12} />
                    </a>
                  ) : (
                    <Link
                      href={`/county/${entry.fips}`}
                      className="county-contact-link"
                      style={{
                        fontSize: "0.75rem",
                        color: "#64748b",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <ArrowRight size={12} />
                      Contact representatives
                    </Link>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
