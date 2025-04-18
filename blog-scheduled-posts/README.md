# Blog Scheduled Posts

This directory contains scheduled blog posts in markdown format that will be automatically published by the automation scripts.

## How it works

1. Create a markdown file named `blog-YYYY-MM-DD.md` for the date you want it published
2. The automation script will pick up files matching the current date
3. Files will be copied to the web-marketing-seo directory and converted to HTML
4. The sitemap will be automatically updated

## Template

```md
# Title of Your Blog Post (YYYY-MM-DD)

Your introduction paragraph goes here.

## Subheading

Content paragraphs...

> Visit [https://rapidwebdevelop.com](https://rapidwebdevelop.com)
```