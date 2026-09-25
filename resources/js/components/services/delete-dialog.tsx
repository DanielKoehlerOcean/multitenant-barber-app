import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { router, usePage } from '@inertiajs/react';
import { toast } from '../ui/use-toast';
import { Trash2 } from 'lucide-react';

export default function DeleteDialog({ id, name }) {
    const [openDialog, setOpenDialog] = useState(false);
    const [processing, setProcessing] = useState(false);

    const { flash } = usePage().props;

    function handleDelete() {
        router.delete(`/services/${id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setOpenDialog(false);
                toast({
                    title: 'Serviço Deletado',
                    description: 'Serviço deletado com sucesso.',
                });
            },
        });
    }

    return (
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger>
                <Button
                    type="button"
                    variant="outline"
                    className="h-11 w-full justify-between rounded-xl px-3 text-destructive border-destructive/50 bg-destructive/20 hover:bg-destructive/40 hover:text-destructive"
                >
                    Excluir
                    <Trash2 className="size-3.5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="w-[calc(100%-1.5rem)] max-w-lg rounded-3xl p-0">
                <DialogHeader className="px-6 py-5">
                    <DialogTitle className="text-lg">
                        Deletar serviço
                    </DialogTitle>

                    <DialogDescription className="text-sm">
                        Pressione o botão abaixo para confirmar que quer deletar o Serviço "{name}".
                    </DialogDescription>
                </DialogHeader>

              

                {/* Footer */}
                <DialogFooter className="border-t bg-muted/20 px-6 py-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpenDialog(false)}
                        disabled={processing}
                        className="rounded-xl"
                    >
                        Cancelar
                    </Button>

                    <Button
                        type="button"
                        disabled={processing}
                        onClick={handleDelete}
                        className="rounded-xl bg-destructive"
                        variant={'destructive'}
                    >
                        {processing ? 'Deletando Serviço' : 'Deletar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
