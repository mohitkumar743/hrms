import { readFile } from "node:fs/promises";
import path from "node:path";

const PUBLIC_DIR = path.join(process.cwd(), "public");

const allowedPagePaths = new Set([
  "/",
  "/index.html",
  "/addon",
  "/addon/",
  "/addon/index.html",
  "/feature",
  "/feature/",
  "/feature/index.html",
  "/pricing",
  "/pricing/",
  "/pricing/index.html",
  "/contact-us",
  "/contact-us/",
  "/contact-us/index.html",
  "/404.html"
]);

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8"
};

const preloaderFallback = `<script>
(function () {
  function removeAttendoPreloader() {
    document.querySelectorAll(".pg-preloader, .nm-preloader, .lb-preloader").forEach(function (loader) {
      loader.classList.add("loaded", "preloaded");
      setTimeout(function () {
        if (loader.parentNode) loader.parentNode.removeChild(loader);
      }, 350);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      setTimeout(removeAttendoPreloader, 700);
    });
  } else {
    setTimeout(removeAttendoPreloader, 700);
  }

  setTimeout(removeAttendoPreloader, 2500);
})();
</script>`;

const externalLinkGuard = `<script>
(function () {
  var freeUseMessage = "This action is free to use.";
  var allowedPagePaths = [
    "/",
    "/index.html",
    "/addon",
    "/addon/",
    "/addon/index.html",
    "/feature",
    "/feature/",
    "/feature/index.html",
    "/pricing",
    "/pricing/",
    "/pricing/index.html",
    "/contact-us",
    "/contact-us/",
    "/contact-us/index.html"
  ];

  function isAllowedInternalPage(pathname) {
    var normalizedPath = pathname.endsWith("/")
      ? pathname
      : pathname.replace(/\/index\.html$/, "/");

    return allowedPagePaths.indexOf(pathname) !== -1 || allowedPagePaths.indexOf(normalizedPath) !== -1;
  }

  function isBlockedNavigation(value) {
    if (!value) return false;
    if (value.indexOf("#") === 0 || value.indexOf("mailto:") === 0 || value.indexOf("tel:") === 0) return false;

    try {
      var url = new URL(value, window.location.href);
      var extension = url.pathname.split("/").pop().indexOf(".") === -1
        ? ""
        : url.pathname.split(".").pop();

      if (url.protocol !== "http:" && url.protocol !== "https:") {
        return false;
      }

      if (url.origin !== window.location.origin) {
        return true;
      }

      if (extension && extension !== "html") {
        return false;
      }

      return !isAllowedInternalPage(url.pathname);
    } catch (error) {
      return false;
    }
  }

  function showFreeUseAlert(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    alert(freeUseMessage);
    return false;
  }

  function guardBlockedNavigations() {
    document.querySelectorAll("a[href]").forEach(function (link) {
      var href = link.getAttribute("href");

      if (!isBlockedNavigation(href)) return;

      link.setAttribute("data-original-href", href);
      link.setAttribute("href", "#");
      link.removeAttribute("target");
      link.addEventListener("click", showFreeUseAlert);
    });

    document.querySelectorAll("form[action]").forEach(function (form) {
      var action = form.getAttribute("action");

      if (!isBlockedNavigation(action)) return;

      form.setAttribute("data-original-action", action);
      form.setAttribute("action", "#");
      form.addEventListener("submit", showFreeUseAlert);
    });
  }

  document.addEventListener("click", function (event) {
    var link = event.target.closest && event.target.closest("a[href]");

    if (link && isBlockedNavigation(link.getAttribute("href"))) {
      showFreeUseAlert(event);
    }
  }, true);

  document.addEventListener("submit", function (event) {
    var form = event.target;

    if (form && form.getAttribute && isBlockedNavigation(form.getAttribute("action"))) {
      showFreeUseAlert(event);
    }
  }, true);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", guardBlockedNavigations);
  } else {
    guardBlockedNavigations();
  }
})();
</script>`;

