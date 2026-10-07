"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { isAuthenticated } from "../login/auth_service";
import Sidebar from "./components/sidebar";

export default function RootLayout({ children }: LayoutProps<"/">) {
    const router = useRouter();
    const [autenticado, setAutenticado] = useState(false);

    useEffect(() => {
        if (!isAuthenticated()) {
            router.replace("/login");
            return;
        }
        setAutenticado(true);
    }, [router]);

    if (!autenticado) return null;

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar fixa à esquerda */}
            <Sidebar />

            {/* Conteúdo principal empurrado para a direita da sidebar */}
            <main style={{ marginLeft: '240px', flex: 1, padding: '24px' }}>
                {children}
            </main>
        </div>
    );
}
