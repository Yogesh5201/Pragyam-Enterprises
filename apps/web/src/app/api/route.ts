import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    platform: 'PRAGYAM ENTERPRISES',
    service: 'Pragyam Central Intermediary Brokerage Desk',
    status: 'ONLINE',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
}
