
import { MenuIcon } from 'lucide-react';
import { useSidebar } from '../ui/sidebar'
import NavbarRoutes from './navbar-routes'
import { Button } from '../ui/button';
import { capitalizeFirstLetter } from '~/lib/format';
import { cn } from '~/lib/utils';
export default function Navbar({ userName }: { userName: string }) {
    const sidebar = useSidebar();
    return (
        <div className='p-4 border-b-2 h-full flex items-center bg-white'>
            {sidebar.isMobile && (
                <Button variant={"ghost"} className="md:hidden hover:opacity-75 transition" onClick={() => sidebar.setOpenMobile(true)}>
                    <MenuIcon size={32} />
                </Button>
            )}
            <h1 className={cn(
                "font-bold text-2xl ml-20 transition-all",
                sidebar.isMobile && "text-xl ml-0",
                sidebar.open && "ml-64 ",

            )}>Welcome! {capitalizeFirstLetter(userName)}</h1>
            {/* <NavbarRoutes /> */}
        </div>
    )
}
