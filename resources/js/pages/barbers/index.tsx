
import { Head, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import {
    ArrowUpRight,
    Clock3,
    Mail,
    MailPlus,
    MoreHorizontal,
    Search,
    Scissors,
    UserRound,
    UsersRound,
    X,
} from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

type Barber = {
    id: number;
    name: string;
    email: string;
};

type Invitation = {
    id: number;
    email: string;
    role: string;
    created_at: string;
    expires_at: string;
    accepted_at: string | null;
    revoked_at: string | null;
};

type Props = {
    barbers: Barber[];
    invitations: Invitation[];
};

export default function BarbersIndex({
    barbers = [],
    invitations = [],
}: Props) {
    const [search, setSearch] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [processing, setProcessing] = useState(false);
    const [revokingId, setRevokingId] = useState<number | null>(null);

    const filteredBarbers = useMemo(() => {
        const term = search.trim().toLowerCase();

        if (!term) return barbers;

        return barbers.filter(
            (barber) =>
                barber.name.toLowerCase().includes(term) ||
                barber.email.toLowerCase().includes(term),
        );
    }, [barbers, search]);

    const pendingInvitations = useMemo(() => {
        const now = Date.now();

        return invitations.filter(
            (invitation) =>
                !invitation.accepted_at &&
                !invitation.revoked_at &&
                new Date(invitation.expires_at).getTime() > now,
        );
    }, [invitations]);

    const sendInvitation = () => {
        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail || processing) return;

        setProcessing(true);

        router.post(
            '/barbers/invitations',
            { email: normalizedEmail },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setDialogOpen(false);
                    setEmail('');
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

    const revokeInvitation = (invitationId: number) => {
        if (revokingId !== null) return;

        setRevokingId(invitationId);

        router.delete(`/barbers/invitations/${invitationId}`, {
            preserveScroll: true,
            onFinish: () => setRevokingId(null),
        });
    };

    const formatDate = (date: string) =>
        new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        }).format(new Date(date));

    return (
        <>
            <Head title="Barbeiros" />

            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6 lg:p-8">
                {/* Cabeçalho */}
                <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 sm:p-7">
                    <div className="absolute -right-10 -top-14 h-48 w-48 rounded-full bg-accent/70 blur-3xl" />

                    <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Scissors className="h-4 w-4" />
                                <span>Equipe</span>
                            </div>

                            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                                Barbeiros
                            </h1>

                            <p className="max-w-lg text-sm leading-6 text-muted-foreground">
                                Gerencie os profissionais da sua barbearia e
                                convide novos integrantes para sua equipe.
                            </p>
                        </div>

                        <Button
                            onClick={() => setDialogOpen(true)}
                            className="w-full gap-2 sm:w-auto"
                        >
                            <MailPlus className="h-4 w-4" />
                            Convidar barbeiro
                        </Button>
                    </div>
                </div>

                {/* Indicadores */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Card className="rounded-2xl shadow-sm">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-foreground">
                                <UsersRound className="h-5 w-5" />
                            </div>

                            <div className="min-w-0">
                                <p className="text-sm text-muted-foreground">
                                    Barbeiros cadastrados
                                </p>
                                <p className="mt-1 text-2xl font-semibold tabular-nums">
                                    {barbers.length}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-2xl shadow-sm">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-foreground">
                                <Mail className="h-5 w-5" />
                            </div>

                            <div className="min-w-0">
                                <p className="text-sm text-muted-foreground">
                                    Convites pendentes
                                </p>
                                <p className="mt-1 text-2xl font-semibold tabular-nums">
                                    {pendingInvitations.length}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Lista de barbeiros */}
                <section className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-lg font-semibold tracking-tight">
                                Sua equipe
                            </h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Profissionais vinculados a esta barbearia.
                            </p>
                        </div>

                        <div className="relative w-full sm:max-w-xs">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Buscar profissional..."
                                className="h-10 rounded-xl pl-9"
                            />
                        </div>
                    </div>

                    <Card className="overflow-hidden rounded-2xl shadow-sm">
                        {filteredBarbers.length > 0 ? (
                            <div className="divide-y divide-border">
                                {filteredBarbers.map((barber) => (
                                    <div
                                        key={barber.id}
                                        className="flex items-center gap-3 p-4 sm:gap-4 sm:p-5"
                                    >
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-foreground">
                                            <UserRound className="h-5 w-5" />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-medium">
                                                {barber.name}
                                            </p>
                                            <p className="mt-1 truncate text-sm text-muted-foreground">
                                                {barber.email}
                                            </p>
                                        </div>

                                        <Badge
                                            variant="secondary"
                                            className="shrink-0 rounded-full font-normal"
                                        >
                                            Barbeiro
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center px-5 py-12 text-center">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent">
                                    <UsersRound className="h-6 w-6 text-muted-foreground" />
                                </div>

                                <h3 className="mt-4 font-medium">
                                    {search
                                        ? 'Nenhum profissional encontrado'
                                        : 'Sua equipe começa aqui'}
                                </h3>

                                <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                                    {search
                                        ? 'Tente pesquisar por outro nome ou e-mail.'
                                        : 'Convide seu primeiro barbeiro para que ele possa fazer parte da sua barbearia.'}
                                </p>

                                {!search && (
                                    <Button
                                        variant="outline"
                                        className="mt-5 gap-2 rounded-xl"
                                        onClick={() => setDialogOpen(true)}
                                    >
                                        <MailPlus className="h-4 w-4" />
                                        Enviar convite
                                    </Button>
                                )}
                            </div>
                        )}
                    </Card>
                </section>

                {/* Convites enviados */}
                <section className="space-y-4">
                    <div>
                        <h2 className="text-lg font-semibold tracking-tight">
                            Convites enviados
                        </h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Acompanhe os convites e gerencie os que ainda estão
                            pendentes.
                        </p>
                    </div>

                    <Card className="overflow-hidden rounded-2xl shadow-sm">
                        {invitations.length > 0 ? (
                            <div className="divide-y divide-border">
                                {invitations.map((invitation) => {
                                    const expired =
                                        new Date(invitation.expires_at).getTime() <=
                                        Date.now();

                                    const status = invitation.accepted_at
                                        ? 'Aceito'
                                        : invitation.revoked_at
                                          ? 'Revogado'
                                          : expired
                                            ? 'Expirado'
                                            : 'Pendente';

                                    const isPending = status === 'Pendente';

                                    return (
                                        <div
                                            key={invitation.id}
                                            className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
                                        >
                                            <div className="flex min-w-0 items-start gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent">
                                                    <Mail className="h-4 w-4" />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <p className="break-all text-sm font-medium">
                                                        {invitation.email}
                                                    </p>

                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        Enviado em{' '}
                                                        {formatDate(invitation.created_at)}
                                                    </p>

                                                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                                        <Clock3 className="h-3 w-3" />
                                                        {isPending
                                                            ? `Expira em ${formatDate(invitation.expires_at)}`
                                                            : `Validade: ${formatDate(invitation.expires_at)}`}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between gap-3 sm:justify-end">
                                                <Badge
                                                    variant={
                                                        isPending
                                                            ? 'outline'
                                                            : status === 'Aceito'
                                                              ? 'secondary'
                                                              : 'destructive'
                                                    }
                                                    className="rounded-full font-normal"
                                                >
                                                    {status}
                                                </Badge>

                                                {isPending && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        disabled={revokingId !== null}
                                                        onClick={() =>
                                                            revokeInvitation(invitation.id)
                                                        }
                                                        className="text-muted-foreground hover:text-destructive"
                                                    >
                                                        {revokingId === invitation.id
                                                            ? 'Revogando...'
                                                            : 'Revogar'}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center px-5 py-10 text-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
                                    <Mail className="h-5 w-5 text-muted-foreground" />
                                </div>

                                <h3 className="mt-3 font-medium">
                                    Nenhum convite enviado
                                </h3>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Os convites enviados aparecerão aqui.
                                </p>
                            </div>
                        )}
                    </Card>
                </section>
            </div>

            {/* Modal de convite */}
            <Dialog
                open={dialogOpen}
                onOpenChange={(open) => {
                    if (!processing) {
                        setDialogOpen(open);
                        if (!open) setEmail('');
                    }
                }}
            >
                <DialogContent className="w-[calc(100%-2rem)] rounded-2xl sm:max-w-md">
                    <DialogHeader>
                        <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-accent">
                            <MailPlus className="h-5 w-5" />
                        </div>

                        <DialogTitle className="text-xl">
                            Convidar barbeiro
                        </DialogTitle>

                        <DialogDescription className="leading-6">
                            Informe o e-mail do profissional. Ele receberá um
                            convite para fazer parte da sua barbearia.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-2 py-2">
                        <label
                            htmlFor="barber-email"
                            className="text-sm font-medium"
                        >
                            E-mail do profissional
                        </label>

                        <Input
                            id="barber-email"
                            type="email"
                            autoComplete="email"
                            placeholder="profissional@email.com"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            onKeyDown={(event) => {
                                if (
                                    event.key === 'Enter' &&
                                    email.trim() &&
                                    !processing
                                ) {
                                    sendInvitation();
                                }
                            }}
                            disabled={processing}
                            className="h-11 rounded-xl"
                        />

                        <p className="text-xs leading-5 text-muted-foreground">
                            O convite será vinculado a esta barbearia e terá
                            acesso de barbeiro após ser aceito.
                        </p>
                    </div>

                    <DialogFooter className="flex-col gap-2 sm:flex-row">
                        <Button
                            variant="outline"
                            disabled={processing}
                            onClick={() => setDialogOpen(false)}
                            className="rounded-xl"
                        >
                            Cancelar
                        </Button>

                        <Button
                            onClick={sendInvitation}
                            disabled={
                                !email.trim() ||
                                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
                                processing
                            }
                            className="gap-2 rounded-xl"
                        >
                            <MailPlus className="h-4 w-4" />
                            {processing ? 'Enviando...' : 'Enviar convite'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
