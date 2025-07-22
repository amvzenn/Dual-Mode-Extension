// cookies.js

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("cookieSearch");
  const cookieList = document.getElementById("cookieList");

  if (!searchInput || !cookieList) return;

  // Store domains and cookies in memory
  let domainMap = new Map();

  // Fetch all cookies and populate the list
  chrome.cookies.getAll({}, (cookies) => {
    cookies.forEach(cookie => {
      const domain = cookie.domain.replace(/^\./, ""); // Remove leading dot
      if (!domainMap.has(domain)) {
        domainMap.set(domain, []);
      }
      domainMap.get(domain).push(cookie);
    });

    renderDomains(Array.from(domainMap.keys()));
  });

  // Renders domains to the cookie list
  function renderDomains(domains) {
    cookieList.innerHTML = "";

    if (domains.length === 0) {
      cookieList.innerHTML = "<li>No cookies found.</li>";
      return;
    }

    domains.forEach(domain => {
      const li = document.createElement("li");
      li.className = "cookie-item";

      const span = document.createElement("span");
      span.textContent = domain;

      const btn = document.createElement("button");
      btn.textContent = "❌";
      btn.className = "delete-btn";
      btn.addEventListener("click", () => deleteCookiesForDomain(domain));

      li.appendChild(span);
      li.appendChild(btn);
      cookieList.appendChild(li);
    });
  }

  // Delete all cookies for a given domain
  function deleteCookiesForDomain(domain) {
    const cookiesToDelete = domainMap.get(domain);
    if (!cookiesToDelete) return;

    let deletedCount = 0;
    cookiesToDelete.forEach(cookie => {
      const url = (cookie.secure ? "https://" : "http://") + domain + cookie.path;

      chrome.cookies.remove({
        url: url,
        name: cookie.name
      }, () => {
        deletedCount++;
        if (deletedCount === cookiesToDelete.length) {
          domainMap.delete(domain);
          renderDomains(Array.from(domainMap.keys()));
        }
      });
    });
  }

  // Filter domains based on search
  searchInput.addEventListener("input", () => {
    const filter = searchInput.value.trim().toLowerCase();
    const filtered = Array.from(domainMap.keys()).filter(domain =>
      domain.toLowerCase().includes(filter)
    );
    renderDomains(filtered);
  });
});
