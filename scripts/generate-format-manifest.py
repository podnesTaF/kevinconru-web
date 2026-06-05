#!/usr/bin/env python3
"""Generate scripts/format-manifest.json from the old Format site.

Parses the crawled pages (cache dir, default /tmp/kcold — re-fetches from
https://www.kevinconru.com when a page is missing) and pairs each gallery
image with its own caption straight from the DOM (`<div class="asset image">`
holds both the full-res data-src and its `<div class="copy">`), so no
order-guessing is involved. Local originals in ./media are matched by
NFC-normalised filename; the signed CDN URL is kept as a download fallback.

Output: scripts/format-manifest.json  (consumed by scripts/import-format.ts)
Run:    python3 scripts/generate-format-manifest.py
"""
import json, os, re, sys, html, unicodedata, urllib.parse, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = sys.argv[1] if len(sys.argv) > 1 else "/tmp/kcold"
MEDIA = os.path.join(ROOT, "media")
SITE = "https://www.kevinconru.com"

# ───────────────────────── helpers ─────────────────────────

def norm(name: str) -> str:
    name = urllib.parse.unquote(name).replace("+", " ")
    return unicodedata.normalize("NFC", name).lower().strip()

def page_html(slug: str) -> str:
    path = os.path.join(CACHE, f"{slug}.html")
    if not os.path.exists(path):
        req = urllib.request.Request(f"{SITE}/{slug}", headers={"User-Agent": "Mozilla/5.0"})
        data = urllib.request.urlopen(req, timeout=30).read().decode("utf-8", "ignore")
        os.makedirs(CACHE, exist_ok=True)
        open(path, "w", encoding="utf-8").write(data)
    return open(path, encoding="utf-8", errors="ignore").read()

def text_of(fragment: str) -> str:
    t = re.sub(r"<[^>]+>", " ", fragment)
    return re.sub(r"\s+", " ", html.unescape(t)).strip()

SKIP_NAMES = ("logo", "favicon", "pixel.gif")

def cdn_items(fragment: str):
    """All full-res CDN urls (data-src first, src fallback) in DOM order."""
    out = []
    for m in re.finditer(r'(?:data-src|src)="(https://format\.creatorcdn\.com/[^"]+)"', fragment):
        url = m.group(1)
        name = norm(url.split("?")[0].rsplit("/", 1)[-1])
        if any(s in name for s in SKIP_NAMES):
            continue
        out.append({"cdn": html.unescape(url), "file": name})
    return out

def parse_assets(s: str):
    """Ordered list of image assets {cdn,file,paras[]} + txt assets {paras[]}."""
    body = []
    chunks = re.split(r'(?=<div class="asset (?:image|txt)")', s)
    for ch in chunks[1:]:
        kind = "image" if ch.startswith('<div class="asset image"') else "txt"
        # cut at the next divider/asset to keep the block local
        cut = re.split(r'<div class="(?:divider|asset )', ch[1:], 1)[0]
        if kind == "image":
            imgs = cdn_items(cut)
            if not imgs:
                continue
            copy = re.search(r'<div class="copy">(.*?)</div>', cut, re.S)
            paras = []
            if copy:
                paras = [text_of(p) for p in re.findall(r"<p>(.*?)</p>", copy.group(1), re.S)]
                paras = [p for p in paras if p]
            body.append({"kind": "image", **imgs[0], "paras": paras})
        else:
            paras = [text_of(p) for p in re.findall(r"<p>(.*?)</p>", cut, re.S)]
            paras = [p for p in paras if p and p.lower() not in ("buy this book", "buy yhis book")]
            if paras:
                body.append({"kind": "txt", "paras": paras})
    return body

