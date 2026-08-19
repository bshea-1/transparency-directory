"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Mail,
  Loader2,
  MapPin,
  RotateCcw,
  Sparkles,
} from "lucide-react";

interface ZipResult {
  success: boolean;
  zip: string;
  fips?: string;
  countyName?: string;
  stateCode?: string;
  stateName?: string;
  isVerified: boolean;
  portalUrl?: string;
  portalSlug?: string;
  agencyName?: string;
  contactUrl?: string;
  error?: string;
}

interface ZipLookupBoxProps {
  onSelectCounty?: (countyName: string, stateCode: string) => void;
}

const SAMPLE_ZIPS = [
  { zip: "94612", label: "Alameda, CA" },
  { zip: "99201", label: "Spokane, WA" },
  { zip: "36003", label: "Autauga, AL" },
  { zip: "78701", label: "Austin, TX" },
];

export function ZipLookupBox({ onSelectCounty }: ZipLookupBoxProps) {
  const [zipInput, setZipInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [zipResult, setZipResult] = useState<ZipResult | null>(null);

  const handleZipLookup = async (targetZip?: string) => {
    const zipToQuery = (targetZip || zipInput).trim().replace(/[^0-9]/g, "");
    if (!zipToQuery || zipToQuery.length !== 5) {
      setZipResult({
        success: false,
        zip: zipToQuery,
        isVerified: false,
        error: "Please enter a valid 5-digit US ZIP code.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/lookup-zip?zip=${encodeURIComponent(zipToQuery)}`);
      const data = (await response.json()) as ZipResult;
      setZipResult(data);
      if (targetZip) {
        setZipInput(targetZip);
      }
      if (data.success && data.countyName && data.stateCode && onSelectCounty) {
        onSelectCounty(data.countyName, data.stateCode);
      }
    } catch {
      setZipResult({
        success: false,
        zip: zipToQuery,
        isVerified: false,
        error: "Unable to check ZIP code right now. Please try again or search the directory below.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleZipLookup();
    }
  };

  const handleReset = () => {
    setZipInput("");
    setZipResult(null);
  };

  return (
    <div className="directory-zip-box">
      <div className="directory-zip-box__header">
        <div className="directory-zip-box__title">
          <Sparkles size={16} color="var(--forest)" />
          <span>Look up your community by ZIP code</span>
        </div>
        <span className="directory-zip-box__subtitle">
          Instantly check if your local area has a verified transparency portal
        </span>
      </div>

      <div className="directory-zip-box__form">
        <div className="directory-zip-box__input-wrap">
          <MapPin size={18} className="directory-zip-box__icon" />
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={5}
            placeholder="Enter 5-digit ZIP code (e.g. 94612, 78701)"
            value={zipInput}
            onChange={(e) => setZipInput(e.target.value.replace(/[^0-9]/g, "").slice(0, 5))}
            onKeyDown={handleKeyDown}
            className="directory-zip-box__input"
            aria-label="5-digit ZIP code lookup"
          />
          {zipInput && (
            <button
              type="button"
              onClick={handleReset}
              className="directory-zip-box__clear"
              aria-label="Clear input"
            >
              <RotateCcw size={14} />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => handleZipLookup()}
          disabled={isLoading || zipInput.length === 0}
          className="directory-zip-box__btn"
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Checking...</span>
            </>
          ) : (
            <>
              <Search size={16} />
              <span>Check ZIP</span>
            </>
          )}
        </button>
      </div>

      <div className="directory-zip-box__samples">
        <span className="directory-zip-box__samples-label">Quick test:</span>
        <div className="directory-zip-box__samples-list">
          {SAMPLE_ZIPS.map((sample) => (
            <button
              key={sample.zip}
              type="button"
              onClick={() => handleZipLookup(sample.zip)}
              className="directory-zip-box__sample-pill"
            >
              {sample.zip} ({sample.label})
            </button>
          ))}
        </div>
      </div>

      {zipResult && (
        <div
          className={`directory-zip-result ${
            zipResult.success && zipResult.isVerified
              ? "directory-zip-result--verified"
              : zipResult.success
              ? "directory-zip-result--unverified"
              : "directory-zip-result--error"
          }`}
        >
          {zipResult.success ? (
            <div className="directory-zip-result__content">
              <div className="directory-zip-result__meta">
                <div className="directory-zip-result__badge-row">
                  {zipResult.isVerified ? (
                    <span className="badge badge-verified">
                      <ShieldCheck size={13} />
                      Verified Portal Active
                    </span>
                  ) : (
                    <span className="badge badge-unverified">
                      <AlertCircle size={13} />
                      No Verified Portal Found
                    </span>
                  )}
                  <span className="directory-zip-result__location">
                    {zipResult.countyName}, {zipResult.stateCode} (ZIP {zipResult.zip})
                  </span>
                </div>

                <h3 className="directory-zip-result__title">
                  {zipResult.isVerified
                    ? `${zipResult.agencyName} publishes a public transparency report.`
                    : `No public transparency portal found for ${zipResult.countyName}.`}
                </h3>

                <p className="directory-zip-result__desc">
                  {zipResult.isVerified
                    ? "Your jurisdiction publishes public camera counts, retention policies, and search reasons on Flock Safety's portal."
                    : "Your local law enforcement has not published an official transparency report. State legislators can mandate public ALPR transparency and data-retention audits."}
                </p>
              </div>

              <div className="directory-zip-result__action">
                {zipResult.isVerified && zipResult.portalUrl ? (
                  <a
                    href={zipResult.portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                  >
                    <span>Open Official Transparency Portal</span>
                    <ExternalLink size={15} />
                  </a>
                ) : (
                  <Link href={zipResult.contactUrl || `/county/${zipResult.fips}`} className="btn-alert">
                    <Mail size={16} />
                    <span>Contact Your State Representatives</span>
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="directory-zip-result__error">
              <AlertCircle size={16} />
              <span>{zipResult.error}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
