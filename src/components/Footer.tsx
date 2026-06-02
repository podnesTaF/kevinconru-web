import Link from "next/link";
import { CONTACT, WYVERN_URL } from "@/lib/site";
import { getSiteSettings } from "@/lib/queries/content";
import PaletteSwitcher from "@/components/PaletteSwitcher";
import TypographySwitcher from "@/components/TypographySwitcher";

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M14 8.5h2.2V5.6C15.84 5.55 14.9 5.5 13.8 5.5c-2.3 0-3.8 1.4-3.8 3.96V11.6H7.3v3.2H10V22h3.3v-7.2h2.6l.4-3.2h-3V9.8c0-.93.26-1.3 1.3-1.3z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="3.6" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="16.8" cy="7.2" r="1" fill="currentColor" />
    </svg>
  );
}

export default async function Footer() {
  // Contact/social come from the SiteSettings singleton (editable in admin).
  // Fall back to the static prototype constants only when no row exists yet;
  // once it does, respect its values (incl. an intentionally cleared social).
  const settings = await getSiteSettings();
  const contact = settings
    ? {
        tel: settings.tel || CONTACT.tel,
        telHref: settings.telHref || CONTACT.telHref,
        email: settings.email || CONTACT.email,
        facebook: settings.facebook,
        instagram: settings.instagram,
        city: settings.city,
      }
    : CONTACT;

  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-col">
            <div className="foot-brand">CONRU</div>
            <div className="foot-tag">
              African and Oceanic art — dealer, curator and publisher. Brussels.
            </div>
            <div className="foot-social">
              {contact.facebook && (
                <a href={contact.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <FacebookIcon />
                </a>
              )}
              {contact.instagram && (
                <a href={contact.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <InstagramIcon />
                </a>
              )}
            </div>
          </div>

          <div className="foot-col">
            <h6>Navigate</h6>
            <ul>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/publications">Publications</Link>
              </li>
              <li>
                <Link href="/films">Films</Link>
              </li>
              <li>
                <Link href="/press">Press</Link>
              </li>
              <li>
                <Link href="/about">About</Link>
              </li>
            </ul>
          </div>

          <div className="foot-col">
            <h6>Contact</h6>
            <ul>
              <li>
                <a href={contact.telHref}>{contact.tel}</a>
              </li>
              <li>
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </li>
              {contact.city && <li>{contact.city}</li>}
            </ul>
          </div>

          <div className="foot-col">
            <h6>Elsewhere</h6>
            <ul>
              {contact.facebook && (
                <li>
                  <a href={contact.facebook} target="_blank" rel="noopener noreferrer">
                    Facebook ↗
                  </a>
                </li>
              )}
              {contact.instagram && (
                <li>
                  <a href={contact.instagram} target="_blank" rel="noopener noreferrer">
                    Instagram ↗
                  </a>
                </li>
              )}
              <li>
                <a href={WYVERN_URL} target="_blank" rel="noopener noreferrer">
                  Wyvern Research ↗
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="foot-bot">
          <span>© 2026 Kevin Conru</span>
          <div className="foot-controls">
            <PaletteSwitcher />
            <TypographySwitcher />
          </div>
          <span>Brussels · By appointment</span>
        </div>
      </div>
    </footer>
  );
}
