"use client";

import { useState } from "react";

import { Settings } from "lucide-react";

import { Button } from "@/components/ui/button";

import { SettingsDialog } from "./settings-dialog";

export function SettingsTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="icon" onClick={() => setOpen(true)}>
        <Settings />
      </Button>
      <SettingsDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
