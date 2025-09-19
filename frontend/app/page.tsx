"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-green-400 font-mono flex items-center justify-center p-4">
      <div className="text-center max-w-4xl">
        {/* ASCII Art Header */}
        <pre className="text-xs sm:text-sm md:text-base lg:text-lg leading-tight mb-8 whitespace-pre-wrap">
{`
 ██████╗██╗     ██╗██████╗ ██████╗ ██╗██╗      ██████╗ ████████╗
██╔════╝██║     ██║██╔══██╗██╔══██╗██║██║     ██╔═══██╗╚══██╔══╝
██║     ██║     ██║██████╔╝██████╔╝██║██║     ██║   ██║   ██║
██║     ██║     ██║██╔═══╝ ██╔═══╝ ██║██║     ██║   ██║   ██║
╚██████╗███████╗██║██║     ██║     ██║███████╗╚██████╔╝   ██║
 ╚═════╝╚══════╝╚═╝╚═╝     ╚═╝     ╚═╝╚══════╝ ╚═════╝    ╚═╝
`}
        </pre>

        {/* Subtitle */}
        <div className="mb-8 text-green-300">
          <p className="text-sm md:text-base">▓▓▓ SECURE MARKETING PLATFORM ▓▓▓</p>
          <p className="text-xs md:text-sm mt-2 opacity-80">
            [ Campaign Management • Asset Control • Team Collaboration ]
          </p>
        </div>

        {/* Terminal-style login prompt */}
        <div className="bg-gray-900 border border-green-400 rounded-lg p-6 mb-8 max-w-md mx-auto">
          <div className="text-left">
            <p className="text-green-400 mb-2">$ ./clippilot --access</p>
            <p className="text-gray-400 text-sm mb-4">
              Initializing secure authentication portal...
            </p>
            <div className="border-t border-green-400 pt-4">
              <p className="text-green-300 text-sm mb-4">
                ✓ System ready
                <br />
                ✓ Security protocols active
                <br />
                ✓ B2B authentication enabled
              </p>
            </div>
          </div>
        </div>

        {/* Access Button */}
        <Link
          href="/authenticate"
          className="inline-block bg-transparent border-2 border-green-400 text-green-400 px-8 py-4 rounded-lg font-bold uppercase tracking-wider hover:bg-green-400 hover:text-black transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-green-400/25"
        >
          ► Access Secure Sign In Portal
        </Link>

        {/* Footer decoration */}
        <div className="mt-12 text-green-600 text-xs">
          <p>[ AUTHORIZED PERSONNEL ONLY ]</p>
          <div className="mt-4 opacity-60">
            ▂▃▅▇█▓▒░ CLIPPILOT SECURE GATEWAY ░▒▓█▇▅▃▂
          </div>
        </div>
      </div>
    </div>
  );
}