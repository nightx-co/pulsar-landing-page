import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import { defineConfig } from 'fumadocs-mdx/config';

export default defineConfig({
    mdxOptions: {
        remarkPlugins: (v) => [remarkMath, ...v],
        rehypePlugins: (v) => [rehypeKatex, ...v],
    },
});