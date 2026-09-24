import React from 'react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
function AlertConfirmation({ children, stopInterview }) {
    return (
        <AlertDialog>
            <AlertDialogTrigger>{children}</AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Da li ste sigurni?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Intervju će se završiti i ova radnja se ne može poništiti.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Odustani</AlertDialogCancel>
                    <AlertDialogAction onClick={() => stopInterview()}>Završi intervju</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

    )
}

export default AlertConfirmation
