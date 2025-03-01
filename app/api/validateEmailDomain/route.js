import dns from 'dns';
import { promisify } from 'util';
import { NextResponse } from 'next/server';

const resolveMx = promisify(dns.resolveMx);

export async function POST(req) {
  try {
    const { domain } = await req.json();

    if (!domain) {
      return NextResponse.json({ isValid: false, error: 'Domain is required' }, { status: 400 });
    }

    try {
      // Check if domain has MX records
      const mxRecords = await resolveMx(domain);
      return NextResponse.json({ isValid: mxRecords.length > 0 });
    } catch (error) {
      // If DNS lookup fails, domain is likely invalid
      return NextResponse.json({ isValid: false });
    }
  } catch (error) {
    console.error('Error validating email domain:', error);
    return NextResponse.json({ isValid: false, error: 'Internal server error' }, { status: 500 });
  }
}
