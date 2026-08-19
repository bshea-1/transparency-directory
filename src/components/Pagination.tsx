import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: PaginationProps) {
  if (totalItems === 0 || totalPages <= 1) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 0",
          fontSize: "0.875rem",
          color: "#94a3b8",
        }}
      >
        <span>
          Showing <strong>{totalItems}</strong> {totalItems === 1 ? "result" : "results"}
        </span>
      </div>
    );
  }

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const delta = 2;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (
        (i === currentPage - delta - 1 && i > 1) ||
        (i === currentPage + delta + 1 && i < totalPages)
      ) {
        pages.push("ellipsis");
      }
    }

    return pages.filter((item, index, arr) => {
      if (item === "ellipsis" && arr[index - 1] === "ellipsis") return false;
      return true;
    });
  };

  const visiblePages = getPageNumbers();

  const handlePageClick = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
      const el = document.getElementById("directory-results-container");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <nav
      className="directory-pagination"
      aria-label="Directory Pagination"
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        padding: "24px 0 12px 0",
        marginTop: "20px",
        borderTop: "1px solid var(--border-subtle)",
      }}
    >
      <div style={{ fontSize: "0.875rem", color: "#94a3b8" }}>
        Showing <strong style={{ color: "#ffffff" }}>{startItem.toLocaleString()}</strong>–
        <strong style={{ color: "#ffffff" }}>{endItem.toLocaleString()}</strong> of{" "}
        <strong style={{ color: "#ffffff" }}>{totalItems.toLocaleString()}</strong> results
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          onClick={() => handlePageClick(1)}
          disabled={currentPage === 1}
          aria-label="First Page"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border-card)",
            background: "rgba(255, 255, 255, 0.04)",
            color: currentPage === 1 ? "#475569" : "#cbd5e1",
            cursor: currentPage === 1 ? "not-allowed" : "pointer",
            transition: "all 0.15s ease",
          }}
        >
          <ChevronsLeft size={16} />
        </button>

        <button
          type="button"
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous Page"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            padding: "0 12px",
            height: "36px",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border-card)",
            background: "rgba(255, 255, 255, 0.04)",
            color: currentPage === 1 ? "#475569" : "#cbd5e1",
            cursor: currentPage === 1 ? "not-allowed" : "pointer",
            fontSize: "0.8125rem",
            fontWeight: 600,
            transition: "all 0.15s ease",
          }}
        >
          <ChevronLeft size={16} />
          <span style={{ display: "none" }} className="pagination-label-prev">
            Prev
          </span>
        </button>

        {visiblePages.map((item, idx) => {
          if (item === "ellipsis") {
            return (
              <span
                key={`ellipsis-${idx}`}
                style={{
                  padding: "0 6px",
                  color: "#64748b",
                  userSelect: "none",
                }}
              >
                …
              </span>
            );
          }

          const isCurrent = item === currentPage;

          return (
            <button
              key={`page-${item}`}
              type="button"
              onClick={() => handlePageClick(item)}
              aria-current={isCurrent ? "page" : undefined}
              aria-label={`Page ${item}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: "36px",
                height: "36px",
                padding: "0 8px",
                borderRadius: "var(--radius-sm)",
                border: isCurrent
                  ? "1px solid var(--accent-green)"
                  : "1px solid var(--border-card)",
                background: isCurrent
                  ? "rgba(34, 197, 94, 0.18)"
                  : "rgba(255, 255, 255, 0.04)",
                color: isCurrent ? "#4ade80" : "#cbd5e1",
                fontWeight: isCurrent ? 700 : 500,
                fontSize: "0.8125rem",
                cursor: isCurrent ? "default" : "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {item}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next Page"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            padding: "0 12px",
            height: "36px",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border-card)",
            background: "rgba(255, 255, 255, 0.04)",
            color: currentPage === totalPages ? "#475569" : "#cbd5e1",
            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
            fontSize: "0.8125rem",
            fontWeight: 600,
            transition: "all 0.15s ease",
          }}
        >
          <span style={{ display: "none" }} className="pagination-label-next">
            Next
          </span>
          <ChevronRight size={16} />
        </button>

        <button
          type="button"
          onClick={() => handlePageClick(totalPages)}
          disabled={currentPage === totalPages}
          aria-label="Last Page"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border-card)",
            background: "rgba(255, 255, 255, 0.04)",
            color: currentPage === totalPages ? "#475569" : "#cbd5e1",
            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
            transition: "all 0.15s ease",
          }}
        >
          <ChevronsRight size={16} />
        </button>
      </div>

      <style jsx>{`
        @media (min-width: 640px) {
          .pagination-label-prev,
          .pagination-label-next {
            display: inline !important;
          }
        }
      `}</style>
    </nav>
  );
}
