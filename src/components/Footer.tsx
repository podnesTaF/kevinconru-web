import { CONTACT } from "@/lib/site";
import { getSiteSettings } from "@/lib/queries/content";

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
            </ul>
          </div>
        </div>

        <div className="foot-bot">
          <span>© 2026 Kevin Conru</span>
          <span>Brussels</span>
        </div>
      </div>
    </footer>
  );
}
