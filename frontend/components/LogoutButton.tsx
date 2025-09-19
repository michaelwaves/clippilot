"use client"

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStytchB2BClient, useStytchMemberSession } from '@stytch/nextjs/b2b';
import { useRouter } from 'next/navigation';

function LogoutButton({ collapsed }: { collapsed?: boolean }) {
    const stytch = useStytchB2BClient();
    const { session } = useStytchMemberSession();
    const router = useRouter();

    const handleLogOut = () => {
        stytch.session.revoke().then(() => {
            router.replace('/');
        });
    };

    if (!session) {
        return null;
    }

    return (
        <Button variant="outline" className="w-full " onClick={handleLogOut}>
            {!collapsed && "Logout"}
            <LogOut />
        </Button>
    );
}

export default LogoutButton;