# Trip documents

Dump your files here (PDFs, images — flight tickets, booking confirmations,
insurance, etc.) and they show up on the **Documents** tab of the site.

## How it works

- Just drop files straight into `public/documents/` — no folders, no sorting:

  ```
  public/documents/
    ek762-jnb-dxb.pdf
    dh-naissance-confirmation.pdf
    travel-insurance.pdf
    covid-vax-card.png
  ```

- The **display name** comes from the filename: dashes/underscores become spaces,
  so `ek762-jnb-dxb.pdf` shows as “ek762 jnb dxb”. Name files how you want them read.

- After adding or removing files, regenerate the list:

  ```
  npm run documents
  ```

  (This also runs automatically before `npm run dev` and `npm run build`.)

The Documents page shows everything in one searchable list — type to fuzzy-search,
tap to download. Everything here is committed to the repo and served publicly, so
don't add anything you wouldn't want public.