def parse_modules_interleaved(s: str):
    """Interview pages: text modules AND images as ordered tokens.

    On the old site these pages interleave photos between paragraphs, so the
    DOCUMENT ORDER must be preserved (the new site inlines the images in the
    rich-text body at the same positions). Pages can render the same module
    twice (desktop+mobile) → dedupe by plain text / filename, keeping first.
    """
    tokens, seen_txt, seen_img = [], set(), set()
    pat = re.compile(
        r'<div[^>]*data-editable-type="(?:text|title)"[^>]*>(.*?)</div>'
        r'|<(?:img|div)[^>]*?(?:data-src|src|data-background-image)="(https://format\.creatorcdn\.com/[^"]+)"',
        re.S,
    )
    for m in pat.finditer(s):
        if m.group(1) is not None:
            plain = text_of(m.group(1))
            if not plain or plain in seen_txt:
                continue
            seen_txt.add(plain)
            tokens.append(("text", m.group(1).strip()))
        else:
            url = html.unescape(m.group(2))
            name = norm(url.split("?")[0].rsplit("/", 1)[-1])
            if any(sk in name for sk in SKIP_NAMES) or name in seen_img:
                continue
            seen_img.add(name)
            tokens.append(("image", {"cdn": url, "file": name}))
    return tokens


def module_text_to_html(t: str) -> str:
    """One module's inner HTML → clean <p> paragraphs (bold kept as <strong>)."""
    out = []
    t = t.replace("\xa0", " ").replace("&nbsp;", " ")
    t = re.sub(r'<span style="font-weight:\s*bold;?">(.*?)</span>', r"<strong>\1</strong>", t, flags=re.S)
    t = re.sub(r"<b\b[^>]*>", "<strong>", t).replace("</b>", "</strong>")
    t = re.sub(r"<(?!/?(?:strong|em|br|p)\b)[^>]+>", "", t)  # drop other tags
    for para in re.split(r"(?:<br\s*/?>\s*){2,}", t):
        para = re.sub(r"<br\s*/?>", " ", para)
        para = re.sub(r"\s+", " ", para).strip()
        if para:
            out.append(f"<p>{para}</p>")
    return "\n".join(out)

def paras_to_html(paras):
    return "\n".join(f"<p>{html.escape(p)}</p>" for p in paras)

def split_caption(paras):
    """First short line → title, rest → caption text."""
    if not paras:
        return None, None
    title = paras[0] if len(paras[0]) <= 90 else None
    rest = paras[1:] if title else paras
    return title, ("\n".join(rest) or None)

# local file index: normalized filename -> [relative paths]
local_index = {}
for dirpath, _, files in os.walk(MEDIA):
    for f in files:
        if f.endswith(".Identifier") or f.endswith(".identifier"):
            continue
        rel = os.path.relpath(os.path.join(dirpath, f), ROOT)
        local_index.setdefault(norm(f), []).append(rel)

def find_local(fname: str, prefer_dirs):
    cands = local_index.get(norm(fname), [])
    for d in prefer_dirs:
        for c in cands:
            if c.startswith(f"media/{d}/"):
                return c
    return cands[0] if len(cands) == 1 else (cands[0] if cands else None)

