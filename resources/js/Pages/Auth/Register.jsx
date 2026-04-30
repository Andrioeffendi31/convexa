import { Head, Link, useForm } from "@inertiajs/react";
import { useMemo } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PasswordInput from "@/Components/PasswordInput";
import TextInput from "@/Components/TextInput";
import { Button } from "@/Components/ui/button";
import GuestLayout from "@/Layouts/GuestLayout";

function PasswordStrength({ value }) {
    const score = useMemo(() => {
        if (!value) return 0;
        let s = 0;
        if (value.length >= 8) s += 1;
        if (/[A-Z]/.test(value)) s += 1;
        if (/[0-9]/.test(value)) s += 1;
        if (/[^A-Za-z0-9]/.test(value)) s += 1;
        return s;
    }, [value]);

    const label =
        ["Empty", "Weak", "Fair", "Good", "Strong"][score] ?? "Empty";
    const color = [
        "bg-bg-subtle",
        "bg-red-500",
        "bg-amber-500",
        "bg-accent",
        "bg-accent-2",
    ][score];

    return (
        <div className="flex items-center gap-2">
            <div className="flex h-1 flex-1 gap-1">
                {[0, 1, 2, 3].map((i) => (
                    <span
                        key={i}
                        className={`h-full flex-1 rounded-full transition ${
                            i < score ? color : "bg-bg-subtle"
                        }`}
                    />
                ))}
            </div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-text-subtle">
                {label}
            </span>
        </div>
    );
}

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("register"), {
            onFinish: () => reset("password", "password_confirmation"),
        });
    };

    return (
        <GuestLayout
            eyebrow="Get started"
            title="Buat akun gratis"
            subtitle="Mulai generate landing page pertama Anda dalam hitungan menit. Tanpa kartu kredit."
        >
            <Head title="Register" />

            <form onSubmit={submit} className="space-y-5">
                <div className="space-y-2">
                    <InputLabel htmlFor="name" value="Full name" />
                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        autoComplete="name"
                        isFocused
                        onChange={(e) => setData("name", e.target.value)}
                        placeholder="Andi Wibawa"
                        required
                    />
                    <InputError message={errors.name} />
                </div>

                <div className="space-y-2">
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        autoComplete="username"
                        onChange={(e) => setData("email", e.target.value)}
                        placeholder="you@company.com"
                        required
                    />
                    <InputError message={errors.email} />
                </div>

                <div className="space-y-2">
                    <InputLabel htmlFor="password" value="Password" />
                    <PasswordInput
                        id="password"
                        name="password"
                        value={data.password}
                        autoComplete="new-password"
                        onChange={(e) => setData("password", e.target.value)}
                        placeholder="At least 8 characters"
                        required
                    />
                    <PasswordStrength value={data.password} />
                    <InputError message={errors.password} />
                </div>

                <div className="space-y-2">
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirm password"
                    />
                    <PasswordInput
                        id="password_confirmation"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        autoComplete="new-password"
                        onChange={(e) =>
                            setData("password_confirmation", e.target.value)
                        }
                        placeholder="Re-enter password"
                        required
                    />
                    <InputError message={errors.password_confirmation} />
                </div>

                <ul className="space-y-1.5 text-xs text-text-muted">
                    <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-accent-2" />
                        Free forever for personal projects
                    </li>
                    <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-accent-2" />
                        HTML export included
                    </li>
                    <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-accent-2" />
                        Cancel anytime
                    </li>
                </ul>

                <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={processing}
                >
                    {processing ? "Creating account…" : "Create free account"}
                    {!processing && <ArrowRight className="h-4 w-4" />}
                </Button>

                <p className="text-center text-xs text-text-subtle">
                    Dengan mendaftar, Anda menyetujui{" "}
                    <a href="#" className="text-text-muted underline-offset-2 hover:underline">
                        Terms
                    </a>{" "}
                    dan{" "}
                    <a href="#" className="text-text-muted underline-offset-2 hover:underline">
                        Privacy Policy
                    </a>
                    .
                </p>

                <div className="flex items-center gap-3 text-[11px] text-text-subtle">
                    <span className="h-px flex-1 bg-border/60" />
                    <span className="uppercase tracking-[0.2em]">or</span>
                    <span className="h-px flex-1 bg-border/60" />
                </div>

                <p className="text-center text-sm text-text-muted">
                    Sudah punya akun?{" "}
                    <Link
                        href={route("login")}
                        className="font-medium text-gradient transition hover:opacity-80"
                    >
                        Sign in
                    </Link>
                </p>
            </form>
        </GuestLayout>
    );
}
