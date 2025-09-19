import { NextRequest, NextResponse } from 'next/server';
import { createStytchServerClient } from '@/lib/stytch/server';

export async function POST(request: NextRequest) {
  try {
    const { email, organization_id, untrusted_metadata } = await request.json();

    const stytch = createStytchServerClient();

    // Get the session token from cookies
    const sessionToken = request.cookies.get('stytch_session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the session
    const sessionResponse = await stytch.sessions.authenticate({
      session_token: sessionToken,
    });

    if (!sessionResponse.member || !sessionResponse.organization) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Invite member to organization
    const inviteResponse = await stytch.magicLinks.email.invite({
      email_address: email,
      organization_id: organization_id || sessionResponse.organization.organization_id,
      untrusted_metadata: untrusted_metadata || {},
    });

    return NextResponse.json({
      success: true,
      member_id: inviteResponse.member_id,
      request_id: inviteResponse.request_id
    });
  } catch (error) {
    console.error('Invitation error:', error);
    return NextResponse.json(
      { error: 'Failed to send invitation' },
      { status: 500 }
    );
  }
}