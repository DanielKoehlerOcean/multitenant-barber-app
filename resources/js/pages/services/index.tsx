import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useMemo, useRef, useState } from 'react';

import {
    Search,
    Plus,
    MoreHorizontal,
    Pencil,
    Trash2,
    Clock3,
    Scissors,
    ImagePlus,
    Upload,
    X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from '@/components/ui/card';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Toaster } from '@/components/ui/toaster';
import { toast } from '@/components/ui/use-toast';
import MoneyInput from '@/components/ui/money-input';
import DeleteDialog from '@/components/services/delete-dialog';
import  {GlassCalendar} from '@/components/glass-calendar';

interface Service {
    id: number;
    name: string;
    value: number;
    duration: number;
    photo_path: string;
    mime_type: string;
    original_name: string;
    file_size: string;
}

interface Props {
    services: Service[];
}

export default function Index({ services }: Props) {
    const [search, setSearch] = useState('');
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [formOpen, setFormOpen] = useState(false);

    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const { flash } = usePage().props;

    const {
        data,
        setData,
        reset,
        clearErrors,
        put,
        post,
        processing,
        setError,
        errors,
        transform,
    } = useForm({
        name: '',
        value: 0,
        duration: '',
        photo: null as File | null,
    });

    const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith('image/')) {
            setError('photo', 'Selecione uma imagem válida.');

            return;
        }

        clearErrors('photo');

        setData('photo', file);

        const previewUrl = URL.createObjectURL(file);

        setPhotoPreview((previous) => {
            if (previous?.startsWith('blob:')) {
                URL.revokeObjectURL(previous);
            }

            return previewUrl;
        });
    };

    const removePhoto = () => {
        setData('photo', null);
        setPhotoPreview(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const filteredServices = useMemo(() => {
        const searchValue = search.trim().toLowerCase();

        if (!searchValue) {
            return services;
        }

        return services.filter((service) =>
            service.name.toLowerCase().includes(searchValue),
        );
    }, [services, search]);

    const openCreate = () => {
        reset();
        clearErrors();

        setEditingService(null);
        setFormOpen(true);
    };

    const openEdit = (service: Service) => {
        clearErrors();

        setData({
            name: service.name,
            value: String(service.value),
            duration: String(service.duration),
            photo: '',
        });

        setEditingService(service);
        setFormOpen(true);
    };

    const closeDialog = () => {
        if (processing) {
            return;
        }

        setFormOpen(false);
        setEditingService(null);
        clearErrors();
    };

    function validateFields() {
        let isValid = true;

        // Limpa os erros antes de revalidar (caso você tenha extraído clearErrors do useForm)
        clearErrors();

        // 1. Valida o Nome (Garante que não seja vazio e previne erro no trim convertendo para String)
        if (!String(data.name).trim()) {
            setError('name', 'O nome do serviço é obrigatório');
            isValid = false;
        }

        // 2. Valida o Valor (Não pode ser vazio, zero ou negativo)
        if (!data.value || Number(data.value) <= 0) {
            setError('value', 'O preço deve ser maior que zero');
            isValid = false;
        }

        // 3. Valida a Duração (Não pode ser zero)
        if (!data.duration || Number(data.duration) <= 0) {
            setError('duration', 'A duração deve ser de pelo menos 1 minuto');
            isValid = false;
        }

        return isValid;
    }

    function submit() {
        if (validateFields()) {
            if (editingService) {
                transform((data) => ({
                    ...data,
                    _method: 'PUT',
                }));

                put(`/services/${editingService.id}`, {
                    forceFormData: true,
                    preserveScroll: true,

                    onSuccess: () => {
                        setFormOpen(false);
                        setEditingService(null);
                        setPhotoPreview(null);
                        reset();

                        toast({
                            title: "Sucesso!",
                            description: "Serviço Atualizado com sucesso."
                        });
                    },
                });

                return;
            }

            post('/services', {
                forceFormData: true,
                preserveScroll: true,

                onSuccess: () => {
                    setFormOpen(false);
                    setPhotoPreview(null);
                    reset();

                    toast({
                        title: "Sucesso!",
                        description: "Serviço cadastrado com sucesso."
                    });
                },
            });
        }
    }

    const formatPrice = (value: number | string) => {
        return Number(value).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        });
    };

    const formatDuration = (duration: number) => {
        if (duration < 60) {
            return `${duration} min`;
        }

        const hours = Math.floor(duration / 60);
        const minutes = duration % 60;

        if (!minutes) {
            return `${hours}h`;
        }

        return `${hours}h ${minutes}min`;
    };

    const formatFileSize = (size: number) => {
        if (size < 1024 * 1024) {
            return `${(size / 1024).toFixed(0)} KB`;
        }

        return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <>
            <Head title="Serviços" />
            <Toaster></Toaster>
            <div className="bg-background">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                    <div className="space-y-7">
                        {/* Header */}
                        <Card className="relative overflow-hidden rounded-3xl border bg-card bg-gradient-to-br from-card to-muted/30 px-5 py-6 shadow-sm shadow-xs sm:px-7 sm:py-8">
                            <div className="absolute -top-10 -right-10 size-24 rounded-full bg-primary/30 blur-2xl" />
                            <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                                <div className="max-w-xl">
                                    <div className="mb-3 flex items-center gap-2">
                                        <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10">
                                            <Scissors className="size-4 text-primary" />
                                        </div>

                                        <span className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
                                            Catálogo
                                        </span>
                                    </div>

                                    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                                        Serviços
                                    </h1>

                                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                                        Organize os serviços da sua barbearia e
                                        mantenha seu catálogo sempre atualizado.
                                    </p>
                                </div>

                                <Button
                                    type="button"
                                    onClick={openCreate}
                                    size="lg"
                                    className="h-11 w-full rounded-xl px-5 shadow-sm sm:w-auto"
                                >
                                    <Plus className="mr-2 size-4" />
                                    Novo serviço
                                </Button>
                            </div>

                            <div className="pointer-events-none absolute -right-16 -bottom-20 size-56 rounded-full bg-primary/5 blur-3xl" />
                        </Card>

                        {/* Busca */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="relative w-full sm:max-w-sm">
                                <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />

                                <Input
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Buscar serviço..."
                                    className="h-11 rounded-xl border-muted-foreground/20 bg-card pl-10 shadow-sm transition-shadow focus-visible:shadow-md"
                                />
                            </div>

                            <p className="text-sm text-muted-foreground">
                                {filteredServices.length}{' '}
                                {filteredServices.length === 1
                                    ? 'serviço'
                                    : 'serviços'}
                            </p>
                        </div>

                        {/* Lista */}
                        {filteredServices.length === 0 ? (
                            <Card className="overflow-hidden rounded-3xl border-dashed shadow-none">
                                <CardContent className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
                                    <div className="relative mb-5">
                                        <div className="flex size-20 items-center justify-center rounded-3xl bg-muted">
                                            <Scissors className="size-8 text-muted-foreground/50" />
                                        </div>

                                        {!search && (
                                            <div className="absolute -right-1 -bottom-1 flex size-7 items-center justify-center rounded-full border-4 border-background bg-primary text-primary-foreground">
                                                <Plus className="size-3.5" />
                                            </div>
                                        )}
                                    </div>

                                    <h2 className="text-lg font-semibold">
                                        {search
                                            ? 'Nenhum serviço encontrado'
                                            : 'Comece seu catálogo'}
                                    </h2>

                                    <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                                        {search
                                            ? 'Não encontramos nenhum serviço com esse nome. Tente realizar uma nova busca.'
                                            : 'Cadastre os serviços oferecidos pela sua barbearia para utilizá-los nos agendamentos.'}
                                    </p>

                                    {!search && (
                                        <Button
                                            type="button"
                                            onClick={openCreate}
                                            variant="outline"
                                            className="mt-6 rounded-xl"
                                        >
                                            <Plus className="mr-2 size-4" />
                                            Adicionar serviço
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                                {filteredServices.map((service) => (
                                    <Card
                                        key={service.id}
                                        className="group overflow-hidden rounded-3xl border-border/60 bg-card py-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-border hover:shadow-xl"
                                    >
                                        {/* Imagem */}
                                        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                                            {service.photo_path ? (
                                                <img
                                                    src={`/services/${service.id}/photo`}
                                                    alt={service.name}
                                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                                                    <div className="flex size-16 items-center justify-center rounded-2xl bg-background/70 shadow-sm backdrop-blur">
                                                        <Scissors className="size-7 text-muted-foreground/40" />
                                                    </div>
                                                </div>
                                            )}

                                            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                        </div>

                                        {/* Informações */}
                                        <CardHeader className="px-5 pt-5 pb-2">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <h2 className="truncate text-base font-semibold tracking-tight">
                                                        {service.name}
                                                    </h2>

                                                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                                                        <Clock3 className="size-3.5" />

                                                        <span>
                                                            {formatDuration(
                                                                service.duration,
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="shrink-0 text-right">
                                                    <p className="text-lg font-semibold tracking-tight">
                                                        {formatPrice(
                                                            service.value,
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="px-5 pb-4">
                                            <div className="h-px bg-border/60" />
                                        </CardContent>

                                        <CardFooter className="flex flex-row justify-center gap-3 px-12 pt-0 pb-5">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="h-11 justify-between rounded-xl px-3 text-muted-foreground hover:bg-muted hover:text-foreground"
                                                onClick={() =>
                                                    openEdit(service)
                                                }
                                            >
                                                Editar serviço
                                                <Pencil className="size-3.5" />
                                            </Button>
                                            <DeleteDialog
                                                id={service.id}
                                                name={service.name}
                                            ></DeleteDialog>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Dialog de criação/edição */}
            <Dialog
                open={formOpen}
                onOpenChange={(open) => {
                    if (processing) {
                        return;
                    }

                    setFormOpen(open);

                    if (!open) {
                        setEditingService(null);
                        clearErrors();
                    }
                }}
            >
                <DialogContent className="max-h-[92vh] w-[calc(100vw-2rem)] max-w-lg min-w-0 overflow-x-hidden overflow-y-auto rounded-3xl p-0 sm:w-full">
                    <div className="min-w-0 space-y-5 px-1">
                        <DialogHeader className="border-b px-6 py-5">
                            <DialogTitle className="text-lg">
                                {editingService
                                    ? 'Editar serviço'
                                    : 'Novo serviço'}
                            </DialogTitle>

                            <DialogDescription className="text-sm">
                                {editingService
                                    ? 'Atualize as informações do serviço.'
                                    : 'Adicione um novo serviço ao catálogo da sua barbearia.'}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-5 px-6 py-6">
                            {/* Nome */}
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome do serviço</Label>

                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(event) => {
                                        setData('name', event.target.value);
                                    }}
                                    placeholder="Ex.: Corte masculino"
                                    className="h-11 rounded-xl"
                                    autoFocus
                                />
                                {errors.name && (
                                    <span className="text-xs text-destructive">
                                        {errors.name}
                                    </span>
                                )}
                            </div>

                            {/* Preço e duração */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="value">Preço</Label>

                                    <div className="relative">
                                        <MoneyInput
                                            id="value"
                                            value={data.value}
                                            onChange={(event) => {
                                                setData('value', event);
                                            }}
                                            className="h-11 rounded-xl"
                                        ></MoneyInput>
                                    </div>
                                    {errors.value && (
                                        <span className="text-xs text-destructive">
                                            {errors.value}
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="duration">Duração</Label>

                                    <div className="relative">
                                        <Input
                                            id="duration"
                                            type="number"
                                            min="1"
                                            step="1"
                                            value={data.duration}
                                            onKeyDown={(e) => {
                                                if (
                                                    e.key === '-' ||
                                                    e.key === 'e'
                                                ) {
                                                    e.preventDefault();
                                                }
                                            }}
                                            onChange={(event) => {
                                                setData(
                                                    'duration',
                                                    event.target.value,
                                                );
                                            }}
                                            placeholder="45"
                                            className="h-11 rounded-xl pr-14"
                                        />

                                        <span className="absolute top-1/2 right-3 -translate-y-1/2 text-xs text-muted-foreground">
                                            min
                                        </span>
                                    </div>
                                    {errors.duration && (
                                        <span className="text-xs text-destructive">
                                            {errors.duration}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Foto */}
                            <div className="space-y-2">
                                <Label>Foto do serviço</Label>

                                {photoPreview ? (
                                    <div className="w-full min-w-0 overflow-hidden rounded-2xl border bg-muted">
                                        <div className="relative h-48 w-full overflow-hidden sm:h-56">
                                            <img
                                                src={photoPreview}
                                                alt="Prévia da foto"
                                                className="absolute inset-0 block h-full w-full object-cover"
                                            />
                                        </div>

                                        <div className="flex min-w-0 items-center justify-between gap-3 border-t bg-background px-4 py-3">
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">
                                                    {data.photo?.name ??
                                                        'Imagem atual'}
                                                </p>

                                                {data.photo && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatFileSize(
                                                            data.photo.size,
                                                        )}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex shrink-0 gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="rounded-lg"
                                                    onClick={() =>
                                                        fileInputRef.current?.click()
                                                    }
                                                >
                                                    Alterar
                                                </Button>

                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-8 shrink-0 rounded-lg"
                                                    onClick={removePhoto}
                                                >
                                                    <X className="size-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                        className="group flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/20 px-6 py-8 text-center transition-all hover:border-primary/40 hover:bg-primary/[0.03]"
                                    >
                                        <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-background shadow-sm transition-transform group-hover:scale-105">
                                            <Upload className="size-5 text-muted-foreground transition-colors group-hover:text-primary" />
                                        </div>

                                        <p className="text-sm font-medium">
                                            Adicionar uma foto
                                        </p>

                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Clique para selecionar uma imagem
                                        </p>

                                        <p className="mt-3 text-[11px] text-muted-foreground/70">
                                            JPG, PNG ou WEBP • até 5 MB
                                        </p>
                                    </button>
                                )}

                                <Input
                                    ref={fileInputRef}
                                    id="photo"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handlePhotoChange}
                                    className="hidden"
                                />

                                {errors.photo && (
                                    <p className="text-xs text-destructive">
                                        {errors.photo}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <DialogFooter className="border-t bg-muted/20 px-6 py-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeDialog}
                                disabled={processing}
                                className="rounded-xl"
                            >
                                Cancelar
                            </Button>

                            <Button
                                type="button"
                                disabled={processing}
                                onClick={submit}
                                className="rounded-xl"
                            >
                                {processing
                                    ? 'Salvando...'
                                    : editingService
                                      ? 'Salvar alterações'
                                      : 'Cadastrar serviço'}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