# ───────────────────────── item configs (decisions baked in) ─────────────────────────
# action: create | enrich. enrich only sets the listed fields + replaces gallery.
PUBS = [
    dict(page="4550986-publications-oldman", action="enrich", slug="william-oldman",
         cover="OLDMAN-cover.jpg", dirs=["publications-oldman", "publications-covers"], layout="List"),
    dict(page="publicationstervuren", action="create", slug="masterpieces-rmca",
         title="Masterpieces — New Guinea Art from the Royal Museum for Central Africa",
         year=2014, kind="ExhibitionCatalogue", region="Oceania",
         publisher="Royal Museum for Central Africa, Tervuren",
         body="<p>Catalogue of the exhibition of Papua New Guinea masterpieces from the Royal Museum for Central Africa, curated by Kevin Conru and held in Brussels in 2014.</p>",
         cover="catalogue-jaquette.jpg.jpg", dirs=["masterpieces", "publications-covers"], layout="List"),
    dict(page="publications-bismarck-archipelago-art", action="enrich", slug="bismarck",
         cover="cover+UK.jpg", dirs=["bismarck-archipelago-art", "publications-covers"]),
    dict(page="publications-bernatzik-africa", action="create", slug="bernatzik-africa",
         title="Hugo Bernatzik — Africa", year=2003, kind="Archive", region="Africa",
         publisher="5 Continents Editions",  # year/publisher: verify in admin
         body="<p>Photographs of Africa by Hugo Bernatzik, drawn from his expeditions of the 1920s and 1930s and published with full scholarly apparatus.</p>",
         cover="Numériser 41.jpg", dirs=["bernatzik-afrika", "publications-covers"]),
    dict(page="publications-bernatzik-south-pacific", action="create", slug="bernatzik-south-pacific",
         title="Hugo Bernatzik — South Pacific", year=2004, kind="Archive", region="Oceania",
         publisher="5 Continents Editions",
         body="<p>Hugo Bernatzik's South Pacific photographs — portraits and scenes from Melanesia and the Solomon Islands taken in the early 1930s.</p>",
         cover="Numériser 49.jpg", dirs=["bernatzik-south-pacific", "publications-covers"]),
    dict(page="publications-bernatzik-southeast-asia", action="create", slug="bernatzik-southeast-asia",
         title="Hugo Bernatzik — Southeast Asia", year=2005, kind="Archive", region="SoutheastAsia",
         publisher="5 Continents Editions",
         body="<p>Hugo Bernatzik's Southeast Asian photographs, from Burma and Siam to Bali and mid-Indochina.</p>",
         cover="Numériser 55.jpg", dirs=["bernatzik-southeast-asia", "publications-covers"]),
    dict(page="publications-solomon-islands-art", action="create", slug="solomon-islands-art",
         title="Solomon Islands Art", year=2008, kind="Monograph", region="Melanesia",
         publisher="5 Continents Editions",
         body="<p>A survey of the sculptural arts of the Solomon Islands, with documented works from Nissan Island, the Roviana Lagoon and beyond.</p>",
         cover="Numériser 69.jpg", dirs=["solomon-islands-art", "publications-covers"]),
    dict(page="publications-the-art-of-southeast-africa", action="enrich", slug="southern-african",
         title="The Art of Southeast Africa",  # retitle per old site
         cover="Numériser 63.jpg1.jpg", dirs=["the-art-of-southeast-afrika", "publications-covers"]),
    dict(page="publications-guinea-art-in-chicago", action="enrich", slug="ab-lewis",
         body_from_page=True,  # 5.8k-char essay
         cover="Numériser 46.jpg", dirs=["publications-guinea-art-in-chicago", "publications-covers"], layout="List"),
    dict(page="publications-conru-mer-du-sud-2008", extra_pages=["catalogs"], action="create",
         slug="south-seas-2008", title="South Seas — Art of the Pacific", year=2008,
         kind="ExhibitionCatalogue", region="Oceania", publisher="Conru Editions",
         body="<p>Gallery catalogue of Pacific works, with published objects from the Solomon Islands, the Sepik coast and Fiji.</p>",
         cover="Numériser 42.jpeg", dirs=["conru-mer-du-sud-2008", "catalogs", "publications-covers"]),
    dict(page="publication-rarities", action="create", slug="rarities-2007",
         title="Rarities — Art from the Pacific Islands", year=2007,
         kind="ExhibitionCatalogue", region="Oceania", publisher="Conru Editions",
         body="<p>Gallery catalogue of rare Pacific works — Maori figures and chief's cloak, a New Ireland dance mask, a Tami Island cult object, and more.</p>",
         cover="Numériser 36.jpg", dirs=["publications-rarities", "publications-covers"]),
    dict(page="publications-conru-oceanic-shields", action="create", slug="oceanic-shields-2006",
         title="Oceanic Shields", year=2006, kind="ExhibitionCatalogue", region="Oceania",
         publisher="Conru Editions",
         body="<p>Gallery catalogue devoted to the war shields of New Guinea and island Melanesia.</p>",
         cover="Numériser 31.jpg", dirs=["conru-oceanic-shields", "publications-covers"]),
    dict(page="publications-conru-2005", action="create", slug="catalogue-2005",
         title="Southeast African and Oceanic Art", year=2005, kind="ExhibitionCatalogue",
         region="AfricaAndOceania", publisher="Conru Editions",
         body="<p>Gallery catalogue, 2005 — Southeast African and Oceanic works, from an Nguni prestige staff to a royal Maori meeting-house carving.</p>",
         cover="Numériser 26.jpg", dirs=["conru-2005", "publications-covers"]),
    dict(page="publications-conru-2004", action="create", slug="catalogue-2004",
         title="Catalogue 2004", year=2004, kind="ExhibitionCatalogue",
         region="AfricaAndOceania", publisher="Conru Editions",
         body="<p>Gallery catalogue, 2004 — African and Oceanic works including Luba, Kwele, Sepik and Tshokwe pieces.</p>",
         cover="Numériser 20.jpg", dirs=["publications-conru-2004", "publications-covers"]),
    dict(page="publications-conru-2002", action="create", slug="catalogue-2002",
         title="Catalogue 2002", year=2002, kind="ExhibitionCatalogue",
         region="AfricaAndOceania", publisher="Conru Editions",
         body="<p>Gallery catalogue, 2002 — African works with distinguished provenance: Tabwa, Kota, Kongo and Epa pieces.</p>",
         cover="Numériser 15.jpg", dirs=["conru-2002", "publications-covers"]),
    dict(page="publications-conru-1999", action="create", slug="colour-of-melanesia-1999",
         title="The Colour of Melanesia", year=1999, kind="ExhibitionCatalogue",
         region="Melanesia", publisher="Conru Editions",
         body="<p>Gallery catalogue, 1999 — Melanesian works from the Sepik, the Massim region and New Ireland.</p>",
         cover="Numériser 10.jpg", dirs=["conru-1999", "publications-covers"]),
    dict(page="publications-conru-1995", action="create", slug="catalogue-1995",
         title="Catalogue 1995", year=1995, kind="ExhibitionCatalogue",
         region="AfricaAndOceania", publisher="Conru Editions",
         body="<p>Gallery catalogue, 1995 — African and Oceanic works, from an Ibibio mask to a Cook Islands stool.</p>",
         cover="Numériser.jpg", dirs=["conru-1995", "publications-covers"]),
]

