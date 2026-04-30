import { Head, useForm } from "@inertiajs/react";
import { ArrowRight, ShieldCheck } from "lucide-react";

import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PasswordInput from "@/Components/PasswordInput";
import { Button } from "@/Components/ui/button";
import GuestLayout from "@/Layouts/GuestLayout";

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("password.confirm"), {
            onFinish: () => reset("password"),
        });
    };

    return (
        <GuestLayout
            eyebrow="Secure area"
            title="Konfirmasi password"
            subtitle="Demi keamanan, mohon konfirmasi password Anda sebelum melanjutkan."
        >
            <Head title="Confirm Password" />

            <div className="mb-5 inline-flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-3 py-2 text-xs text-accent">
                <ShieldCheck className="h-3.5 w-3.5" />
                Anda berada di area sensitif
            </div>

            <form onSubmit={submit} className="space-y-5">
                <div className="space-y-2">
                    <InputLabel htmlFor="password" value="Password" />
                    <PasswordInput
                        id="password"
                        name="password"
                        value={data.password}
                        isFocused
                        onChange={(e) => setData("password", e.target.value)}
                        placeholder="Your account password"
                    />
                    <InputError message={errors.password} />
                </div>

                <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={processing}
                >
                    {processing ? "Confirming…" : "Confirm"}
                    {!processing && <ArrowRight className="h-4 w-4" />}
                </Button>
            </form>
        </GuestLayout>
    );
}
