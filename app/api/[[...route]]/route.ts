import { Hono } from 'hono';
import { handle } from 'hono/vercel';

import auth from '@/features/auth/server/route';

const app = new Hono().basePath('/api');

app.route('/auth', auth);

export const GET = handle(app);
export const POST = handle(app);
export const FETCH = handle(app);

export type AppType = ReturnType<typeof app.route>;