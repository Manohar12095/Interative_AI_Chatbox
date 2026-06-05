import { createClient } from '@insforge/sdk';

// Using environment variables if available, otherwise fallback to project.json values injected by Vite or hardcoded for development
const insforgeUrl = import.meta.env.VITE_INSFORGE_URL || 'https://s4gjp3ny.ap-southeast.insforge.app';
const insforgeKey = import.meta.env.VITE_INSFORGE_ANON_KEY || 'ik_910dedb934a5ca45ed8d4236e6b00cd4';

export const insforge = createClient(insforgeUrl, insforgeKey);
