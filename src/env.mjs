import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

// OPENAI_API_KEY=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
// NEXT_PUBLIC_OPENAI_API_KEY=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

// # Pinecone for vector storage
// PINECONE_API_KEY=84d8896f-ce77-424e-8e2c-75057ec73500
// PINECONE_ENV=asia-southeast1-gcp-free
// PINECONE_INDEX_NAME=isomorphic

// NEXT_PUBLIC_API_URL=http://localhost:3000/api

// REDUCTION_FUNCTION_URL=https://us-central1-influencer-bot-386816.cloudfunctions.net/pinecone-hack

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]),
    OPENAI_API_KEY: z.string(),
    PINECONE_API_KEY: z.string(),
    PINECONE_ENV: z.string(),
    PINECONE_INDEX_NAME: z.string(),
    REDUCTION_FUNCTION_URL: z.string(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_OPENAI_API_KEY: z.string(),
    NEXT_PUBLIC_API_URL: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    NEXT_PUBLIC_OPENAI_API_KEY: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    PINECONE_API_KEY: process.env.PINECONE_API_KEY,
    PINECONE_ENV: process.env.PINECONE_ENV,
    PINECONE_INDEX_NAME: process.env.PINECONE_INDEX_NAME,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    REDUCTION_FUNCTION_URL: process.env.REDUCTION_FUNCTION_URL,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
   * This is especially useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
