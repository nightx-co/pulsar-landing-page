import type { BaseLayoutProps, LinkItemType } from 'fumadocs-ui/layouts/shared';
import { appName, gitConfig } from './shared';

export function baseOptions(): BaseLayoutProps {
    return {
        nav: {
            title: appName,
        },
        githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
        links: [
            {
                text: 'Documentation',
                url: '/docs/getting-started/introduction',
                active: 'nested-url', // Keeps link active when under /docs/*
            },
            {
                text: 'GitHub',
                url: 'https://github.com',
                external: true,
            },
            // 3. Dropdown menu link
            {
                text: 'Resources',
                type: 'menu',
                items: [
                {
                    text: 'Blog',
                    description: 'Read our latest posts',
                    url: '/blog',
                },
                {
                    text: 'Changelog',
                    description: 'See recent updates',
                    url: '/changelog',
                },
                ],
            },
            // 4. Custom JSX component (e.g., custom button or icon link)
            {
                type: 'custom',
                children: (
                <a
                    href="/contact"
                    className="rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground font-medium"
                >
                    Contact
                </a>
                ),
            }
        ],
        
    }
}