import { NextRequest, NextResponse } from 'next/server';
import { createStytchServerClient } from '@/lib/stytch/server';

export async function GET(request: NextRequest) {
  try {
    const stytch = createStytchServerClient();

    // Get the session token from cookies
    const sessionToken = request.cookies.get('stytch_session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the session and get organization
    const sessionResponse = await stytch.sessions.authenticate({
      session_token: sessionToken,
    });

    if (!sessionResponse.organization) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 });
    }

    // Get organization members
    const membersResponse = await stytch.organizations.members.search({
      organization_ids: [sessionResponse.organization.organization_id],
    });

    return NextResponse.json({
      members: membersResponse.members,
      organization: sessionResponse.organization,
    });
  } catch (error) {
    console.error('Members fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { member_id, roles } = await request.json();
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

    if (!sessionResponse.organization) {
      return NextResponse.json({ error: 'No organization found' }, { status: 400 });
    }

    // Update member roles
    const updateResponse = await stytch.organizations.members.update({
      organization_id: sessionResponse.organization.organization_id,
      member_id: member_id,
      roles: roles,
    });

    return NextResponse.json({
      success: true,
      member: updateResponse.member
    });
  } catch (error) {
    console.error('Member update error:', error);
    return NextResponse.json(
      { error: 'Failed to update member' },
      { status: 500 }
    );
  }
}