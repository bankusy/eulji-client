"use strict";
import Link from "next/link";
import { Button } from "@/components/ui/v1/Button";

export default function LandingNavbar() {
    return (
        <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold text-xl">
                        E
                    </div>
                    <span className="text-xl font-bold tracking-tight text-gray-900">
                        Eulji
                    </span>
                </div>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-8">
                    <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
                        Features
                    </Link>
                    <Link href="#solutions" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
                        Solutions
                    </Link>
                    <Link href="#pricing" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
                        Pricing
                    </Link>
                </div>

                {/* CTA */}
                <div className="flex items-center gap-4">
                    <Link href="/login" className="text-sm font-medium text-gray-900 hover:text-black">
                        Log in
                    </Link>
                    <Link href="/signup">
                        <Button className="rounded-full px-6 bg-[#1a1a1a] hover:bg-black text-white font-medium text-sm h-9">
                            Start Now
                            <span className="ml-1 text-gray-400">→</span>
                        </Button>
                    </Link>
                </div>
            </div>
        </nav>
    );
}
