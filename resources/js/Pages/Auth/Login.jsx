import { Head, Link, useForm } from "@inertiajs/react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import Checkbox from "@/Components/Checkbox";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PasswordInput from "@/Components/PasswordInput";
import TextInput from "@/Components/TextInput";
import { Button } from "@/Components/ui/button";
import GuestLayout from "@/Layouts/GuestLayout";

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("login"), {
            onFinish: () => reset("password"),
        });
    };

    return (
        <GuestLayout
            eyebrow="Welcome back"
            title="Masuk ke workspace Anda"
            subtitle="Lanjutkan iterasi sales page yang sudah Anda mulai—atau bangun yang baru dalam menit."
        >
            <Head title="Log in" />

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
                        autoComplete="username"
                        isFocused
                        onChange={(e) => setData("email", e.target.value)}
                        placeholder="you@company.com"
                    />
                    <InputError message={errors.email} />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <InputLabel htmlFor="password" value="Password" />
                        {canResetPassword && (
                            <Link
                                href={route("password.request")}
                                className="text-[11px] font-medium text-accent transition hover:text-accent-2"
                            >
                                Forgot password?
                            </Link>
                        )}
                    </div>
                    <PasswordInput
                        id="password"
                        name="password"
                        value={data.password}
                        autoComplete="current-password"
                        onChange={(e) => setData("password", e.target.value)}
                        placeholder="••••••••"
                    />
                    <InputError message={errors.password} />
                </div>

                <label className="flex items-center gap-2.5 text-sm text-text-muted">
                    <Checkbox
                        name="remember"
                        checked={data.remember}
                        onChange={(e) => setData("remember", e.target.checked)}
                    />
                    Stay signed in on this device
                </label>

                <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={processing}
                >
                    {processing ? "Signing in…" : "Sign in to Convexa"}
                    {!processing && <ArrowRight className="h-4 w-4" />}
                </Button>

                <div className="flex items-center gap-3 text-[11px] text-text-subtle">
                    <span className="h-px flex-1 bg-border/60" />
                    <span className="uppercase tracking-[0.2em]">or</span>
                    <span className="h-px flex-1 bg-border/60" />
                </div>

                <p className="text-center text-sm text-text-muted">
                    Belum punya akun?{" "}
                    <Link
                        href={route("register")}
                        className="font-medium text-gradient transition hover:opacity-80"
                    >
                        Buat akun gratis
                    </Link>
                </p>
            </form>
        </GuestLayout>
    );
}
