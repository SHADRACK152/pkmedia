
import { app } from '../server/app';
import { registerRoutes } from '../server/routes';

// Cache the initialization promise to ensure it only runs once
let initPromise: Promise<any> | null = null;

export default async function handler(req: any, res: any) {
  if (!initPromise) {
    // Initialize routes and other setup logic
    // We pass a dummy server object because registerRoutes expects one, 
    // but in serverless we don't have a real HTTP server instance to attach to.
    // Most logic in registerRoutes doesn't use the server instance except for WebSocket setup (if any).
    const dummyServer: any = {
      listen: () => {},
      on: () => {},
      address: () => ({ port: 0 })
    };
    
    initPromise = registerRoutes(app).then(() => {
      console.log('Routes registered for Vercel');
    });
  }

  await initPromise;
  
  // Forward the request to the Express app
  app(req, res);
}
