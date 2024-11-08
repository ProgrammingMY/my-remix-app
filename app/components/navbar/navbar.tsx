
import { MenuIcon } from 'lucide-react';
import { useSidebar } from '../ui/sidebar'
import NavbarRoutes from './navbar-routes'
import { Button } from '../ui/button';
import { useState } from 'react';
export default function Navbar() {
    const sidebar = useSidebar();
    return (
        <div className='p-4 border-b-2 h-full flex items-center bg-white'>
            {sidebar.isMobile && (
                <Button variant={"ghost"} className="md:hidden pr-4 hover:opacity-75 transition" onClick={() => sidebar.setOpenMobile(true)}>
                    <MenuIcon size={32} />
                </Button>
            )}
            <NavbarRoutes />
        </div>
    )
}