PRESS = [
    dict(page="untitled-gallery", slug="fragments-of-the-fang", outlet="Art & Antiques Magazine",
         title="Fragments of the Fang", subtitle="Art & Antiques Magazine · October 2007", year=2007,
         cover="Panorama0.jpg", dirs=["press-fragments-of-the-fangs", "press-covers"], layout="List"),
    dict(page="simple-page", slug="nacf-1988", outlet="NACF Magazine",
         title="Towards 1992 — Export of Cultural Heritage Objects",
         subtitle="NACF Magazine · Christmas 1988", year=1988,
         cover="NACF_cover.jpg", dirs=["nacf", "press-covers"], layout="List"),
    dict(page="665018-press-tam94-issue-3", slug="tam-1994-issue-3", outlet="Tribal Arts Magazine",
         title="Treasures of the Museum für Völkerkunde",
         subtitle="Tribal Arts Magazine · September 1994, Issue 3", year=1994,
         cover="TAM1994_cover.jpg", dirs=["press-tam94-ussue3", "press-covers"], layout="List"),
    dict(page="665017-press-tam94-issue-4", slug="tam-1994-issue-4", outlet="Tribal Arts Magazine",
         title="The Royal Albert Memorial Museum Exeter and an Important Hawaiian Spear Support",
         subtitle="Tribal Arts Magazine · Winter 1994–95, Issue 4", year=1994,
         cover="TAM_94_00.jpg", dirs=["press-tam94-issue4", "press-covers"], layout="List"),
    dict(page="665019-press-tam99", slug="tam-1999", outlet="Tribal Arts Magazine",
         title="Thoughts over an Attribution", subtitle="Tribal Arts Magazine · Spring 1999", year=1999,
         cover="TAM1999_cover.jpg", dirs=["press-tam-99", "press-covers"], layout="List"),
    dict(page="284527-press-conru-arts-and-antiques", slug="passionate-journey-2009",
         outlet="Art & Antiques", title="Passionate Journey",
         subtitle="Art & Antiques · April 2009, Vol. 32, Issue 4", year=2009, body_from_page=True,
         cover="ArtsAntiques_02.jpg", dirs=["conru-arts-and-antiques", "press-covers"]),
    dict(page="press-conru-tribalmania", slug="tribalmania-interview", outlet="Tribalmania Gallery",
         title="An Interview with Kevin Conru", subtitle="Tribalmania Gallery · Santa Fe", year=2005,
         body_from_page=True,  # year approximate — verify in admin
         cover="Conru_Tribalmnia_modifié-11.jpg", dirs=["press-conru-tribalmania", "press-covers"]),
    dict(page="pres-conru-tas", slug="tribal-art-society-interview", outlet="Tribal Art Society",
         title="Kevin Conru — Tribal Art Society Interview",
         subtitle="Conversation with Alex Arthur and Joaquin Pecci", year=2020, body_from_page=True,
         cover="TAS.jpg", dirs=["pres-conru-tas", "press-covers"]),
    dict(page="665020-press-tribal-art-magazine-autumn-2013", slug="tam-autumn-2013",
         outlet="Tribal Art Magazine", title="Tribal Art Magazine — Autumn 2013",
         subtitle="Tribal Art Magazine · Autumn 2013", year=2013,
         cover="Numériser 148.jpeg", dirs=["press-tribal-art-magazine-autumn-2013", "press-covers"], layout="List"),
]

