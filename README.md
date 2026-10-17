# Fortune Loan Services Website

## Files
- index.html — complete responsive website
- style.css — visual design, animations and responsive layout
- script.js — navigation, filters, tabs, counters, scroll effects, forms and EMI calculation
- assets/fortune-logo.png — uploaded Fortune Loan Services logo, also used as favicon
- robots.txt and sitemap.xml — crawler instructions and the six public site routes

## Run
Open `index.html` directly in a browser, or use VS Code + Live Server.

## Notes
The website uses responsive HTML/CSS/JavaScript and does not require a backend.
Partner names are informational and should be updated to match Fortune Loan Services' actual current partner relationships before publishing.


## Inquiry Popup
The homepage opens a loan inquiry popup on page load/refresh. It collects:
- Name
- Mobile number
- City
- Loan Amount
- Income source

On submit, it opens WhatsApp for **+91 9028346900** with the details pre-filled. The visitor reviews the message and chooses whether to press Send; a static website does not submit these details to a Fortune Loan Services backend.

## Contact, Partner Registration and EMI Calculator
The contact and partner forms validate required fields and Indian mobile/pincode formats before opening WhatsApp with the entered details. They do not store or submit details to a website backend. The EMI calculator provides an illustrative estimate and validates amount, rate and tenure; lender terms may differ.

The pages include canonical and social-sharing metadata. `robots.txt` references the sitemap, which lists the homepage and five secondary pages.


## Partner Logo Directory
The partner section now contains 97 logo tiles: 12 public-sector banks, 20 private-sector banks, 11 small-finance banks and 54 NBFC/financial companies from the supplied list. Logo images are loaded from the institutions' domains through a favicon/logo endpoint, with an initials fallback if an image cannot load.


## High-quality online bank logo references

The bank directory now uses scalable SVG logo references from the `auraveni/global-bank-logos` collection for the 12 Public Sector Banks, 20 Private Sector Banks, and the SFB logos available in that collection. Remaining SFB entries and the NBFC directory use 256px online favicon references with initials fallback. RBI is used as the reference for the current Small Finance Bank list and the 12 Public Sector Bank list.

References: https://github.com/auraveni/global-bank-logos and https://www.rbi.org.in/commonman/English/scripts/banksinindia.aspx


## Partner logo sourcing update

The Small Finance Bank and NBFC partner cards now use dedicated online logo references. Bank logos use scalable SVG assets from the Indian bank logo collection where available; remaining institutions use high-resolution online favicon/logo endpoints tied to each institution's domain, with a secondary DuckDuckGo favicon fallback.

Current partner directory in this build:
- Public Sector Banks: 12
- Private Sector Banks: 20
- Small Finance Banks: 11
- NBFCs: 54
- Total: 97 institutions

Important: company and bank names/logos are trademarks of their respective owners. The directory is informational and does not establish an active partnership or endorsement. Review institution identity, current relationships and brand-use requirements before commercial publication.


## Premium theme refresh
The stylesheet uses a midnight-navy, champagne-gold and warm-ivory base palette, with saffron and burgundy reserved for the festive offer. It improves hero text contrast, limits the moving lender-logo streams to the visual side, and uses a finance dashboard-style glass panel. The brand logo remains in the navigation and preloader.


## Homepage hero carousel
The homepage keeps the original Fortune hero as its first slide and uses the supplied Navratri EMI-consolidation design as its second slide. The main hero stays visible for five seconds, and the Navratri offer stays visible for ten seconds before the carousel loops. The offer card animation runs while that slide is visible and restarts when it returns. Its premium burgundy-and-gold styling uses layered lighting, refined card shadows and a polished CTA. Responsive typography keeps the offer headline balanced, and compact loan and EMI cards form an orbit around the central EMI card with a mobile-friendly arrangement. EMI amounts and savings in the animated card are illustrative only; actual lender terms, eligibility and approval vary.
