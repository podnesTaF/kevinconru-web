import Link from "next/link";
import { CONTACT, WYVERN_URL } from "@/lib/site";
import { getSiteSettings } from "@/lib/queries/content";
import PaletteSwitcher from "@/components/PaletteSwitcher";
import TypographySwitcher from "@/components/TypographySwitcher";

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
            <div className="foot-tag">Southern African art and the arts of Oceania. Brussels.</div>
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
          <span>Brussels</span>
        </div>
      </div>
    </footer>
  );
}
