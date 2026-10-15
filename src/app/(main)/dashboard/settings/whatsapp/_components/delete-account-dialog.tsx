"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import type { Account } from "./types";

interface DeleteAccountDialogProps {
  account: Account | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteAccountDialog({ account, open, onOpenChange, onConfirm, isDeleting }: DeleteAccountDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle>حذف الحساب</AlertDialogTitle>
          <AlertDialogDescription>
            هل أنت متأكد من حذف الحساب <strong>{account?.display_name}</strong>؟
            <br />
            <br />
            هذا الإجراء سيقوم بإزالة سجل الحساب من قاعدة البيانات فقط ولن يؤثر على البوت نفسه.
            <br />
            <br />
            لا يمكن التراجع عن هذا الإجراء.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>إلغاء</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "جاري الحذف..." : "حذف"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
