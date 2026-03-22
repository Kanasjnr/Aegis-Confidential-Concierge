import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const STORAGE_PATH = path.join(process.cwd(), 'reasoning_store.json');

async function getStore(): Promise<Record<string, any>> {
  try {
    const data = await fs.readFile(STORAGE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return {};
  }
}

async function saveStore(store: Record<string, any>) {
  await fs.writeFile(STORAGE_PATH, JSON.stringify(store, null, 2));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mandateId = searchParams.get('mandateId');

  if (!mandateId) {
    return NextResponse.json({ error: 'Mandate ID is required' }, { status: 400 });
  }

  const store = await getStore();
  const reasoning = store[mandateId.toLowerCase()] || {
    status: 'pending',
    logs: ['Awaiting agent initialization...']
  };

  return NextResponse.json(reasoning);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mandateId, reasoning, status, log } = body;

    if (!mandateId) {
      return NextResponse.json({ error: 'Mandate ID is required' }, { status: 400 });
    }

    const idLower = mandateId.toLowerCase();
    const store = await getStore();
    
    if (!store[idLower]) {
      store[idLower] = {
        status: 'initializing',
        logs: [],
        lastUpdated: new Date().toISOString()
      };
    }

    if (reasoning) store[idLower].reasoning = reasoning;
    if (status) store[idLower].status = status;
    if (log) {
      store[idLower].logs.push(`[${new Date().toLocaleTimeString()}] ${log}`);
      if (store[idLower].logs.length > 20) {
        store[idLower].logs.shift();
      }
    }
    
    store[idLower].lastUpdated = new Date().toISOString();
    await saveStore(store);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
