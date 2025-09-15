/**
 * src/utils/templateRenderer.js
 * Simple, safe template renderer used by /api/template/render
 */

export function renderTemplate(template = "", customer = {}) {
  try {
    if (typeof template !== "string") template = String(template || "");
    const name = (customer && (customer.name || customer.fullName || customer.displayName || customer.email)) || "";
    // basic replacements (add more placeholders if needed)
    return template
      .replace(/\{\{\s*name\s*\}\}/g, name)
      .replace(/\{\{\s*email\s*\}\}/g, customer?.email || "")
      .replace(/\{\{\s*phone\s*\}\}/g, customer?.phone || "");
  } catch (err) {
    // on any failure return the raw template as a fallback
    return String(template || "");
  }
}
