"use client";

import { useState } from "react";
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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  type Product,
} from "@prisma/client";
import { FileEditIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { IconTrash } from "@tabler/icons-react";

export function Products() {
  const [products] = api.product.getAll.useSuspenseQuery();

  return (
    <div className="flex w-full flex-col">
      {products.length !== 0 ? (
        <ProductsTable products={products} />
      ) : (
        <p>Du hast noch kein Produkt erstellt</p>
      )}
      <CreateProduct />
    </div>
  );
}

function CreateProduct() {
  const { toast } = useToast();
  const utils = api.useUtils();
  const [name, setName] = useState<string>("");
  const [price, setPrice] = useState<number>(0);
  const [subText, setSubText] = useState<string>("");
  const [features, setFeatures] = useState<string[]>([""]);
  const [featured, setFeatured] = useState<boolean>(false);
  const [buttonText, setButtonText] = useState<string>("");
  const [additionalFeatures, setAdditionalFeatures] = useState<string[]>([""]);
  const [link, setLink] = useState<string>("");

  const createProduct = api.product.create.useMutation({
    onSuccess: async () => {
      await utils.product.invalidate();
      toast({
        variant: "default",
        title: "Das Produkt wurde erstellt",
        description: `Name: ${name}`,
      });
      setName("");
      setPrice(0);
      setSubText("");
      setFeatures([""]);
      setFeatured(false);
      setButtonText("");
      setAdditionalFeatures([""]);
      setLink("");
    },
  });

  const handleInputChangeFeatures = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };
  const handleInputChangeAdditionalFeatures = (index: number, value: string) => {
    const newFeatures = [...additionalFeatures];
    newFeatures[index] = value;
    setAdditionalFeatures(newFeatures);
  };

  const handleKeyPressFeatures = (
    e: React.KeyboardEvent<HTMLInputElement>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    index: number,
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setFeatures([...features, ""]);
    }
  };
  const handleKeyPressAdditionalFeatures = (
    e: React.KeyboardEvent<HTMLInputElement>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    index: number,
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setAdditionalFeatures([...additionalFeatures, ""]);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" className="mt-2">
          Erstellen
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Produkt erstellen</DialogTitle>
          <DialogDescription>
            Hier kannst du ein Produkt erstellen
          </DialogDescription>
        </DialogHeader>
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
            <Label htmlFor="price" className="text-right">
              Preis
            </Label>
            <Input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
        </div>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="subtext" className="text-right">
              Untertitel
            </Label>
            <Input
              id="subtext"
              type="text"
              value={subText}
              onChange={(e) => setSubText(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <div className="grid gap-4 py-4">
          {features.map((feature, index) => (
            <div key={index} className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor={`feature-${index}`} className="text-right">
                Feature {index + 1}
              </Label>
              <Input
                id={`feature-${index}`}
                type="text"
                value={feature}
                onChange={(e) =>
                  handleInputChangeFeatures(index, e.target.value)
                }
                onKeyDown={(e) => handleKeyPressFeatures(e, index)}
                className="col-span-3"
              />
            </div>
          ))}
        </div>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="featured" className="text-right">
              Empfohlen
            </Label>
            <Checkbox
              id="featured"
              checked={featured}
              onCheckedChange={(value) => setFeatured(Boolean(value))}
            />
          </div>
        </div>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="buttontext" className="text-right">
              Button Text
            </Label>
            <Input
              id="buttontext"
              type="text"
              value={buttonText}
              onChange={(e) => setButtonText(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <div className="grid gap-4 py-4">
          {additionalFeatures.map((feature, index) => (
            <div key={index} className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor={`additionalFeature-${index}`}
                className="text-right"
              >
                Zusätzliches Feature {index + 1}
              </Label>
              <Input
                id={`additionalFeature-${index}`}
                type="text"
                value={feature}
                onChange={(e) =>
                  handleInputChangeAdditionalFeatures(index, e.target.value)
                }
                onKeyDown={(e) => handleKeyPressAdditionalFeatures(e, index)}
                className="col-span-3"
              />
            </div>
          ))}
        </div>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="link" className="text-right">
              Copecart Link
            </Label>
            <Input
              id="link"
              type="text"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="submit"
              disabled={createProduct.isPending}
              onClick={() =>
                createProduct.mutate({
                  name,
                  price,
                  subText,
                  features,
                  featured,
                  buttonText,
                  additionalFeatures,
                  link,
                })
              }
            >
              {createProduct.isPending ? "Wird erstellt..." : "Erstellen"}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ProductsTable({ products }: { products: Product[] }) {
  const utils = api.useUtils();
  const { toast } = useToast();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const deleteProduct = api.product.delete.useMutation({
    onSuccess: async () => {
      await utils.product.invalidate();
      toast({
        variant: "destructive",
        title: "Das Produkt wurde erfolgreich gelöscht",
      });
    },
  });

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Preis</TableHead>
            <TableHead>Featured</TableHead>
            <TableHead className="text-center">Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={`${product.name}`}>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>{product.price.toLocaleString("DE")} €</TableCell>
              <TableCell>{product.featured ? "Ja" : "Nein"}</TableCell>
              <TableCell className="flex items-center justify-between">
                <FileEditIcon
                  className="text-white transition-colors hover:cursor-pointer hover:text-yellow-500"
                  onClick={() => setEditingProduct(product)}
                />
                <IconTrash
                  className="text-white transition-colors hover:cursor-pointer hover:text-red-500"
                  onClick={() => deleteProduct.mutate({ id: product.id })}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editingProduct && (
        <EditProduct
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
        />
      )}
    </div>
  );
}

function EditProduct({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const utils = api.useUtils();
  const { toast } = useToast();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const [name, setName] = useState<string>(product.name);
  const [price, setPrice] = useState<number>(product.price);
  // @ts-expect-error || IGNORE
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const [subText, setSubText] = useState<string>(product.subText);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const [features, setFeatures] = useState<string[]>(product.features);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const [featured, setFeatured] = useState<boolean>(product.featured);
  // @ts-expect-error || IGNORE
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const [buttonText, setButtonText] = useState<string>(product.buttonText);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const [additionalFeatures, setAdditionalFeatures] = useState<string[]>(product.additionalFeatures);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const [link, setLink] = useState<string>(product.link);

  const updateProduct = api.product.update.useMutation({
    onSuccess: async () => {
      await utils.product.invalidate();
      toast({
        variant: "default",
        title: "Das Produkt wurde erfolgreich gespeichert",
      });
      onClose();
    },
  });

  const handleInputChangeFeatures = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };
  const handleInputChangeAdditionalFeatures = (
    index: number,
    value: string,
  ) => {
    const newFeatures = [...additionalFeatures];
    newFeatures[index] = value;
    setAdditionalFeatures(newFeatures);
  };

  const handleKeyPressFeatures = (
    e: React.KeyboardEvent<HTMLInputElement>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    index: number,
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setFeatures([...features, ""]);
    }
  };
  const handleKeyPressAdditionalFeatures = (
    e: React.KeyboardEvent<HTMLInputElement>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    index: number,
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setAdditionalFeatures([...additionalFeatures, ""]);
    }
  };

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
            <Label htmlFor="price" className="text-right">
              Preis
            </Label>
            <Input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
        </div>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="subtext" className="text-right">
              Untertitel
            </Label>
            <Input
              id="subtext"
              type="text"
              value={subText}
              onChange={(e) => setSubText(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <div className="grid gap-4 py-4">
          {features.map((feature, index) => (
            <div key={index} className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor={`feature-${index}`} className="text-right">
                Feature {index + 1}
              </Label>
              <Input
                id={`feature-${index}`}
                type="text"
                value={feature}
                onChange={(e) =>
                  handleInputChangeFeatures(index, e.target.value)
                }
                onKeyDown={(e) => handleKeyPressFeatures(e, index)}
                className="col-span-3"
              />
            </div>
          ))}
        </div>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="featured" className="text-right">
              Empfohlen
            </Label>
            <Checkbox
              id="featured"
              checked={featured}
              onCheckedChange={(value) => setFeatured(Boolean(value))}
            />
          </div>
        </div>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="buttontext" className="text-right">
              Button Text
            </Label>
            <Input
              id="buttontext"
              type="text"
              value={buttonText}
              onChange={(e) => setButtonText(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <div className="grid gap-4 py-4">
          {additionalFeatures.map((feature, index) => (
            <div key={index} className="grid grid-cols-4 items-center gap-4">
              <Label
                htmlFor={`additionalFeature-${index}`}
                className="text-right"
              >
                Zusätzliches Feature {index + 1}
              </Label>
              <Input
                id={`additionalFeature-${index}`}
                type="text"
                value={feature}
                onChange={(e) =>
                  handleInputChangeAdditionalFeatures(index, e.target.value)
                }
                onKeyDown={(e) => handleKeyPressAdditionalFeatures(e, index)}
                className="col-span-3"
              />
            </div>
          ))}
        </div>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="link" className="text-right">
              Copecart Link
            </Label>
            <Input
              id="link"
              type="text"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button
              type="submit"
              disabled={updateProduct.isPending}
              onClick={() =>
                updateProduct.mutate({
                  id: product.id,
                  name,
                  price,
                  subText,
                  features,
                  featured,
                  buttonText,
                  additionalFeatures,
                  link,
                })
              }
            >
              {updateProduct.isPending ? "Wird gespeichert..." : "Speichern"}
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
