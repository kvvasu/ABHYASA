import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const courses = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/courses' }),
  schema: z.object({
    title: z.string().min(1),
    summary: z.string().min(1),
    description: z.string().min(1),
    level: z.enum(['Beginner', 'Intermediate', 'Advanced']),
    duration: z.string().min(1),
    pricePaise: z.number().int().nonnegative(),
    featured: z.boolean().default(false),
    order: z.number().int().default(0),
    updated: z.coerce.date(),
    outcomes: z.array(z.string().min(1)).default([]),
    audience: z.array(z.string().min(1)).default([]),
    sample: z.boolean().default(true),
    modules: z
      .array(
        z.object({
          title: z.string().min(1),
          lessons: z.array(z.string().min(1)).min(1),
        }),
      )
      .min(1),
  }),
});

export const collections = { courses };
