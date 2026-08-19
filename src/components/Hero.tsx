import React from "react";
import { DirectoryStats } from "../lib/types";
import { RevealWords } from "./RevealWords";

interface HeroProps {
  stats: DirectoryStats;
}

export function Hero({ stats }: HeroProps) {
  const missingCount =
    stats.unverifiedCountiesCount || Math.max(0, stats.totalCounties - stats.totalVerifiedPortals);

  return (
    <section className="editorial-hero" aria-labelledby="hero-title">
      <div className="editorial-hero__shade" />
      <div className="editorial-hero__content">
        <h1 id="hero-title" className="flock-title flock-title--onload">
          <RevealWords>Are police cameras tracking your community without public transparency?</RevealWords>
        </h1>

        <p
          className="editorial-hero__summary flock-reveal flock-reveal--onload"
          style={{ "--reveal-delay": "240ms" } as React.CSSProperties}
        >
          Thousands of police departments deploy Flock Safety ALPR cameras to track drivers, but most operate with <strong>poor transparency and zero public audit logs</strong>. Search below to see if your area has a verified portal, or <strong>contact your state lawmakers to demand transparency</strong>.
        </p>

        <div
          className="hero-stat-grid flock-reveal flock-reveal--onload"
          style={{ "--reveal-delay": "420ms" } as React.CSSProperties}
          aria-label="Directory coverage and oversight gap"
        >
          <div className="hero-stat-card">
            <p>Counties Indexed</p>
            <strong>{stats.totalCounties.toLocaleString()}</strong>
            <span>Nationwide tracking</span>
          </div>
          <div className="hero-stat-card hero-stat-card--glass">
            <p>Verified Portals</p>
            <strong>{stats.totalVerifiedPortals.toLocaleString()}</strong>
            <span>Published report links</span>
          </div>
          <div className="hero-stat-card hero-stat-card--alert">
            <p>Missing Reports</p>
            <strong>{missingCount.toLocaleString()}</strong>
            <span>Jurisdictions lacking transparency</span>
          </div>
        </div>
      </div>
    </section>
  );
}
