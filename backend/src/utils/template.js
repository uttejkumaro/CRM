export function renderTemplate(template, customer) {
  return template.replace(/\{\{\s*name\s*\}\}/g, customer.name || "");
}
