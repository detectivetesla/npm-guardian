import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { package_name, version = 'latest' } = body;

    if (!package_name || typeof package_name !== 'string') {
      return NextResponse.json(
        { error: 'package_name is required and must be a string.' },
        { status: 400 }
      );
    }

    // Sanitize input — only allow valid npm package name characters
    const sanitized = package_name.trim().slice(0, 214);
    if (!/^(@[a-z0-9\-~][a-z0-9\-._~]*\/)?[a-z0-9\-~][a-z0-9\-._~]*$/.test(sanitized)) {
      return NextResponse.json(
        { error: 'Invalid package name format.' },
        { status: 400 }
      );
    }

    const scanId = randomUUID();

    const { error } = await supabaseAdmin
      .from('scans')
      .insert({
        id: scanId,
        type: 'package',
        package_name: sanitized,
        package_version: version,
        status: 'queued',
        overall_risk_score: 0,
        risk_level: 'PENDING',
      });

    if (error) {
      console.error('[API scan/package] Supabase insert error:', error.message);
      return NextResponse.json(
        { error: 'Failed to queue scan job.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        scan_id: scanId,
        status: 'queued',
        message: `Scan queued for ${sanitized}@${version}`,
      },
      { status: 202 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body.' },
      { status: 400 }
    );
  }
}
