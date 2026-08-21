// ============================================================
// BLUE GEMS AND JEWELS — shared footer
// ============================================================
const FOOTER_HTML = `
<footer class="footer">
  <div class="wrap">
    <div class="footer-grid">
      <div>
        <div class="brand" style="margin-bottom:1.2rem;"><b>Blue Gems &amp; Jewels</b></div>
        <p class="muted" style="max-width:320px; font-size:.9rem;">Fine jewellery manufacturing for independent retailers across India.</p>
        <div class="footer-social">
          <a href="https://www.instagram.com/bluegemsandjewels" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1"/></svg>
          </a>
          <a href="#" aria-label="YouTube">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="M10.5 9.5l5 2.5-5 2.5z" fill="currentColor" stroke="none"/></svg>
          </a>
          <a href="#" aria-label="X (Twitter)">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 4l16 16M20 4L4 20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
          </a>
          <a href="https://in.linkedin.com/company/blue-gems-and-jewels-limited." aria-label="LinkedIn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M7.5 10v6.5M7.5 7.5v.01M11.5 16.5V10M11.5 12.5c0-1.5 1-2.5 2.5-2.5s2.5 1 2.5 2.5v4" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </a>
          <a href="https://in.pinterest.com/bluegemsnjewels/" target="_blank" rel="noopener noreferrer" aria-label="Pinterest">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M9.5 18c1-3.5 1.5-6 2-8.2m0 0c.4-1.8 3-2 3.8-.6 1 1.7.2 5.3-1.8 5.8-1 .3-1.8-.3-2-1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </a>
        </div>
      </div>
      <div>
        <h4>Explore</h4>
        <ul>
          <li><a href="about.html">About Us</a></li>
          <li><a href="innovation.html">Innovation</a></li>
          <li><a href="products.html">Product Categories</a></li>
          <li><a href="certifications.html">Certifications</a></li>
        </ul>
      </div>
      <div>
        <h4>Company</h4>
        <ul>
          <li><a href="events.html">Events &amp; Exhibitions</a></li>
          <li><a href="investor-relations.html">Investor Relations</a></li>
          <li><a href="contact.html">Contact Us</a></li>
        </ul>
      </div>
      <div>
        <h4>Trade Office</h4>
        <ul>
          <li class="muted">B/W 8030 Bharat Diamond Bourse,<br>opp NABARD Bank Head Office, BKC, Mumbai</li>
        </ul>
      </div>
      <div>
        <h4>Office Address</h4>
        <ul>
          <li class="muted">A42, Giriraj Industrial Estate,<br>Mahakali Caves Rd, opposite Ahura Centre,<br>Gundavali, Andheri East, Mumbai 400093</li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>&copy; 2026 Blue Gems and Jewels. Built on quality, integrity, reliability, and relationships that last.</span>
      <span>BIS Hallmark Registered &nbsp;&middot;&nbsp; GJEPC Member</span>
    </div>
  </div>
</footer>`;
document.addEventListener('DOMContentLoaded', () => {
  const footMount = document.getElementById('site-footer');
  if (footMount) footMount.innerHTML = FOOTER_HTML;
});
