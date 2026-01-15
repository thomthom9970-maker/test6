New antibiotic generator
========================

Usage
-----

From the project root run:

```bash
node scripts/new-antibiotic.js "Name of Antibiotic"
```

Options
-------

- `--force` : overwrite an existing target page if present.

What it does
------------

- Copies `template-antibiotic.html` if present, otherwise `cloxaciclinne.html`.
- Replaces title and headings with the provided name.
- Creates backups of `antibiotiques.html` and `search.js` before editing.
- Inserts a link into `antibiotiques.html` (if found) and adds a `SITE_PAGES` entry in `search.js`.

Safety
------

The script avoids overwriting existing pages unless `--force` is used and writes `.bak.TIMESTAMP` backups of files it modifies.
