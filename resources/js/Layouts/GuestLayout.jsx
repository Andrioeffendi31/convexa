import ApplicationLogo from "@/Components/ApplicationLogo";
import { Link } from "@inertiajs/react";

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-gradient-to-br from-amber-50 via-white to-sky-50 pt-6 sm:justify-center sm:pt-0">
            <div>
                <Link href="/">
                    <ApplicationLogo className="h-20 w-20 fill-current text-slate-500" />
                </Link>
            </div>

            <div className="mt-6 w-full overflow-hidden rounded-2xl bg-white px-6 py-6 shadow-lg sm:max-w-md">
                {children}
            </div>
        </div>
    );
}
