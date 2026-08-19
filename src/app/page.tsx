import React from "react";
import { getDirectoryData } from "../lib/dataSource";
import { Header } from "../components/Header";
import { Hero } from "../components/Hero";
import { DirectoryView } from "../components/DirectoryView";
import { Footer } from "../components/Footer";

export const revalidate = 3600;

export default async function HomePage() {
  const { entries, stats } = await getDirectoryData();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Flock Transparency",
    url: "https://flocktransparency.vercel.app/",
    description:
      "A searchable public directory of Flock Safety transparency reports by county, agency, and state.",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <Header
        totalCounties={stats.totalCounties}
        totalVerified={stats.totalVerifiedPortals}
      />

      <main style={{ flexGrow: 1 }}>
        <Hero stats={stats} />

        <div>
          <DirectoryView initialEntries={entries} />
        </div>
      </main>

      <Footer />
    </>
  );
}
