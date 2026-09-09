import { TOOLS, TOOL_BY_SLUG, relatedTools, toolsByCategory, featuredTools } from '../src/registry/index.ts';
import { CATEGORIES, CATEGORY_BY_ID } from '../src/registry/categories.ts';

let errors = 0;
const fail = (m: string) => { console.error('FAIL:', m); errors++; };

// 1. unique slugs
const slugs = new Set<string>();
for (const t of TOOLS) {
  if (slugs.has(t.slug)) fail(`duplicate slug ${t.slug}`);
  slugs.add(t.slug);
}
// 2. related slugs exist
for (const t of TOOLS) for (const r of t.related) if (!TOOL_BY_SLUG[r]) fail(`${t.slug} → related "${r}" missing`);
// 3. categories valid
for (const t of TOOLS) if (!CATEGORY_BY_ID[t.category]) fail(`${t.slug} → bad category ${t.category}`);
// 4. every category has >=1 tool (or is documented as future)
for (const c of CATEGORIES) if (toolsByCategory(c.id).length === 0) fail(`category ${c.id} has no tools`);
// 5. related tools non-empty for every tool
for (const t of TOOLS) if (relatedTools(t.slug).length === 0) fail(`${t.slug} has no resolvable related tools`);
// 6. meta completeness for SEO
for (const t of TOOLS) {
  if (!t.name || !t.tagline || !t.description) fail(`${t.slug} missing name/tagline/description`);
  if (t.steps.length < 2) fail(`${t.slug} too few steps`);
  if (t.features.length < 3) fail(`${t.slug} too few features`);
  if (t.faq.length < 2) fail(`${t.slug} too few FAQs`);
  if (t.tags.length < 4) fail(`${t.slug} too few tags`);
}
// 7. featured tools exist
if (featuredTools().length < 4) fail('need at least 4 featured tools');
console.log(`Tools: ${TOOLS.length} | Categories: ${CATEGORIES.length} | Featured: ${featuredTools().length}`);
console.log(errors === 0 ? 'REGISTRY OK' : `${errors} ERRORS`);
process.exit(errors === 0 ? 0 : 1);
