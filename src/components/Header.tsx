"use client";

import Link from "next/link";
import { ArrowDown, Check } from "lucide-react";

interface HeaderProps {
  totalCounties: number;
  totalVerified: number;
}

export function Header({ totalVerified }: HeaderProps) {
  const scrollToDirectory = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    document.getElementById("directory-search-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="wordmark" aria-label="Flock Transparency Home">
          <span className="wordmark__mark" aria-hidden="true" />
          <span>Flock Transparency</span>
        </Link>

        <div className="site-header__actions">
          <span className="verified-count">
            <Check size={13} /> {totalVerified.toLocaleString()} verified
          </span>
          <a className="header-cta" href="#directory-search-section" onClick={scrollToDirectory}>
            Find a report <ArrowDown size={14} />
          </a>
        </div>
      </div>
    </header>
  );
}
