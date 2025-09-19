"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

function DashboardPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/dashboard/organization');
    }, [router]);

    return (
        <div className="flex items-center justify-center h-64">
            <div className="text-lg">Redirecting...</div>
        </div>
    );
}

export default DashboardPage;