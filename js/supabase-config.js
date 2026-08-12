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
