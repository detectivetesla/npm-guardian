import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { repo_url, branch = 'main' } = body;

    if (!repo_url || typeof repo_url !== 'string') {
      return NextResponse.json(
        { error: 'repo_url is required and must be a string.' },
        { status: 400 }
      );
    }

    // Validate URL format — only accept GitHub/GitLab URLs
    const urlPattern = /^https:\/\/(github\.com|gitlab\.com)\/[\w\-\.]+\/[\w\-\.]+/;
    if (!urlPattern.test(repo_url.trim())) {
      return NextResponse.json(
        { error: 'Invalid repository URL. Only GitHub and GitLab URLs are accepted.' },
        { status: 400 }
      );
    }

    const scanId = randomUUID();

    const { error } = await supabaseAdmin
      .from('scans')
      .insert({
        id: scanId,
        type: 'repository',
        package_name: repo_url.trim(),
        package_version: branch,
        status: 'queued',
        overall_risk_score: 0,
        risk_level: 'PENDING',
      });

    if (error) {
      console.error('[API scan/repository] Supabase insert error:', error.message);
      return NextResponse.json(
        { error: 'Failed to queue repository scan.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        scan_id: scanId,
        status: 'queued',
        message: 'Repository scan queued.',
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
