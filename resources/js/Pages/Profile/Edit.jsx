import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import DeleteUserForm from "./Partials/DeleteUserForm";
import UpdatePasswordForm from "./Partials/UpdatePasswordForm";
import UpdateProfileInformationForm from "./Partials/UpdateProfileInformationForm";

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-2xl font-semibold leading-tight text-text">
                        Profile
                    </h2>
                    <p className="mt-0.5 text-sm text-text-muted">
                        Kelola informasi akun, password, dan keamanan.
                    </p>
                </div>
            }
        >
            <Head title="Profile" />

            <div className="py-10">
                <div className="mx-auto max-w-4xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <div className="rounded-2xl border border-border/60 bg-bg-elevated/60 p-6 shadow-inner-soft backdrop-blur-md sm:p-8">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                    </div>

                    <div className="rounded-2xl border border-border/60 bg-bg-elevated/60 p-6 shadow-inner-soft backdrop-blur-md sm:p-8">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                    <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6 shadow-inner-soft backdrop-blur-md sm:p-8">
                        <DeleteUserForm className="max-w-xl" />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