# ───────────────────────── build ─────────────────────────
warnings = []

def build_gallery(cfg):
    """Returns (gallery, cover, body, body_images).

    Asset-based pages (captioned plate galleries) → gallery + optional txt body.
    Module-based pages (interviews) interleave photos between paragraphs on the
    old site → the photos go INLINE into the body (as <img data-import-file>
    placeholders the importer resolves after upload) and gallery stays empty.
    """
    pages = [cfg["page"]] + cfg.get("extra_pages", [])
    cover_norm = norm(cfg["cover"])
    images, texts = [], []
    tokens = None  # interleaved module tokens (module-based pages only)
    for slug in pages:
        s = page_html(slug)
        assets = parse_assets(s)
        if not any(a["kind"] == "image" for a in assets):  # module-based page
            tokens = (tokens or []) + parse_modules_interleaved(s)
        else:
            for a in assets:
                if a["kind"] == "image":
                    images.append(a)
                else:
                    texts.append(paras_to_html(a["paras"]))

    gallery, body_images, body = [], [], None

    # Module pages split two ways: real articles (substantial text — the old
    # site interleaves photos between paragraphs) inline their images into the
    # body; near-textless scan pages (NACF, TAM issues) stay lightbox galleries.
    total_text = sum(len(text_of(v)) for k, v in (tokens or []) if k == "text")
    inline = tokens is not None and (cfg.get("body_from_page") or total_text >= 1000)

    if inline:
        # Drop the leading page-heading module (duplicates title/subtitle).
        for i, (k, v) in enumerate(tokens):
            if k == "text":
                if len(text_of(v)) < 120:
                    tokens.pop(i)
                break
        parts = []
        for k, v in tokens:
            if k == "text":
                h = module_text_to_html(v)
                if h:
                    parts.append(h)
            else:
                if v["file"] == cover_norm:
                    images.append({**v, "paras": []})  # cover source, not inline
                    continue
                local = find_local(v["file"], cfg["dirs"])
                if not local:
                    warnings.append(f"{cfg['slug']}: no local file for {v['file']} (CDN fallback)")
                body_images.append({"file": v["file"], "local": local, "cdn": v["cdn"]})
                parts.append(f'<img data-import-file="{v["file"]}">')
        body = "\n".join(parts)
        if cfg.get("body_from_page") and not text_of(body):
            warnings.append(f"{cfg['slug']}: body_from_page but no text found")
    else:
        if tokens is not None:  # gallery-mode module page: images, no captions
            for _, v in [t for t in tokens if t[0] == "image"]:
                images.append({**v, "paras": []})
        for it in images:
            if it["file"] == cover_norm:
                continue  # cover shown separately
            local = find_local(it["file"], cfg["dirs"])
            if not local:
                warnings.append(f"{cfg['slug']}: no local file for {it['file']} (CDN fallback)")
            title, caption = split_caption(it.get("paras", []))
            gallery.append({"file": it["file"], "local": local, "cdn": it["cdn"],
                            "title": title, "caption": caption})
        if cfg.get("body_from_page"):
            body = "\n".join(texts)  # asset-txt blocks: already <p>-wrapped
            if not body:
                warnings.append(f"{cfg['slug']}: body_from_page but no text found")

    cover_local = find_local(cfg["cover"], cfg["dirs"])
    cover_cdn = next((it["cdn"] for it in images if it["file"] == cover_norm), None)
    if not cover_cdn:
        # index-card covers only exist on the index pages
        for idx in ("publications", "press"):
            cover_cdn = next((it["cdn"] for it in cdn_items(page_html(idx)) if it["file"] == cover_norm), None)
            if cover_cdn:
                break
    if not cover_local and not cover_cdn:
        warnings.append(f"{cfg['slug']}: cover {cfg['cover']} not found locally or on page")
    return gallery, {"local": cover_local, "cdn": cover_cdn, "file": cover_norm}, body, body_images

