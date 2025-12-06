
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { authApi } from '@/lib/api';
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [message, setMessage] = useState('');
    const token = searchParams.get('token');
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid verification link. No token found.');
            return;
        }

        const verify = async () => {
            try {
                await authApi.verifyEmail(token);
                setStatus('success');
            } catch (error: any) {
                setStatus('error');
                setMessage(error.response?.data?.message || 'Verification failed. The link may have expired.');
            }
        };

        verify();
    }, [token]);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-white shadow-xl">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Email Verification</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4 text-center">
                    {status === 'verifying' && (
                        <>
                            <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                            <p className="text-slate-600">Verifying your email address...</p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <CheckCircle2 className="h-12 w-12 text-green-500" />
                            <div className="space-y-2">
                                <p className="text-lg font-medium text-slate-900">Email Verified Successfully!</p>
                                <p className="text-slate-600">You can now proceed to login.</p>
                            </div>
                            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                                <Link to="/login">Go to Login</Link>
                            </Button>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <XCircle className="h-12 w-12 text-red-500" />
                            <div className="space-y-2">
                                <p className="text-lg font-medium text-slate-900">Verification Failed</p>
                                <p className="text-red-600">{message}</p>
                            </div>
                            <Button variant="outline" asChild className="w-full">
                                <Link to="/register">Back to Registration</Link>
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
