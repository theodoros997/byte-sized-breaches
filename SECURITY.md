# Security and privacy

## What this site does and doesn't do

- It's a static site: HTML, CSS and JavaScript files only. There is no server code, database, login or form.
- There are **no ads, cookies or third-party scripts**. Fonts are stored in this repository (`fonts/`).
- **Anonymous visit counts:** pages send a small image request to [GoatCounter](https://www.goatcounter.com), a privacy-friendly, open-source counter. It records the page or chapter viewed, the site you came from (if any), and the browser details every web request carries. GoatCounter doesn't use cookies, doesn't store IP addresses or track you across sites, and the site can't identify you. See [GoatCounter's privacy policy](https://www.goatcounter.com/help/privacy).
- Nothing is counted if your browser sends **Do Not Track** or **Global Privacy Control**, or if JavaScript is off.
- Each page has a Content Security Policy that only allows scripts, styles and fonts from the site itself (and images from GoatCounter, for the counts above), and a no-referrer policy.
- The games run entirely in your browser and store nothing.
- The "Support on Ko-fi" button is a plain link. Nothing from Ko-fi loads on these pages. Ko-fi's own site and privacy policy apply only if you click it, and no referrer is sent.
- The pages describe real attacks in plain language. They contain **no exploit code** and nothing that could be used to attack a device.

## Reporting a problem

- **A security issue with the site itself** (for example, a way to inject content into a page): please use GitHub's [private vulnerability reporting](https://github.com/theodoros997/byte-sized-breaches/security/advisories/new) instead of a public issue.
- **A factual mistake or broken source link**: please [open an issue](https://github.com/theodoros997/byte-sized-breaches/issues).
