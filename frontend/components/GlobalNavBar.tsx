"use client"
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import Image from "next/image"; import LogoutButton from "./LogoutButton";
import { useState, useEffect } from "react";

export interface NavbarLinkProps {
    title: string | undefined,
    href: string | undefined,
    icon: React.ReactNode,
    collapsed: boolean,
    isActive: boolean
}

export interface NavbarSectionProps {
    title: string;
    links: Partial<NavbarLinkProps>[];
    collapsed?: boolean;
    isExpanded?: boolean;
    onToggle?: () => void;
}

function NavbarElement({ title, href, icon, collapsed, isActive }: NavbarLinkProps) {
    const getContainerClasses = () => {
        const baseClasses = "transition-colors duration-200 group";
        const activeClasses = isActive ? "bg-green-100" : "hover:bg-gray-200";
        const sizeClasses = collapsed
            ? "w-10 h-10 rounded-full flex items-center justify-center"
            : "rounded-lg px-2 py-2 flex items-center";

        return `${baseClasses} ${activeClasses} ${sizeClasses}`;
    };

    return (
        <div className={getContainerClasses()}>
            {collapsed ? (
                <div className="group relative">
                    <Link
                        href={`/dashboard${href === "/" ? "" : href}`}
                        className="w-full h-full flex items-center justify-center"
                    >
                        <div className="flex items-center justify-center">
                            {icon}
                        </div>
                    </Link>
                    <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-4 px-2 py-1 bg-green-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                        {title}
                    </div>
                </div>
            ) : (
                <Link href={`/dashboard${href === "/" ? "" : href}`} className="flex items-center w-full">
                    <div className="flex items-center justify-center min-w-[20px] min-h-[20px]">
                        {icon}
                    </div>
                    <span className="text-sm pl-2 truncate">{title}</span>
                </Link>
            )}
        </div>
    );
}

function NavbarSection({ title, links, collapsed, isExpanded = true, onToggle }: NavbarSectionProps) {
    const pathname = usePathname();

    const isActiveLink = (href: string | undefined) => {
        if (!href) return false;
        if (href === "/" && pathname === "/dashboard") return true;
        if (href !== "/") {
            const linkPath = `/dashboard${href}`;
            return pathname.startsWith(linkPath);
        }
        return false;
    };

    if (collapsed) {
        // When collapsed, show all links without section headers
        return (
            <>
                {links.map((link, index) => (
                    <NavbarElement
                        key={link.href || index}
                        title={link.title}
                        href={link.href}
                        collapsed={collapsed}
                        icon={link.icon}
                        isActive={isActiveLink(link.href)}
                    />
                ))}
            </>
        );
    }

    return (
        <div className="w-full">
            {/* Section Header */}
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between px-2 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
                <span className="uppercase tracking-wide">{title}</span>
                {isExpanded ? (
                    <ChevronUp size={14} />
                ) : (
                    <ChevronDown size={14} />
                )}
            </button>

            {/* Section Links */}
            {isExpanded && (
                <div className="ml-2 space-y-1 border-l-2 border-gray-100">
                    {links.map((link, index) => (
                        <div key={link.href || index} className="ml-2">
                            <NavbarElement
                                title={link.title}
                                href={link.href}
                                collapsed={false}
                                icon={link.icon}
                                isActive={isActiveLink(link.href)}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function Navbar({ sections }: { sections: NavbarSectionProps[] }) {
    const [collapsed, setCollapsed] = useState<boolean>(true); // Default to collapsed
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const [expandedSections, setExpandedSections] = useState<Set<string>>(
        new Set(sections.map(section => section.title)) // All sections expanded by default
    );
    const pathname = usePathname();

    // Check if device is mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768); // md breakpoint
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Force collapsed state on mobile
    useEffect(() => {
        if (isMobile) {
            setCollapsed(true);
        }
    }, [isMobile]);

    const isActiveLink = (href: string | undefined) => {
        if (!href) return false;

        // Handle home page - only active for exact dashboard match
        if (href === "/" && pathname === "/dashboard") return true;

        // For non-home pages, check if current path starts with the link path
        if (href !== "/") {
            const linkPath = `/dashboard${href}`;
            return pathname.startsWith(linkPath);
        }

        return false;
    };

    const handleToggleCollapse = () => {
        // Only allow toggle on desktop
        if (!isMobile) {
            setCollapsed(!collapsed);
        }
    };

    const toggleSection = (sectionTitle: string) => {
        if (!collapsed) { // Only allow toggling when sidebar is expanded
            setExpandedSections(prev => {
                const newSet = new Set(prev);
                if (newSet.has(sectionTitle)) {
                    newSet.delete(sectionTitle);
                } else {
                    newSet.add(sectionTitle);
                }
                return newSet;
            });
        }
    };

    return (
        <div className="flex flex-row">
            {/* Sidebar */}
            <div className={`${collapsed ? "w-[70px]" : "w-[200px]"} relative bg-white min-h-screen h-full p-2 border-r-8 border-[#f7f4ed] flex justify-between flex-col transition-all duration-300 ease-in-out`}>
                <div>
                    {/* Logo 
                    <div className="py-4 px-1 pt-5 flex justify-start">
                        <Image
                            src={Logo}
                            alt="Logo"
                            width={40}
                            height={40}
                            className='flex-shrink-0'
                        />
                    </div>
                    */}

                    {/* Navigation Sections */}
                    <div className="w-full flex flex-col gap-6">
                        {sections.map((section, index) => (
                            <NavbarSection
                                key={section.title || index}
                                title={section.title}
                                links={section.links}
                                collapsed={collapsed}
                                isExpanded={expandedSections.has(section.title)}
                                onToggle={() => toggleSection(section.title)}
                            />
                        ))}
                    </div>
                </div>

                {/* Logout Button */}
                <div className="w-full h-20 flex items-center justify-center">
                    <div className={collapsed ? "w-10 h-10 rounded-full hover:bg-gray-200 flex items-center justify-center" : "w-full"}>
                        <LogoutButton collapsed={collapsed} />
                    </div>
                </div>

                {/* Collapse Toggle - Hidden on mobile */}
                {!isMobile && (
                    <div
                        onClick={handleToggleCollapse}
                        className="group absolute right-[0.5px] top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center cursor-pointer z-10"
                    >
                        <div className="absolute w-[2px] h-5 bg-gray-500 rounded-full transition-all duration-300 ease-in-out group-hover:opacity-0 group-hover:scale-0" />
                        {collapsed ? (
                            <ChevronRight className="absolute w-5 h-5 text-gray-500 opacity-0 scale-0 transition-all duration-300 ease-in-out group-hover:opacity-100 group-hover:scale-100" />
                        ) : (
                            <ChevronLeft className="absolute w-5 h-5 text-gray-500 opacity-0 scale-0 transition-all duration-300 ease-in-out group-hover:opacity-100 group-hover:scale-100" />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Navbar;