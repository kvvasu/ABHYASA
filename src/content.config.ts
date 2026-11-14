import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const courses = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/courses' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    description: z.string(),
    level: z.enum(['Beginner', 'Intermediate', 'Advanced']),
    duration: z.string(),
    pricePaise: z.number().int().nonnegative(),
    featured: z.boolean().default(false),
    order: z.number().int().default(0),
    updated: z.coerce.date(),
    outcomes: z.array(z.string()).default([]),
    audience: z.array(z.string()).default([]),
    sample: z.boolean().default(true),
    modules: z.array(
      z.object({
        title: z.string(),
        lessons: z.array(z.string()),
      }),
    ),
  }),
});

export const collections = { courses };
