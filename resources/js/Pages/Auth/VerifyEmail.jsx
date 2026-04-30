import { Head, Link, useForm } from "@inertiajs/react";
import { CheckCircle2, Mail } from "lucide-react";

import { Button } from "@/Components/ui/button";
import GuestLayout from "@/Layouts/GuestLayout";

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route("verification.send"));
    };

    return (
        <GuestLayout
            eyebrow="One more step"
            title="Verifikasi email Anda"
            subtitle="Kami sudah kirim link verifikasi ke email Anda. Klik link tersebut untuk mulai menggunakan Convexa."
        >
            <Head title="Email Verification" />

            {status === "verification-link-sent" && (
                <div className="mb-5 inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Link verifikasi baru sudah dikirim ke email Anda.
                </div>
            )}

            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-border/60 bg-bg-elevated/60 p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-accent text-white shadow-glow">
                    <Mail className="h-4 w-4" />
                </span>
                <p className="text-xs text-text-muted">
                    Tidak menerima email? Cek folder spam atau klik tombol di
                    bawah untuk kirim ulang link verifikasi.
                </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={processing}
                >
                    {processing ? "Sending…" : "Resend verification email"}
                </Button>

                <Link
                    href={route("logout")}
                    method="post"
                    as="button"
                    className="block w-full text-center text-sm text-text-muted transition hover:text-text"
                >
                    Log out
                </Link>
            </form>
        </GuestLayout>
    );
}
