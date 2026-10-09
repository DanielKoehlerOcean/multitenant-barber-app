import { Dialog, DialogContent, DialogFooter, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { useState } from "react";
import { router } from "@inertiajs/react";
import { toast } from "../ui/use-toast";

export default function CancelSchedule({id}: {id: number}){
    const [openDialog, setOpenDialog] = useState(false);
    
    function submit(){
        router.delete(`/schedules/destroy/${id}`, {
            onSuccess: () => {
                toast({
                    title: 'Agendamento deletado',
                    description: 'Agendamento deletado com sucesso'
                });
            }
        })
    }
    
    return (
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger>
                <Button size={'sm'} variant={'destructive'}>Cancelar</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>Cancelar Agendamento</DialogTitle>
                <span>Pressione o botão abaixo para cancelar o seu agendamento.</span>
                 <DialogFooter className="gap-3">
                    <Button variant={'outline'} className="py-5" size={'sm'} onClick={() => setOpenDialog(false)}>Cancelar</Button>
                    <Button variant={'destructive'} className="py-5" onClick={submit} size={'sm'}>Confirmar</Button>
                </DialogFooter>
            </DialogContent>
           
        </Dialog>
    )
}