manifest = {"publications": [], "press": []}

for i, cfg in enumerate(PUBS):
    gallery, cover, page_body, body_images = build_gallery(cfg)
    item = {
        "action": cfg["action"], "slug": cfg["slug"], "sortOrder": i,
        "cover": cover, "gallery": gallery,
    }
    for k in ("title", "year", "kind", "region", "publisher", "body"):
        if k in cfg:
            item[k] = cfg[k]
    if page_body:
        item["body"] = page_body
    if body_images:
        item["bodyImages"] = body_images
    if "layout" in cfg:
        item["galleryLayout"] = cfg["layout"]
    manifest["publications"].append(item)

for i, cfg in enumerate(PRESS):
    gallery, cover, page_body, body_images = build_gallery(cfg)
    item = {
        "action": "create", "slug": cfg["slug"], "sortOrder": 4 + i,  # after the 4 existing rows
        "outlet": cfg["outlet"], "title": cfg["title"], "subtitle": cfg["subtitle"],
        "year": cfg["year"], "cover": cover, "gallery": gallery,
    }
    if page_body:
        item["body"] = page_body
    if body_images:
        item["bodyImages"] = body_images
    if "layout" in cfg:
        item["galleryLayout"] = cfg["layout"]
    manifest["press"].append(item)

out = os.path.join(ROOT, "scripts", "format-manifest.json")
json.dump(manifest, open(out, "w", encoding="utf-8"), indent=2, ensure_ascii=False)

print(f"✔ wrote {out}")
print(f"  publications: {len(manifest['publications'])}, press: {len(manifest['press'])}")
for p in manifest["publications"]:
    bl = len(p.get("body") or "")
    print(f"   pub  {p['slug']:28s} gallery:{len(p['gallery']):2d} cover:{'local' if p['cover']['local'] else 'CDN' if p['cover']['cdn'] else 'MISSING'} body:{bl}ch")
for p in manifest["press"]:
    bl = len(p.get("body") or "")
    print(f"   press {p['slug']:27s} gallery:{len(p['gallery']):2d} cover:{'local' if p['cover']['local'] else 'CDN' if p['cover']['cdn'] else 'MISSING'} body:{bl}ch")
if warnings:
    print("\n⚠ warnings:")
    for w in warnings:
        print("  -", w)
