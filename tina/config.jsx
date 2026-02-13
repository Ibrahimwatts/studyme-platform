import { defineConfig } from "tinacms";

export default defineConfig({
  branch: "main",
  clientId: process.env.TINA_CLIENT_ID || "Ov23liTbc0tY7XRKz3BD", // fallback for local
  clientSecret: process.env.TINA_CLIENT_SECRET || null, // Vercel env var only
  repo: "Ibrahimwatts/studyme-platform",
  baseBranch: "main",
  build: {
    publicFolder: "public",
    outputFolder: "admin",
  },
  media: {
    tina: {
      mediaRoot: "assets/images",
      publicFolder: "public",
    },
  },
  schema: {
    collections: [
      {
        label: "Video Lessons",
        name: "videos",
        path: "data/videos",
        format: "json",
        ui: {
          filename: {
            readonly: true,
            slugify: (values) => values.title?.toLowerCase().replace(/\s+/g, "-"),
          },
        },
        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "subject",
            label: "Subject",
            options: ["Physics", "Chemistry", "Biology", "Mathematics"],
            required: true,
          },
          {
            type: "string",
            name: "form",
            label: "Form/Grade",
            options: ["Form 1", "Form 2", "Form 3", "Form 4"],
            required: true,
          },
          {
            type: "string",
            name: "youtube_id",
            label: "YouTube ID",
            required: true,
          },
          {
            type: "number",
            name: "duration",
            label: "Duration (minutes)",
            required: true,
          },
          {
            type: "string",
            name: "description",
            label: "Description",
            ui: { component: "textarea" },
          },
        ],
      },
      {
        label: "Revision Notes",
        name: "notes",
        path: "data/notes",
        format: "mdx",
        ui: {
          filename: {
            readonly: true,
            slugify: (values) => values.title?.toLowerCase().replace(/\s+/g, "-"),
          },
        },
        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "subject",
            label: "Subject",
            options: ["Physics", "Chemistry", "Biology", "Mathematics"],
            required: true,
          },
          {
            type: "string",
            name: "form",
            label: "Form/Grade",
            options: ["Form 1", "Form 2", "Form 3", "Form 4"],
            required: true,
          },
          {
            type: "rich-text",
            name: "body",
            label: "Content",
            isBody: true,
            required: true,
          },
        ],
      },
      {
        label: "Live Classes",
        name: "classes",
        path: "data/classes",
        format: "json",
        ui: {
          filename: {
            readonly: true,
            slugify: (values) => values.topic?.toLowerCase().replace(/\s+/g, "-"),
          },
        },
        fields: [
          {
            type: "string",
            name: "subject",
            label: "Subject",
            options: ["Physics", "Chemistry", "Biology", "Mathematics"],
            required: true,
          },
          {
            type: "string",
            name: "time",
            label: "Day & Time (EAT)",
            required: true,
          },
          {
            type: "string",
            name: "topic",
            label: "Topic",
            required: true,
          },
          {
            type: "string",
            name: "link",
            label: "Link (Zoom/YouTube)",
            required: true,
          },
          {
            type: "string",
            name: "description",
            label: "Description",
            ui: { component: "textarea" },
          },
        ],
      },
    ],
  },
});