function localFileForRequest(requestPath) {
  let cleanPath = decodeURIComponent(requestPath)
    .replace(/^\/+/, "")
    .replace(/\\/g, "/");

  cleanPath = cleanPath
    .replace(/^wp-content\//, "assets/")
    .replace(/^wp-includes\//, "vendor/wordpress/")
    .replace(/^wp-json\//, "data/wp-json/")
    .replace(/^cdn\.jsdelivr\.net\//, "vendor/cdn.jsdelivr/")
    .replace(
      /^themexriver\.com\/wp\/sassriver\/wp-content\//,
      "external/themexriver/wp/sassriver/assets/"
    );

  if (!cleanPath || cleanPath === "index.html") {
    return path.join(PUBLIC_DIR, "index.html");
  }

  const hasExtension = path.extname(cleanPath) !== "";
  return path.join(PUBLIC_DIR, hasExtension ? cleanPath : cleanPath, hasExtension ? "" : "index.html");
}

function isAllowedPageRequest(requestPath) {
  const normalizedPath = requestPath.endsWith("/")
    ? requestPath
    : requestPath.replace(/\/index\.html$/, "/");
  const extension = path.extname(requestPath);

  if (extension && extension !== ".html") {
    return true;
  }

  return allowedPagePaths.has(requestPath) || allowedPagePaths.has(normalizedPath);
}

function htmlInjectionFor(normalizedHtml) {
  const injections = [];

  if (!normalizedHtml.includes("attendo-preloader-fallback")) {
    injections.push(preloaderFallback.replace("<script>", '<script id="attendo-preloader-fallback">'));
  }

  if (!normalizedHtml.includes("attendo-external-link-guard")) {
    injections.push(externalLinkGuard.replace("<script>", '<script id="attendo-external-link-guard">'));
  }

  return injections.join("");
}

function normalizeHtml(html) {
  const normalized = html
    .replaceAll("https://trustedhrm.com/", "/")
    .replaceAll("http://trustedhrm.com/", "/")
    .replaceAll("https://www.trustedhrm.com/", "/")
    .replaceAll("http://www.trustedhrm.com/", "/")
    .replaceAll("https://attendo.in/", "/")
    .replaceAll("http://attendo.in/", "/")
    .replaceAll("https://www.attendo.in/", "/")
    .replaceAll("http://www.attendo.in/", "/")
    .replaceAll(
      "https://themexriver.com/wp/sassriver/wp-content/",
      "/external/themexriver/wp/sassriver/assets/"
    )
    .replaceAll(
      "http://themexriver.com/wp/sassriver/wp-content/",
      "/external/themexriver/wp/sassriver/assets/"
    )
    .replaceAll("/wp-content/", "/assets/")
    .replaceAll("/wp-includes/", "/vendor/wordpress/")
    .replaceAll("/wp-json/", "/data/wp-json/")
    .replaceAll("/cdn.jsdelivr.net/", "/vendor/cdn.jsdelivr/")
    .replaceAll(
      "/themexriver.com/wp/sassriver/wp-content/",
      "/external/themexriver/wp/sassriver/assets/"
    );

  const injections = htmlInjectionFor(normalized);

  if (!injections) {
    return normalized;
  }

  return normalized.replace("</body>", `${injections}</body>`);
}

export async function GET(request) {
  const url = new URL(request.url);

  if (!isAllowedPageRequest(url.pathname)) {
    return notFoundResponse();
  }

  const filePath = path.normalize(localFileForRequest(url.pathname));

  if (!filePath.startsWith(PUBLIC_DIR)) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const extension = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[extension] ?? "application/octet-stream";
    const buffer = await readFile(filePath);

    if (extension === ".html") {
      return new Response(normalizeHtml(buffer.toString("utf8")), {
        headers: { "content-type": contentType }
      });
    }

    return new Response(buffer, {
      headers: { "content-type": contentType }
    });
  } catch {
    return notFoundResponse();
  }
}

async function notFoundResponse() {
  const fallbackPath = path.join(PUBLIC_DIR, "404.html");

  try {
    const html = await readFile(fallbackPath, "utf8");
    return new Response(normalizeHtml(html), {
      status: 404,
      headers: { "content-type": "text/html; charset=utf-8" }
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

export async function POST(request) {
  const url = new URL(request.url);

  if (url.pathname.startsWith("/cdn-cgi/rum")) {
    return new Response(null, { status: 204 });
  }

  return new Response("Method not allowed", { status: 405 });
}
