// ============================================================
// SUPABASE STORAGE — public image helper
// ============================================================
// Bucket "images" is public, so files can be loaded with a plain URL —
// no API key or SDK needed. To show an image anywhere in the site,
// give the <img> a `data-img` attribute with the path inside the
// bucket, e.g.:
//   <img data-img="hero/about.png" alt="...">
// main.js fills in the real src on page load.
const SUPABASE_URL = 'https://czgytzchdqqigmrfwekp.supabase.co';
const SUPABASE_IMAGES_BUCKET = 'Images';

function supabaseImage(path) {
  return `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_IMAGES_BUCKET}/${path}`;
}

// Bucket "documents" for downloadable PDFs (financial statements, reports, etc).
// Give a download link `data-file="financial-statements/2022-2023.pdf"` and
// main.js fills in the real href on page load.
const SUPABASE_DOCS_BUCKET = 'documents';

function supabaseFile(path) {
  return `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_DOCS_BUCKET}/${path}`;
}
