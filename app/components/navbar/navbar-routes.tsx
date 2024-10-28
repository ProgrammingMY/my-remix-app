import { Link, useLocation } from "@remix-run/react"
import { Button } from "../ui/button";
import { LogOut } from "lucide-react";


const NavbarRoutes = () => {
    const { pathname } = useLocation();

    const isTeacherPage = pathname.startsWith("/teacher");
    const isPlayerPage = pathname.includes("/player");

    return (
        <>
            <div className='flex gap-x-2 ml-auto'>
                {isTeacherPage || isPlayerPage ?
                    <Link to={"/user"}>
                        <Button size="sm" variant="ghost">
                            <LogOut className='h-4 w-4 mr-2' />
                            Exit
                        </Button>
                    </Link> : (
                        <Link to={"/teacher/courses"}>
                            <Button size="sm" variant="ghost">
                                Teacher Mode
                            </Button>
                        </Link>
                    )
                }
            </div>
        </>
    )
}

export default NavbarRoutes;