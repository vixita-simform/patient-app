import { notFound } from '../../../lib';

// Any /api path without its own route gets a JSON 404 instead of Next's HTML page.
const handler = (): Response => notFound();

export { handler as DELETE, handler as GET, handler as PATCH, handler as POST, handler as PUT };
