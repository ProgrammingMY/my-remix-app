
import { MenuIcon } from 'lucide-react';
import { useSidebar } from '../ui/sidebar'
import NavbarRoutes from './navbar-routes'
import { Button } from '../ui/button';
import { capitalizeFirstLetter } from '~/lib/format';
import { cn } from '~/lib/utils';
export default function Navbar({ userName }: { userName: string }) {
    const sidebar = useSidebar();
    return (
        <div className='p-4 border-b-2 h-full flex items-center justify-between'>
            {sidebar.isMobile && (
                <Button variant={"ghost"} className="md:hidden hover:opacity-75 transition" onClick={() => sidebar.setOpenMobile(true)}>
                    <MenuIcon size={32} />
                </Button>
            )}
        </div>
    )
}
