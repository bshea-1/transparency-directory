import { RevealWords } from "./RevealWords";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div>
          <p className="site-footer__eyebrow">Flock Transparency</p>
          <h2 className="flock-title"><RevealWords>Clear public information, county by county.</RevealWords></h2>
        </div>
        <div className="site-footer__note">
          <p>Independent community directory. Not affiliated with Flock Safety.</p>
          <p>All linked reports are publicly hosted by their respective agencies.</p>
        </div>
      </div>
    </footer>
  );
}
