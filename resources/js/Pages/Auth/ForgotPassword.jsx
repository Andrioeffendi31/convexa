import { Head, Link, useForm } from "@inertiajs/react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import TextInput from "@/Components/TextInput";
import { Button } from "@/Components/ui/button";
import GuestLayout from "@/Layouts/GuestLayout";

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("password.email"));
    };

    return (
        <GuestLayout
            eyebrow="Recovery"
            title="Lupa password?"
            subtitle="Masukkan email Anda dan kami akan kirim link untuk reset password."
        >
            <Head title="Forgot Password" />

            {status && (
                <div className="mb-5 inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                <div className="space-y-2">
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        isFocused
                        onChange={(e) => setData("email", e.target.value)}
                        placeholder="you@company.com"
                    />
                    <InputError message={errors.email} />
                </div>

                <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={processing}
                >
                    {processing ? "Sending…" : "Email password reset link"}
                    {!processing && <ArrowRight className="h-4 w-4" />}
                </Button>

                <p className="text-center text-sm text-text-muted">
                    Ingat password Anda?{" "}
                    <Link
                        href={route("login")}
                        className="font-medium text-gradient transition hover:opacity-80"
                    >
                        Kembali ke login
                    </Link>
                </p>
            </form>
        </GuestLayout>
    );
}
