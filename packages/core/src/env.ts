import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().nonempty(),
  S3_BUCKET: z.string().nonempty(),
  S3_REGION: z.string().nonempty(),
  AWS_ACCESS_KEY_ID: z.string().nonempty(),
  AWS_SECRET_ACCESS_KEY: z.string().nonempty(),
  STRIPE_SECRET_KEY: z.string().nonempty(),
  STRIPE_WEBHOOK_SECRET: z.string().nonempty(),
  APP_URL: z.string().url().default('http://localhost:3000'),
  MOCK_PRINT_PROVIDER: z
    .preprocess((value) => {
      if (typeof value === 'string') return value === 'true';
      if (typeof value === 'boolean') return value;
      return undefined;
    }, z.boolean())
    .default(true)
});

export const env = envSchema.parse(process.env);
export type Env = typeof env;
