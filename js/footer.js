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
      </div>
      <div>
        <h4>Explore</h4>
        <ul>
          <li><a href="about.html">About Us</a></li>
          <li><a href="manufacturing.html">Manufacturing</a></li>
          <li><a href="craftsmanship.html">Craftsmanship</a></li>
          <li><a href="workforce.html">Workforce &amp; Machinery</a></li>
        </ul>
      </div>
      <div>
        <h4>Company</h4>
        <ul>
          <li><a href="certifications.html">Certifications</a></li>
          <li><a href="events.html">Events &amp; Exhibitions</a></li>
          <li><a href="products.html">Product Categories</a></li>
          <li><a href="contact.html">Visit the Factory</a></li>
        </ul>
      </div>
      <div>
        <h4>Trade Office</h4>
        <ul>
          <li class="muted">Bharat Diamond Bourse,<br>BKC, Mumbai</li>
          <li class="muted" style="margin-top:1rem;">Manufacturing Facility,<br>Andheri East, Mumbai</li>
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
