import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Mail, MapPin, Phone } from "lucide-react";
import { redirect } from "next/navigation";
import { RevealWords } from "../../../components/RevealWords";
import {
  getCountyByFips,
  getCurrentCountyRepresentatives,
  legislativeDistrictVintage,
} from "../../../lib/representatives";

interface CountyPageProps {
  params: Promise<{ fips: string }>;
}

export async function generateMetadata({ params }: CountyPageProps): Promise<Metadata> {
  const { fips } = await params;
  const county = getCountyByFips(fips);
  if (!county) return { title: "Flock Transparency" };

  return {
    title: "Flock Transparency",
    description: `Contact state legislators whose districts intersect ${county.name}, ${county.stateName}, about public transparency reporting.`,
  };
}

function mailtoFor(name: string, countyName: string, stateName: string) {
  const subject = `Please support public ALPR transparency and downloadable audit logs in ${countyName}`;
  const body = `Dear ${name},\n\nI am writing as a constituent regarding public access to law-enforcement technology transparency information in ${countyName}, ${stateName}.\n\nAutomated License Plate Readers (ALPR) scan vehicle movements across our community. I urge you to support clear, enforceable transparency requirements for all law enforcement agencies deploying ALPR technology. Specifically, every agency transparency portal should provide:\n\n1. Downloadable public audit logs detailing search queries and authorized justification reasons.\n2. Full bidirectional data-sharing disclosure (both agencies sharing data with this agency, and outside agencies this agency shares data with).\n3. Clearly published data retention periods and deletion schedules.\n4. Accurate camera counts, search policies, and designated public contact information.\n\nFlock Safety transparency portals can provide downloadable audit logs and sharing disclosures when enabled. Please champion mandatory public reporting so our community has meaningful oversight of surveillance technology.\n\nThank you for your service and leadership on this issue.\n\nSincerely,`;
  return { subject, body };
}

export default async function CountyPage({ params }: CountyPageProps) {
  const { fips } = await params;
  const county = getCountyByFips(fips);
  if (!county) redirect("/");

  const representatives = await getCurrentCountyRepresentatives(fips);

  return (
    <main className="county-page">
      <section className="county-masthead">
        <div className="container county-masthead__inner">
          <Link href="/" className="county-back-link">
            <ArrowLeft size={16} /> Back to directory
          </Link>
          <p className="eyebrow eyebrow--alert">No verified report found</p>
          <h1 className="flock-title flock-title--onload"><RevealWords>{county.name}</RevealWords></h1>
          <p className="county-masthead__summary flock-reveal flock-reveal--onload">
            Ask the state legislators serving parts of {county.name} to support public,
            current transparency reporting.
          </p>
        </div>
      </section>

      <section className="county-content">
        <div className="container county-content__grid">
          <aside className="county-guide flock-reveal">
            <p className="eyebrow eyebrow--dark">Make your voice heard</p>
            <h2 className="flock-title"><RevealWords>A short, specific message works best.</RevealWords></h2>
            <p>
              Contact one or several legislators below. The prepared email specifically asks for
              downloadable audit logs, bidirectional data-sharing disclosures (both inbound and outbound sharing),
              strict retention limits, and designated public contacts. Review and personalize it before sending.
            </p>
            <div className="county-note">
              <MapPin size={18} />
              <p>
                Counties can overlap several legislative districts. This page lists every
                {` ${county.stateName}`} state House and Senate district that intersects the
                county; your exact representatives depend on your street address.
              </p>
            </div>
          </aside>

          <div className="representative-list">
            <div className="representative-list__heading">
              <div>
                <p className="eyebrow eyebrow--dark">Potential representatives</p>
                <h2 className="flock-title"><RevealWords>{`${representatives.length} state legislator${representatives.length === 1 ? "" : "s"}`}</RevealWords></h2>
                <p className="representative-auto-update">Automatically refreshed every 24 hours</p>
              </div>
              <p>District boundaries: {legislativeDistrictVintage}</p>
            </div>

            {representatives.length > 0 ? (
              representatives.map((representative) => {
                const message = mailtoFor(representative.name, county.name, county.stateName);
                const mailto = representative.email
                  ? `mailto:${representative.email}?subject=${encodeURIComponent(message.subject)}&body=${encodeURIComponent(message.body)}`
                  : "";

                return (
                  <article className="representative-card flock-reveal" key={representative.id}>
                    <div className="representative-card__top">
                      <div>
                        <p>{representative.chamber} · District {representative.district}</p>
                        <h3>{representative.name}</h3>
                        <span>{representative.party || "Party not listed"}</span>
                      </div>
                      <span className="district-badge">{county.stateCode} {representative.district}</span>
                    </div>

                    <div className="representative-contact">
                      {representative.email && (
                        <a href={mailto} className="representative-primary-action">
                          <Mail size={16} /> Write a prepared email
                        </a>
                      )}
                      {representative.phone && (
                        <a href={`tel:${representative.phone}`}>
                          <Phone size={16} /> {representative.phone}
                        </a>
                      )}
                      {representative.officialUrl && (
                        <a href={representative.officialUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink size={16} /> Official page
                        </a>
                      )}
                    </div>
                    {representative.address && <address>{representative.address}</address>}
                  </article>
                );
              })
            ) : (
              <div className="representative-empty">
                <h3>We couldn’t reliably match a district.</h3>
                <p>
                  Use the official federal and state locator to find elected officials for
                  your exact address.
                </p>
                <a href="https://www.usa.gov/elected-officials" target="_blank" rel="noopener noreferrer">
                  Find elected officials <ExternalLink size={15} />
                </a>
              </div>
            )}

            <p className="representative-freshness">
              Contact details refresh automatically from public legislative records. Always
              confirm details on the linked official page before sending time-sensitive
              correspondence.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
