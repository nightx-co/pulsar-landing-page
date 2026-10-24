import { llms, loader } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';
import { docsRoute } from './shared';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';
import { defineDocs } from 'fumadocs-mdx/macro';
import { applyMdxPreset } from 'fumadocs-mdx/config';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

const docs = defineDocs({
    dir: 'content/docs',
    docs: {
        schema: pageSchema,
        postprocess: {
            includeProcessedMarkdown: true,
        },
        mdxOptions: applyMdxPreset({
      remarkPlugins: (v) => [remarkMath, ...v],
      rehypePlugins: (v) => [rehypeKatex, ...v],
    }),
    },
    meta: {
        schema: metaSchema,
    },
});

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
    baseUrl: docsRoute,
    source: docs.toFumadocsSource(),
    plugins: [lucideIconsPlugin()],
});

export const docsLlms = llms(source, {
  renderPage: async (page) => `# ${page.data.title} (${page.url})
  ${await page.data.getText('processed')}`,
});
