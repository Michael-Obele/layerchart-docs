# Route to GitHub Mapping Strategy

To ensure resilience against website structure changes and to provide the most accurate code examples, we will use a "GitHub-first" strategy for code retrieval.

## The Mapping Logic

The LayerChart website (`www.layerchart.com`) maps directly to the GitHub repository (`techniq/layerchart`) structure.

### Base URLs

- **Website Base**: `https://www.layerchart.com`
- **GitHub Raw Base**: `https://raw.githubusercontent.com/techniq/layerchart/main/packages/layerchart/src/routes`

### Mapping Rules

1. **Documentation & Example Pages (Usage)**

   - **Purpose**: Shows how to use the component/feature (the "Page source").
   - **Route**: `/docs/[category]/[slug]`
   - **GitHub Path**: `packages/layerchart/src/routes/docs/[category]/[slug]/+page.svelte`
   - **Example**:
     - Web: `/docs/examples/Columns`
     - GitHub: `packages/layerchart/src/routes/docs/examples/Columns/+page.svelte`

2. **Component Implementation (Source)**

   - **Purpose**: Shows the internal implementation and props of the component.
   - **Route**: `/docs/components/[slug]`
   - **GitHub Path**: `packages/layerchart/src/lib/components/[Slug].svelte` (Note: Slug usually matches component name, case-sensitive)
   - **Example**:
     - Web: `/docs/components/Pie`
     - GitHub: `packages/layerchart/src/lib/components/Pie.svelte`

3. **Root Pages**
   - Route: `/getting-started`
   - GitHub Path: `packages/layerchart/src/routes/docs/getting-started/+page.svelte`

## Implementation Details

### `get_source` Tool

This tool will take a website URL (or route path) and an optional `type` parameter.

- **Parameters**:

  - `url`: The website URL or route path (e.g., `/docs/components/Pie`).
  - `type`: `"usage"` (default) or `"implementation"`.

- **Logic**:
  ```typescript
  function getGitHubUrl(
    route: string,
    type: "usage" | "implementation" = "usage"
  ): string {
    const path = route.replace("https://www.layerchart.com", "");

    if (type === "implementation" && path.includes("/components/")) {
      // Extract component name from path
      const componentName = path.split("/").pop(); // e.g., "Pie"
      return `https://raw.githubusercontent.com/techniq/layerchart/main/packages/layerchart/src/lib/components/${componentName}.svelte`;
    }

    // Default to usage (the +page.svelte file)
    return `https://raw.githubusercontent.com/techniq/layerchart/main/packages/layerchart/src/routes${path}/+page.svelte`;
  }
  ```

### `get_doc` Tool (Hybrid)

This tool will:

1. **Fetch Rendered Content**: Scrape `www.layerchart.com` using `fetch` + `cheerio` to get the readable documentation text (Markdown).
2. **Fetch Source Code**: Use the mapping logic to fetch the raw `+page.svelte` from GitHub.
3. **Combine**: Return a structured response with both the text and the raw code.

## Fallback Strategy

If the GitHub fetch fails (e.g., file moved), the tool should fallback to extracting the code blocks from the rendered HTML scraped from the website.
