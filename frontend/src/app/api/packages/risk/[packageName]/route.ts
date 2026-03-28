import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: { packageName: string } }
) {
  const { packageName } = params;

  // Sanitize input
  const sanitized = decodeURIComponent(packageName).trim().slice(0, 214);
  if (!sanitized) {
    return NextResponse.json({ error: 'Package name is required.' }, { status: 400 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('packages')
      .select('name, latest_scan_score, maintainer_reputation_score, updated_at')
      .eq('name', sanitized)
      .single();

    if (error || !data) {
      return NextResponse.json({
        package: sanitized,
        risk_score: 0,
        risk_level: 'UNKNOWN',
        last_scanned: null,
        message: 'Package not yet analyzed. Submit a scan to evaluate.',
      });
    }

    const riskLevel =
      data.latest_scan_score > 60 ? 'HIGH' :
      data.latest_scan_score > 30 ? 'MEDIUM' : 'LOW';

    return NextResponse.json({
      package: data.name,
      risk_score: data.latest_scan_score,
      risk_level: riskLevel,
      maintainer_reputation: data.maintainer_reputation_score,
      last_scanned: data.updated_at,
    });
  } catch (err) {
    console.error('[API packages/risk] Error:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve threat intelligence.' },
      { status: 500 }
    );
  }
}
