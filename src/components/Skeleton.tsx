import React from "react";

export function SkeletonCard() {
  return (
    <div
      className="glass-panel skeleton-shimmer"
      style={{
        borderRadius: "var(--radius-md)",
        padding: "20px",
        height: "180px",
        border: "1px solid var(--border-subtle)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "20px",
              borderRadius: "4px",
              background: "rgba(255, 255, 255, 0.08)",
            }}
          />
          <div
            style={{
              width: "100px",
              height: "20px",
              borderRadius: "9999px",
              background: "rgba(255, 255, 255, 0.08)",
            }}
          />
        </div>
        <div
          style={{
            width: "65%",
            height: "24px",
            borderRadius: "4px",
            background: "rgba(255, 255, 255, 0.08)",
            marginBottom: "8px",
          }}
        />
        <div
          style={{
            width: "40%",
            height: "16px",
            borderRadius: "4px",
            background: "rgba(255, 255, 255, 0.05)",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          paddingTop: "12px",
          borderTop: "1px solid rgba(255, 255, 255, 0.05)",
        }}
      >
        <div
          style={{
            width: "120px",
            height: "16px",
            borderRadius: "4px",
            background: "rgba(255, 255, 255, 0.05)",
          }}
        />
        <div
          style={{
            width: "90px",
            height: "16px",
            borderRadius: "4px",
            background: "rgba(255, 255, 255, 0.08)",
          }}
        />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 24 }: { count?: number }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
        gap: "18px",
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
