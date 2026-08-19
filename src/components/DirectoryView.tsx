"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  X,
  LayoutGrid,
  List,
  ShieldCheck,
  AlertCircle,
  MapPin,
  Building2,
  RotateCcw,
} from "lucide-react";
import { DirectoryEntry, DirectoryFilterParams } from "../lib/types";
import { filterDirectoryEntries, DEFAULT_PAGE_SIZE } from "../lib/filter";
import { DirectoryCard } from "./DirectoryCard";
import { DirectoryTable } from "./DirectoryTable";
import { Pagination } from "./Pagination";
import { StateFilter } from "./StateFilter";
import { StatusLegend } from "./StatusLegend";
import { RevealWords } from "./RevealWords";
import { ZipLookupBox } from "./ZipLookupBox";

interface DirectoryViewProps {
  initialEntries: DirectoryEntry[];
}

const DIRECTORY_STATE_KEY = "flock-transparency-directory-state";

interface SavedDirectoryState {
  searchQuery?: string;
  selectedState?: string;
  statusFilter?: "all" | "verified" | "unverified";
  categoryFilter?: "all" | "county" | "agency";
  currentPage?: number;
  viewMode?: "grid" | "table";
}

export function DirectoryView({ initialEntries }: DirectoryViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<"all" | "verified" | "unverified">("all");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "county" | "agency">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [hasRestoredDirectoryState, setHasRestoredDirectoryState] = useState(false);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(DIRECTORY_STATE_KEY);
      if (!saved) return;

      const state = JSON.parse(saved) as SavedDirectoryState;
      if (typeof state.searchQuery === "string") setSearchQuery(state.searchQuery);
      if (typeof state.selectedState === "string") setSelectedState(state.selectedState);
      if (state.statusFilter) setStatusFilter(state.statusFilter);
      if (state.categoryFilter) setCategoryFilter(state.categoryFilter);
      if (typeof state.currentPage === "number" && state.currentPage > 0) setCurrentPage(state.currentPage);
      if (state.viewMode) setViewMode(state.viewMode);
    } catch {
    } finally {
      setHasRestoredDirectoryState(true);
    }
  }, []);

  useEffect(() => {
    if (!hasRestoredDirectoryState) return;

    const state: SavedDirectoryState = {
      searchQuery,
      selectedState,
      statusFilter,
      categoryFilter,
      currentPage,
      viewMode,
    };
    sessionStorage.setItem(DIRECTORY_STATE_KEY, JSON.stringify(state));
  }, [categoryFilter, currentPage, hasRestoredDirectoryState, searchQuery, selectedState, statusFilter, viewMode]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleStateChange = (stateCode: string) => {
    setSelectedState(stateCode);
    setCurrentPage(1);
  };

  const handleStatusChange = (status: "all" | "verified" | "unverified") => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category: "all" | "county" | "agency") => {
    setCategoryFilter(category);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedState("ALL");
    setStatusFilter("all");
    setCategoryFilter("all");
    setCurrentPage(1);
  };

  const result = useMemo(() => {
    const params: DirectoryFilterParams = {
      searchQuery,
      state: selectedState,
      status: statusFilter,
      category: categoryFilter,
      page: currentPage,
      pageSize: DEFAULT_PAGE_SIZE,
    };
    return filterDirectoryEntries(initialEntries, params);
  }, [initialEntries, searchQuery, selectedState, statusFilter, categoryFilter, currentPage]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedState !== "ALL" ||
    statusFilter !== "all" ||
    categoryFilter !== "all";

  return (
    <div id="directory-search-section" className="directory-section">
      <div className="container">
        <div className="directory-heading">
          <p>Nationwide directory</p>
          <h2 className="flock-title"><RevealWords>Find your jurisdiction</RevealWords></h2>
        </div>

        <ZipLookupBox
          onSelectCounty={(county, state) => {
            setSearchQuery(county);
            setSelectedState(state);
          }}
        />

        <StatusLegend />

        <div
          className="glass-panel directory-controls"
          style={{
            borderRadius: "var(--radius-lg)",
            padding: "24px",
            marginBottom: "32px",
            background: "rgba(10, 18, 32, 0.8)",
            border: "1px solid var(--border-card)",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.5)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "16px",
              alignItems: "flex-end",
              marginBottom: "20px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label
                htmlFor="directory-search-input"
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Search Directory
              </label>
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#64748b",
                    pointerEvents: "none",
                  }}
                >
                  <Search size={18} />
                </div>
                <input
                  className="directory-search-input"
                  id="directory-search-input"
                  type="search"
                  placeholder="Search county, agency, city, state, or portal slug..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  style={{
                    width: "100%",
                    height: "44px",
                    paddingLeft: "42px",
                    paddingRight: searchQuery ? "40px" : "14px",
                    backgroundColor: "var(--bg-secondary)",
                    border: "1px solid var(--border-card)",
                    borderRadius: "var(--radius-md)",
                    color: "#f8fafc",
                    fontSize: "0.9375rem",
                    outline: "none",
                    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "var(--accent-green)";
                    e.currentTarget.style.boxShadow = "0 0 0 1px var(--accent-green)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "var(--border-card)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => handleSearchChange("")}
                    aria-label="Clear search"
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      color: "#94a3b8",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "4px",
                    }}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            <StateFilter selectedState={selectedState} onStateChange={handleStateChange} />
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              paddingTop: "16px",
              borderTop: "1px solid rgba(255, 255, 255, 0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <button
                type="button"
                onClick={() => handleStatusChange("all")}
                style={{
                  padding: "5px 12px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  border: statusFilter === "all" ? "1px solid var(--accent-green)" : "1px solid var(--border-card)",
                  background: statusFilter === "all" ? "rgba(34, 197, 94, 0.15)" : "rgba(255, 255, 255, 0.04)",
                  color: statusFilter === "all" ? "#4ade80" : "#cbd5e1",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                All Statuses
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange("verified")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "5px 12px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  border: statusFilter === "verified" ? "1px solid var(--accent-green)" : "1px solid var(--border-card)",
                  background: statusFilter === "verified" ? "rgba(34, 197, 94, 0.18)" : "rgba(255, 255, 255, 0.04)",
                  color: statusFilter === "verified" ? "#4ade80" : "#cbd5e1",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <ShieldCheck size={12} />
                Verified Only
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange("unverified")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "5px 12px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  border: statusFilter === "unverified" ? "1px solid #ef4444" : "1px solid var(--border-card)",
                  background: statusFilter === "unverified" ? "rgba(239, 68, 68, 0.18)" : "rgba(255, 255, 255, 0.04)",
                  color: statusFilter === "unverified" ? "#f87171" : "#cbd5e1",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <AlertCircle size={12} />
                No Report Found
              </button>

              <span style={{ borderLeft: "1px solid rgba(255, 255, 255, 0.1)", height: "16px", margin: "0 4px" }} />

              <button
                type="button"
                onClick={() => handleCategoryChange("all")}
                style={{
                  padding: "5px 12px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  border: categoryFilter === "all" ? "1px solid #38bdf8" : "1px solid var(--border-card)",
                  background: categoryFilter === "all" ? "rgba(56, 189, 248, 0.15)" : "rgba(255, 255, 255, 0.04)",
                  color: categoryFilter === "all" ? "#38bdf8" : "#cbd5e1",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                All Jurisdictions
              </button>

              <button
                type="button"
                onClick={() => handleCategoryChange("county")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "5px 12px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  border: categoryFilter === "county" ? "1px solid #38bdf8" : "1px solid var(--border-card)",
                  background: categoryFilter === "county" ? "rgba(56, 189, 248, 0.18)" : "rgba(255, 255, 255, 0.04)",
                  color: categoryFilter === "county" ? "#38bdf8" : "#cbd5e1",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <MapPin size={12} />
                Counties Only
              </button>

              <button
                type="button"
                onClick={() => handleCategoryChange("agency")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "5px 12px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  border: categoryFilter === "agency" ? "1px solid #a855f7" : "1px solid var(--border-card)",
                  background: categoryFilter === "agency" ? "rgba(168, 85, 247, 0.18)" : "rgba(255, 255, 255, 0.04)",
                  color: categoryFilter === "agency" ? "#c084fc" : "#cbd5e1",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                <Building2 size={12} />
                Municipal &amp; Other
              </button>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "5px 10px",
                    borderRadius: "var(--radius-full)",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    border: "1px dashed #94a3b8",
                    background: "none",
                    color: "#94a3b8",
                    cursor: "pointer",
                    marginLeft: "6px",
                  }}
                >
                  <RotateCcw size={12} />
                  Reset
                </button>
              )}
            </div>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-card)",
                background: "var(--bg-secondary)",
                padding: "3px",
              }}
            >
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                aria-label="Grid View"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "6px 10px",
                  borderRadius: "6px",
                  border: "none",
                  background: viewMode === "grid" ? "rgba(255, 255, 255, 0.12)" : "transparent",
                  color: viewMode === "grid" ? "#ffffff" : "#64748b",
                  cursor: "pointer",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  transition: "all 0.15s ease",
                }}
              >
                <LayoutGrid size={14} />
                <span>Grid</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("table")}
                aria-label="Table View"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "6px 10px",
                  borderRadius: "6px",
                  border: "none",
                  background: viewMode === "table" ? "rgba(255, 255, 255, 0.12)" : "transparent",
                  color: viewMode === "table" ? "#ffffff" : "#64748b",
                  cursor: "pointer",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  transition: "all 0.15s ease",
                }}
              >
                <List size={14} />
                <span>Table</span>
              </button>
            </div>
          </div>
        </div>

        <div id="directory-results-container">
          {result.total === 0 ? (
            <div
              className="glass-panel"
              style={{
                borderRadius: "var(--radius-md)",
                padding: "60px 24px",
                textAlign: "center",
                border: "1px dashed var(--border-card)",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px auto",
                  color: "#94a3b8",
                }}
              >
                <Search size={28} />
              </div>
              <h3 style={{ fontSize: "1.25rem", color: "#ffffff", marginBottom: "8px" }}>
                No jurisdictions found
              </h3>
              <p style={{ color: "#94a3b8", maxWidth: "420px", margin: "0 auto 24px auto", fontSize: "0.875rem" }}>
                No counties or agencies matched your query &ldquo;{searchQuery}&rdquo; with the active
                filters.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="btn-secondary"
                style={{ fontSize: "0.875rem" }}
              >
                <RotateCcw size={14} />
                Reset all filters
              </button>
            </div>
          ) : (
            <>
              {viewMode === "grid" ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                    gap: "18px",
                  }}
                >
                  {result.items.map((entry) => (
                    <DirectoryCard key={entry.id} entry={entry} />
                  ))}
                </div>
              ) : (
                <DirectoryTable entries={result.items} />
              )}

              <Pagination
                currentPage={result.page}
                totalPages={result.totalPages}
                totalItems={result.total}
                pageSize={result.pageSize}
                onPageChange={(p) => setCurrentPage(p)}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
