import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: { scanId: string } }
) {
  const { scanId } = params;

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(scanId)) {
    return NextResponse.json({ error: 'Invalid scan ID format.' }, { status: 400 });
  }

  try {
    const { data: scan, error: scanError } = await supabaseAdmin
      .from('scans')
      .select('*')
      .eq('id', scanId)
      .single();

    if (scanError || !scan) {
      return NextResponse.json({ error: 'Scan not found.', scan_id: scanId }, { status: 404 });
    }

    const { data: findings } = await supabaseAdmin
      .from('scan_findings')
      .select('id, severity, category, description, file_path, line_number')
      .eq('scan_id', scanId);

    return NextResponse.json({
      scan_id: scan.id,
      status: scan.status,
      target: `${scan.package_name}@${scan.package_version}`,
      overall_risk_score: scan.overall_risk_score,
      risk_level: scan.risk_level,
      started_at: scan.started_at,
      completed_at: scan.completed_at,
      findings: findings || [],
    });
  } catch (err) {
    console.error('[API scan/results] Error:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve scan results.' },
      { status: 500 }
    );
  }
}
