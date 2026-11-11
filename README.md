# SIR AIMAN SITE

Student-friendly Mathematics learning hub for **Math SM015** and **Math SM025**.

## Features
- Responsive mobile-first design.
- Subjects → Chapters → Subchapters.
- Search by keywords or material title.
- Filters for material type (Infographics, Videos, Worked Examples & Solutions), subject, chapter, and subchapter.
- Static GitHub Pages hosting; no database or login required.

## Publish on GitHub Pages
1. Open repository **Settings → Pages**.
2. Under **Build and deployment**, select **Deploy from a branch**.
3. Choose **main** and **/(root)** and Save.
4. After successful deployment, visit: https://irkifnamia.github.io/siraiman-site/

## Updating using ChatGPT
All teaching data is stored in `content.js`. Tell ChatGPT to update your GitHub repository with new subjects/chapters/subchapters or resources. When the changes are committed to `main`, GitHub Pages automatically republishes the website.

The current chapter and subchapter labels are **provisional placeholders**, not the verified SM015/SM025 syllabus. Replace them with the real syllabus before publishing to students.

## Adding a resource
Edit the `resources` array in `content.js`:

```js
{
  id: "sm015-infographic-one",
  title: "Understanding Graphs",
  type: "infographic", // infographic | video | solution
  subject: "SM015",
  chapter: "sm015-1",
  subchapter: "sm015-1-1",
  description: "Visual introduction to graphs",
  tags: ["graphs", "functions"],
  url: "assets/infographics/graphs.png"
}
```

For videos, use a public video URL (e.g. YouTube). For solutions, use `steps: [{title:"Step 1",detail:"..."}, ...]`. Resources initially remain empty, avoiding fake or broken learning links.

## Tech stack
Pure HTML, CSS and JavaScript. No build tools, Supabase, Neon, or OpenAI API required.
