/* ============================================================
   blog.js — Markdown parser and blog post renderer
   ============================================================ */

var Blog = (function () {
  /* --- Simple Markdown → HTML converter --------------- */
  function parse(md) {
    if (!md) return "";

    /* Protect display math blocks $$...$$ before parsing */
    var displayMath = [];
    md = md.replace(/\$\$([\s\S]*?)\$\$/g, function (_, math) {
      displayMath.push(math.trim());
      return "%%DISPLAYMATH" + (displayMath.length - 1) + "%%";
    });

    var lines = md.split("\n");
    var html = "";
    var i = 0;

    while (i < lines.length) {
      var line = lines[i];

      /* Display math placeholder — render as display math */
      var dmMatch = line.match(/^%%DISPLAYMATH(\d+)%%$/);
      if (dmMatch) {
        var idx = parseInt(dmMatch[1]);
        html += "<p>$$" + displayMath[idx] + "$$</p>\n";
        i++;
        continue;
      }

      /* Fenced code block: ``` ... ``` */
      if (/^```/.test(line)) {
        var lang = line.slice(3).trim();
        var codeLines = [];
        i++;
        while (i < lines.length && !/^```/.test(lines[i])) {
          codeLines.push(escapeHtml(lines[i]));
          i++;
        }
        var langAttr = lang ? ' class="language-' + lang + '"' : "";
        html += "<pre><code" + langAttr + ">" + codeLines.join("\n") + "</code></pre>\n";
        i++;
        continue;
      }

      /* Blank line */
      if (/^\s*$/.test(line)) {
        html += "\n";
        i++;
        continue;
      }

      /* Heading: # to ###### */
      var headingMatch = line.match(/^(#{1,6})\s+(.+)/);
      if (headingMatch) {
        var level = headingMatch[1].length;
        html += "<h" + level + ">" + inlineParse(headingMatch[2]) + "</h" + level + ">\n";
        i++;
        continue;
      }

      /* Horizontal rule */
      if (/^(-{3,}|_{3,}|\*{3,})\s*$/.test(line)) {
        html += "<hr>\n";
        i++;
        continue;
      }

      /* Blockquote */
      if (/^>\s/.test(line)) {
        var quoteLines = [];
        while (i < lines.length && /^>\s/.test(lines[i])) {
          quoteLines.push(lines[i].replace(/^>\s?/, ""));
          i++;
        }
        html += "<blockquote>" + parse(quoteLines.join("\n")) + "</blockquote>\n";
        continue;
      }

      /* Unordered list */
      if (/^[\-\*\+]\s/.test(line)) {
        html += "<ul>\n";
        while (i < lines.length && /^[\-\*\+]\s/.test(lines[i])) {
          var item = lines[i].replace(/^[\-\*\+]\s/, "");
          /* Check for nested content (indented lines) */
          var nested = [];
          i++;
          while (i < lines.length && /^\s{2,}(?![\-\*\+])/.test(lines[i]) && !/^\s*$/.test(lines[i])) {
            nested.push(lines[i].replace(/^\s{2,}/, ""));
            i++;
          }
          if (nested.length > 0) {
            html += "<li>" + inlineParse(item) + parse(nested.join("\n")) + "</li>\n";
          } else {
            html += "<li>" + inlineParse(item) + "</li>\n";
          }
        }
        html += "</ul>\n";
        continue;
      }

      /* Ordered list */
      if (/^\d+\.\s/.test(line)) {
        html += "<ol>\n";
        while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
          var olItem = lines[i].replace(/^\d+\.\s/, "");
          i++;
          html += "<li>" + inlineParse(olItem) + "</li>\n";
        }
        html += "</ol>\n";
        continue;
      }

      /* Paragraph — consume until blank line or special line */
      var paraLines = [];
      while (i < lines.length && !/^\s*$/.test(lines[i]) && !/^(#{1,6}\s|```|>|[\-\*\+]\s|\d+\.\s|-{3,}|_{3,}|\*{3,})/.test(lines[i])) {
        paraLines.push(lines[i]);
        i++;
      }
      if (paraLines.length > 0) {
        html += "<p>" + inlineParse(paraLines.join(" ")) + "</p>\n";
      }
    }

    return html;
  }

  /* --- Math protection: preserve $...$ and $$...$$ from inline parsing */
  var mathBlocks = [];

  function protectMath(text) {
    mathBlocks = [];
    /* Protect display math $$...$$ first, then inline $...$ */
    text = text.replace(/\$\$([\s\S]*?)\$\$/g, function (_, math) {
      mathBlocks.push(math);
      return "%%MATHBLOCK" + (mathBlocks.length - 1) + "%%";
    });
    text = text.replace(/\$([^\$]+)\$/g, function (_, math) {
      mathBlocks.push(math);
      return "%%MATHINLINE" + (mathBlocks.length - 1) + "%%";
    });
    return text;
  }

  function restoreMath(text) {
    text = text.replace(/%%MATHBLOCK(\d+)%%/g, function (_, i) {
      return "$$" + mathBlocks[parseInt(i)] + "$$";
    });
    text = text.replace(/%%MATHINLINE(\d+)%%/g, function (_, i) {
      return "$" + mathBlocks[parseInt(i)] + "$";
    });
    return text;
  }

  /* --- Inline parsing: bold, italic, code, links, images */
  function inlineParse(text) {
    if (!text) return "";

    /* Protect math from being mangled by markdown parsing */
    text = protectMath(text);

    /* Images ![alt](url) must come before links */
    text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy">');

    /* Links [text](url) */
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    /* Bold **text** */
    text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

    /* Italic *text* (but not **) */
    text = text.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>");

    /* Inline code `text` */
    text = text.replace(/`([^`]+)`/g, "<code>$1</code>");

    /* Restore math expressions */
    text = restoreMath(text);

    return text;
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* --- Load posts manifest and render blog list -------- */
  function loadBlogList(containerId, basePath) {
    var container = document.getElementById(containerId);
    if (!container) return;
    basePath = basePath || "";

    fetch(basePath + "posts.json")
      .then(function (r) {
        if (!r.ok) throw new Error("posts.json not found");
        return r.json();
      })
      .then(function (posts) {
        if (!posts.length) {
          container.innerHTML = '<p class="blog-empty">No posts yet.</p>';
          return;
        }
        var html = '<ul class="blog__list" role="list">';
        posts.forEach(function (post) {
          html +=
            '<li>' +
            '<a class="blog__card-link" href="' + basePath + 'post.html?post=' +
            encodeURIComponent(post.file) +
            '">' +
            '<article class="blog__card">' +
            '<div class="blog__header">' +
            '<div>' +
            '<h3 class="blog__title">' +
            escapeHtml(post.title) +
            "</h3>" +
            '<p class="blog__summary">' +
            escapeHtml(post.summary) +
            "</p>" +
            "</div>" +
            '<time class="blog__date" datetime="' +
            escapeHtml(post.date) +
            '">' +
            formatDate(post.date) +
            "</time>" +
            "</div>" +
            "</article>" +
            "</a>" +
            "</li>";
        });
        html += "</ul>";
        container.innerHTML = html;
      })
      .catch(function (err) {
        container.innerHTML =
          '<p class="blog-error">Failed to load blog posts. <br><small>Run with a local server: <code>python -m http.server 8080</code></small></p>';
        console.error("Blog load error:", err);
      });
  }

  /* --- Load and render a single post ------------------ */
  function loadPost(containerId, filename) {
    var container = document.getElementById(containerId);
    if (!container) return Promise.resolve();

    if (!filename) {
      container.innerHTML = "<p>No post specified.</p>";
      return Promise.resolve();
    }

    /* Load posts.json to get metadata */
    return fetch("posts.json")
      .then(function (r) { return r.json(); })
      .then(function (posts) {
        var meta = null;
        for (var i = 0; i < posts.length; i++) {
          if (posts[i].file === filename) {
            meta = posts[i];
            break;
          }
        }

        /* Fetch the .md file */
        return fetch("posts/" + filename).then(function (r) {
          if (!r.ok) throw new Error("Post not found: " + filename);
          return r.text();
        }).then(function (md) {
          return { meta: meta, md: md };
        });
      })
      .then(function (data) {
        var html = "";
        if (data.meta) {
          html += '<header class="post__header">';
          html += '<h1 class="post__title">' + escapeHtml(data.meta.title) + "</h1>";
          html += '<time class="post__date" datetime="' + escapeHtml(data.meta.date) + '">' + formatDate(data.meta.date) + "</time>";
          html += "</header>";
        }
        html += '<div class="post__content">';
        html += parse(data.md);
        html += "</div>";
        container.innerHTML = html;

        /* Apply minimal syntax highlighting via CSS classes */
        if (window.hljs) {
          document.querySelectorAll("pre code").forEach(function (block) {
            window.hljs.highlightElement(block);
          });
        }
      })
      .catch(function (err) {
        container.innerHTML = '<p class="blog-error">Could not load post. ' + escapeHtml(err.message) + '</p>';
        console.error("Post load error:", err);
      });
  }

  function formatDate(dateStr) {
    if (!dateStr) return "";
    var d = new Date(dateStr);
    var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return months[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
  }

  return {
    parse: parse,
    loadBlogList: loadBlogList,
    loadPost: loadPost,
  };
})();
