import { Outlet } from '@remix-run/react'

export default function AuthLayout() {
    return (

        <div className="w-full min-h-[600px]">
            <div className="flex items-center justify-center py-12">
                <div className="mx-auto grid w-[320px] md:w-[400px] gap-6 border rounded-md p-6 shadow-sm">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}
