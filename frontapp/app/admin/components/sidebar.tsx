'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, User, LogOut } from 'lucide-react';

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <Users size={24} className="icon" />
                <span className="logo-text">Sistema</span>
            </div>

            <nav className="sidebar-nav">
                <ul>
                    <li>
                        <Link
                            href="/admin/users"
                            className={`nav-item ${pathname === '/admin/users' ? 'active' : ''}`}
                        >
                            <User size={20} className="icon" />
                            <span>Usuários</span>
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/admin/profiles"
                            className={`nav-item ${pathname === '/admin/profiles' ? 'active' : ''}`}
                        >
                            <User size={20} className="icon" />
                            <span>Perfis</span>
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/logout"
                            className={`nav-item ${pathname === '/logout' ? 'active' : ''}`}
                        >
                            <LogOut size={20} className="icon" />
                            <span>Sair</span>
                        </Link>
                    </li>
                </ul>
            </nav>
        </aside>
    );
}