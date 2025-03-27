"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Editor } from "./editor";

export function CreateForumPost() {

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Beitrag erstellen</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[1200px]">
          <DialogHeader>
            <DialogTitle>Beitrag erstellen</DialogTitle>
            <DialogDescription>
              Hier kannst du einen Forum-Beitrag erstellen
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Editor />
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full" form="post-form">Erstellen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
}