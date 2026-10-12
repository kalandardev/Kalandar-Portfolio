# QALANDAR® — Luxury Portfolio V3

A responsive, vanilla HTML/CSS/JavaScript portfolio with a solid-black/champagne-gold design, personal portrait reveal, EN/RU/DE/UZ translations, live public GitHub repository cards, a downloadable CV draft and Formspree contact.

## Start in VS Code

1. Unzip the project and open the `Qalandar_Luxury_Portfolio_V3` folder in VS Code.
2. Run `index.html` with VS Code **Live Server** or **Live Preview**. No build tooling needed.
3. Try the EN/RU/DE/UZ language selector, the portrait hover/tap, Projects filters, and the Contact form.

## File structure

```text
Qalandar_Luxury_Portfolio_V3/
  index.html                  Markup and real project/CV links
  style.css                   Black × gold theme, responsive styles, animations
  translations.js             All editable strings in EN/RU/DE/UZ
  script.js                   Languages, GitHub API, Formspree, navigation, effects
  favicon.svg                 Gold favicon
  assets/
    profile.jpg               Temporary portrait cropped from provided GitHub screenshot
    Qalandar-Kalandarov-CV-Draft.pdf   One-page CV DRAFT
```

## Things to personalize before publishing

- **Portrait:** Replace `assets/profile.jpg` with your original high-resolution portrait, keeping the same filename. The included portrait was cropped from an earlier screenshot; it is not the original image quality.
- **CV:** `assets/Qalandar-Kalandarov-CV-Draft.pdf` is explicitly a **draft**, made only from known information. Review every statement; add your own verified experience, qualifications, an email address and (optional) phone number. Replace the PDF with your final CV using the same filename. The download button works already.
- **Four languages:** Edit text in `translations.js`; don't edit English text alone in `index.html` or other languages won't update. Change translated text in all four dictionaries if needed.
- **Contact:** `FORM_ENDPOINT` in `script.js`, and the `action` attribute in `index.html`, both point to `https://formspree.io/f/xwlvqzez`. Keep both synchronized. Confirm your recipient email and form status in Formspree dashboard.
- **Repository links:** The site calls `https://api.github.com/users/kalandardev/repos?per_page=100&type=owner&sort=updated` from each visitor's browser. **Only public repositories** are shown. Currently the GitHub profile README repository is public; `Information-IT`, `Programmer0910` and `AIM` are private. To add the new portfolio to the dynamic section, push it to your own **public** repo. GitHub API rate-limits may temporarily stop the list loading; a link to the profile is shown instead.
- **Deployment:** This package does NOT push anything to your GitHub account automatically.

## Publish with GitHub Pages

To publish at `https://kalandardev.github.io/`:

1. Create a **public** repository named **`kalandardev.github.io`** in your GitHub account. Do not delete or rename your existing public `kalandardev` profile README repository.
2. Upload all source files and the `assets` folder into the new repository root. Preserve filenames and folder paths.
3. Repository **Settings → Pages → Build and deployment**: Source **Deploy from a branch**, Branch **main**, Folder **/(root)**, Save.
4. Wait for the Pages workflow to finish, then open `https://kalandardev.github.io/`. Publication and SSL may take a few minutes.

For any other repository named `luxury-portfolio`, the default URL is `https://kalandardev.github.io/luxury-portfolio/`.

## Technical notes

- The UI supports keyboard navigation, reduced-motion preferences, localized aria labels and native HTML form validation.
- The contact form does not pretend to succeed: it displays a success state only after Formspree returns an HTTP success response. Test delivery through the Formspree dashboard.
- No GitHub authentication token is needed for public repositories; the listing uses the public GitHub REST API and excludes private repos.
- GitHub API errors show a fallback profile link. The portfolio does not falsely claim that profile README code is a full web application.
- No frameworks, backend or npm dependencies are required.
