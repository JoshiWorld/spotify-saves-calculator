"use client";

import { useEffect, useState } from "react";
import { api } from "@/trpc/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { FileEditIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package } from "@prisma/client";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type User = {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  package: Package | null;
};

export function Users() {
  const { data: users, isLoading } = api.user.getAll.useQuery();

  if(isLoading) return <p>Loading Users..</p>;

  return (
    <div className="flex w-full flex-col">
      {users!.length !== 0 ? (
        <UsersTable users={users!} />
      ) : (
        <p>Es gibt noch keine Nutzer.</p>
      )}
    </div>
  );
}

function UsersTable({ users }: { users: User[] }) {
  const [editingUser, setEditingUser] = useState<User | null>(null);

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>E-Mail</TableHead>
            <TableHead>Verifiziert</TableHead>
            <TableHead>Paket</TableHead>
            <TableHead className="text-center">Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user, index) => (
            <TableRow key={`${index}`}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.emailVerified ? "Ja" : "Nein"}</TableCell>
              <TableCell>{user.package}</TableCell>
              <TableCell className="flex justify-center">
                <FileEditIcon
                  className="text-white transition-colors hover:cursor-pointer hover:text-yellow-500"
                  onClick={() => setEditingUser(user)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editingUser && (
        <EditUser userId={editingUser.id} onClose={() => setEditingUser(null)} />
      )}
    </div>
  );
}

function EditUser({
  userId,
  onClose,
}: {
  userId: string;
  onClose: () => void;
}) {
  const utils = api.useUtils();
  const { toast } = useToast();
  const { data: user } = api.user.getById.useQuery({id: userId});

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [pack, setPack] = useState<string | undefined>(undefined);

  useEffect(() => {
    if(user) {
        setName(user.name ?? "");
        setEmail(user.email ?? "");
        setPack(user.package ?? undefined);
    }
  }, [user]);

  const updateUser = api.user.updateById.useMutation({
    onSuccess: async () => {
      await utils.user.invalidate();
      toast({
        variant: "default",
        title: "Der User wurde erfolgreich gespeichert",
      });
      onClose();
    },
  });

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Produkt bearbeiten</SheetTitle>
          <SheetDescription>
            Hier kannst du Änderungen an einem Produkt vornehmen
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              E-Mail
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Paket
            </Label>
            <Select value={pack} onValueChange={setPack}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Paket auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {Object.values(Package).map((pack, index) => (
                    <SelectItem key={index} value={pack}>
                      {pack}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button
              type="submit"
              disabled={updateUser.isPending}
              onClick={() =>
                updateUser.mutate({
                  id: userId,
                  name,
                  email,
                  package: pack as Package,
                })
              }
            >
              {updateUser.isPending ? "Wird gespeichert..." : "Speichern"}
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
