/* ============================================================
   content.js — Loads JSON data files and renders page sections
   ============================================================ */

var Content = (function () {
  /* --- Utility functions ------------------------------ */
  function esc(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function fetchJSON(path) {
    return fetch(path).then(function (r) {
      if (!r.ok) throw new Error("Failed to load " + path);
      return r.json();
    });
  }

  /* --- SVG icons ------------------------------------- */
  var ICONS = {
    github:
      '<svg class="social__icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>',
    scholar:
      '<svg class="social__icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 24a12 12 0 100-24 12 12 0 000 24zM9.8 18.9a9.6 9.6 0 006.7-9c0-.15 0-.3-.05-.44a4.8 4.8 0 001.15-1.23 4.7 4.7 0 01-1.35.38 2.4 2.4 0 001.03-1.32 4.6 4.6 0 01-1.48.58 2.3 2.3 0 00-1.7-.75c-1.3 0-2.35 1.08-2.35 2.4 0 .2.02.38.06.55a6.6 6.6 0 01-4.85-2.5 2.5 2.5 0 00-.32 1.23c0 .83.41 1.56 1.03 1.98a2.2 2.2 0 01-1.06-.3v.03c0 1.17.8 2.14 1.88 2.36a2.2 2.2 0 01-1.06.04 2.37 2.37 0 002.2 1.68 4.64 4.64 0 01-3.47.99 6.5 6.5 0 003.6 1.07"/></svg>',
    linkedin:
      '<svg class="social__icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
  };

  /* ====================================================
     Home / Profile
     ==================================================== */
  function renderProfile(containerId) {
    var el = document.getElementById(containerId);
    if (!el) return;

    fetchJSON("data/profile.json")
      .then(function (d) {
        /* --- Hero section --- */
        var html = '<div class="hero">';

        /* Avatar */
        html +=
          '<div class="hero__avatar" aria-hidden="true">' +
          '<img class="hero__avatar-img" src="assets/img/profile.jpg" alt="' +
          esc(d.name) +
          '" onerror="this.style.display=\'none\';this.parentElement.appendChild(document.createTextNode(\'YY\'))">' +
          "</div>";

        /* Text */
        html += '<div class="hero__text">';
        html += '<h1 class="hero__name">' + esc(d.name) + "</h1>";
        html += '<p class="hero__title">' + esc(d.title) + "</p>";

        if (d.affiliation) {
          html +=
            '<p class="hero__affiliation"><a href="' +
            esc(d.affiliation.url) +
            '" target="_blank" rel="noopener">' +
            esc(d.affiliation.name) +
            "</a></p>";
        }

        if (d.researchInterests && d.researchInterests.length) {
          html += '<ul class="hero__research" aria-label="Research interests">';
          d.researchInterests.forEach(function (ri) {
            html += "<li>" + esc(ri) + "</li>";
          });
          html += "</ul>";
        }

        if (d.email) {
          html +=
            '<p class="hero__email"><a href="mailto:' +
            esc(d.email) +
            '">' +
            esc(d.email) +
            "</a></p>";
        }

        if (d.socialLinks && d.socialLinks.length) {
          html += '<ul class="social" aria-label="Academic social links">';
          d.socialLinks.forEach(function (link) {
            var icon = ICONS[link.icon] || "";
            html +=
              "<li>" +
              '<a class="social__link" href="' +
              esc(link.url) +
              '" target="_blank" rel="noopener">' +
              icon +
              " " +
              esc(link.platform) +
              "</a>" +
              "</li>";
          });
          html += "</ul>";
        }

        html += "</div></div>";

        /* --- Bio section --- */
        if (d.bio && d.bio.length) {
          html += '<div class="bio">';
          d.bio.forEach(function (p) {
            html += "<p>" + p + "</p>";
          });
          html += "</div>";
        }

        el.innerHTML = html;
      })
      .catch(function (err) {
        el.innerHTML =
          '<p class="blog-error">Failed to load profile. ' +
          esc(err.message) +
          "</p>";
        console.error("Profile load error:", err);
      });
  }

  /* ====================================================
     Publications
     ==================================================== */
  function renderPublications(containerId) {
    var el = document.getElementById(containerId);
    if (!el) return;

    fetchJSON("data/publications.json")
      .then(function (pubs) {
        if (!pubs.length) {
          el.innerHTML = '<p class="blog-empty">No publications yet.</p>';
          return;
        }

        var html = "";
        pubs.forEach(function (pub) {
          html +=
            '<li class="publication__card" data-category="' +
            esc(pub.category) +
            '">';

          /* Main row */
          html +=
            '<article class="publication__main" aria-expanded="false">';

          /* Thumbnail */
          html +=
            '<a class="publication__thumbnail-link" href="' +
            esc(pub.thumbnail) +
            '" target="_blank" rel="noopener" aria-label="View publication image">' +
            '<img class="publication__thumbnail" src="' +
            esc(pub.thumbnail) +
            '" alt="Publication thumbnail" loading="lazy" onerror="this.style.display=\'none\'">' +
            "</a>";

          /* Info */
          html += '<div class="publication__info">';
          html +=
            '<h3 class="publication__title">' + esc(pub.title) + "</h3>";

          /* Authors with self-highlight */
          html += '<p class="publication__authors">';
          var authorParts = [];
          pub.authors.forEach(function (a) {
            if (a.self) {
              authorParts.push(
                '<span class="publication__author--self">' +
                  esc(a.name) +
                  "</span>"
              );
            } else {
              authorParts.push(esc(a.name));
            }
          });
          html += authorParts.join(", ");
          html += "</p>";

          html += '<p class="publication__venue">' + esc(pub.venue) + "</p>";

          if (pub.links && pub.links.length) {
            html += '<div class="publication__links">';
            pub.links.forEach(function (link) {
              html +=
                '<a class="publication__link" href="' +
                esc(link.url) +
                '" target="_blank" rel="noopener">' +
                esc(link.label) +
                "</a>";
            });
            html += "</div>";
          }

          html += "</div>";

          html +=
            '<span class="publication__expand-icon" aria-hidden="true">▼</span>';
          html += "</article>";

          /* Abstract */
          html += '<div class="publication__abstract">';
          html +=
            '<p class="publication__abstract-text">' +
            esc(pub.abstract) +
            "</p>";
          html += "</div>";

          html += "</li>";
        });

        el.innerHTML = html;
      })
      .catch(function (err) {
        el.innerHTML =
          '<p class="blog-error">Failed to load publications. ' +
          esc(err.message) +
          "</p>";
        console.error("Publications load error:", err);
      });
  }

  /* ====================================================
     CV
     ==================================================== */
  function renderCV(containerId) {
    var el = document.getElementById(containerId);
    if (!el) return;

    fetchJSON("data/cv.json")
      .then(function (d) {
        var html = "";

        /* Download button */
        if (d.cvPdfUrl) {
          html +=
            '<a class="cv__download" href="' +
            esc(d.cvPdfUrl) +
            '" download>' +
            '<svg class="cv__download-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>' +
            " Download Full CV (PDF)" +
            "</a>";
        }

        function renderSection(title, entries) {
          if (!entries || !entries.length) return "";
          var s = '<div class="cv__section">';
          s += '<h3 class="cv__section-title">' + esc(title) + "</h3>";
          entries.forEach(function (e) {
            s += '<div class="cv__entry">';
            s += '<div class="cv__entry-header">';
            s +=
              '<span class="cv__entry-title">' + esc(e.title || e.degree || e.role) + "</span>";
            s +=
              '<span class="cv__entry-date">' + esc(e.date) + "</span>";
            s += "</div>";

            if (e.institution) {
              s +=
                '<p class="cv__entry-subtitle">' +
                esc(e.institution) +
                "</p>";
            }

            if (e.details && e.details.length) {
              s += '<div class="cv__entry-desc"><ul>';
              e.details.forEach(function (det) {
                s += "<li>" + esc(det) + "</li>";
              });
              s += "</ul></div>";
            }

            s += "</div>";
          });
          s += "</div>";
          return s;
        }

        html += renderSection("Education", d.education);
        html += renderSection("Research Experience", d.researchExperience);
        html += renderSection("Honors & Awards", d.awards);

        /* Skills */
        if (d.skills && d.skills.length) {
          html += '<div class="cv__section">';
          html += '<h3 class="cv__section-title">Skills</h3>';
          d.skills.forEach(function (sk) {
            html +=
              "<p><strong>" +
              esc(sk.label) +
              ":</strong> " +
              esc(sk.value) +
              "</p>";
          });
          html += "</div>";
        }

        el.innerHTML = html;
      })
      .catch(function (err) {
        el.innerHTML =
          '<p class="blog-error">Failed to load CV. ' +
          esc(err.message) +
          "</p>";
        console.error("CV load error:", err);
      });
  }

  /* --- Public API ----------------------------------- */
  return {
    renderProfile: renderProfile,
    renderPublications: renderPublications,
    renderCV: renderCV,
  };
})();
