import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Total scans count
    const { count: totalScans, error: scansError } = await supabaseAdmin
      .from('scans')
      .select('*', { count: 'exact', head: true });

    // High risk scans (risk_level = 'HIGH' or score > 60)
    const { count: highRiskCount, error: riskError } = await supabaseAdmin
      .from('scans')
      .select('*', { count: 'exact', head: true })
      .gt('overall_risk_score', 60);

    // Repositories tracked
    const { count: reposProtected, error: reposError } = await supabaseAdmin
      .from('repositories')
      .select('*', { count: 'exact', head: true });

    // Packages analyzed
    const { count: packagesAnalyzed, error: packagesError } = await supabaseAdmin
      .from('packages')
      .select('*', { count: 'exact', head: true });

    // Recent scans (last 10)
    const { data: recentScans, error: recentError } = await supabaseAdmin
      .from('scans')
      .select('id, type, package_name, package_version, status, overall_risk_score, risk_level, started_at, completed_at')
      .order('started_at', { ascending: false })
      .limit(10);

    const hasErrors = scansError || riskError || reposError || packagesError || recentError;
    if (hasErrors) {
      console.error('[API stats] Supabase errors:', { scansError, riskError, reposError, packagesError, recentError });
    }

    return NextResponse.json({
      totalScans: totalScans ?? 0,
      highRiskCount: highRiskCount ?? 0,
      reposProtected: reposProtected ?? 0,
      packagesAnalyzed: packagesAnalyzed ?? 0,
      recentScans: recentScans ?? [],
    });
  } catch (err) {
    console.error('[API stats] Error:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve dashboard stats.' },
      { status: 500 }
    );
  }
}
