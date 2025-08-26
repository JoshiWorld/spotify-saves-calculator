"use client"

import * as React from "react"
import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
    IconChevronLeft,
    IconChevronRight,
    IconChevronsLeft,
    IconChevronsRight,
    IconDotsVertical,
    IconGripVertical,
    IconPlus,
} from "@tabler/icons-react"
import {
    type ColumnDef,
    type ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    type Row,
    type SortingState,
    useReactTable,
    type VisibilityState,
} from "@tanstack/react-table"
import { toast } from "sonner"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Tabs,
    TabsContent,
} from "@/components/ui/tabs"
import { api } from "@/trpc/react"
import { LoadingDots } from "@/components/ui/loading"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"

export const schema = z.object({
    id: z.string(),
    projectId: z.string(),
    name: z.string(),
    metaCampaignId: z.string().nullable(),
    totalBudget: z.number(),
    totalDays: z.number(),
    totalSaves: z.number(),
});

// Create a separate component for the drag handle
function DragHandle({ id }: { id: string }) {
    const { attributes, listeners } = useSortable({
        id,
    })

    return (
        <Button
            {...attributes}
            {...listeners}
            variant="ghost"
            size="icon"
            className="text-muted-foreground size-7 hover:bg-transparent"
        >
            <IconGripVertical className="text-muted-foreground size-3" />
            <span className="sr-only">Ziehen zum Verschieben</span>
        </Button>
    )
}

const columns: ColumnDef<z.infer<typeof schema>>[] = [
    {
        id: "drag",
        header: () => null,
        cell: ({ row }) => <DragHandle id={row.original.id} />,
    },
    {
        id: "select",
        header: ({ table }) => (
            <div className="flex items-center justify-center">
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Alle auswählen"
                />
            </div>
        ),
        cell: ({ row }) => (
            <div className="flex items-center justify-center">
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Zeile auswählen"
                />
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => {
            // return <TableCellViewer item={row.original} />
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const router = useRouter();
            return (
                <Button variant="link" onClick={() => router.push(`/app/projects/project/${row.original.projectId}/campaign/${row.original.id}`)} className="text-foreground w-fit px-0 text-left">
                    {row.original.name}
                </Button>
            )
        },
        enableHiding: false,
    },
    {
        accessorKey: "totalBudget",
        header: "Budget",
        cell: ({ row }) => {
            // return <TableCellViewer item={row.original} />
            return (
                <p className="text-foreground w-fit px-0 text-left">
                    {row.original.totalBudget.toFixed(2)}€
                </p>
            )
        },
        enableHiding: false,
    },
    {
        accessorKey: "totalSaves",
        header: "Saves",
        cell: ({ row }) => {
            // return <TableCellViewer item={row.original} />
            return (
                <p className="text-foreground w-fit px-0 text-left">
                    {row.original.totalSaves}
                </p>
            )
        },
        enableHiding: false,
    },
    {
        accessorKey: "totalDays",
        header: "Tage",
        cell: ({ row }) => {
            // return <TableCellViewer item={row.original} />
            return (
                <p className="text-foreground w-fit px-0 text-left">
                    {row.original.totalDays}
                </p>
            )
        },
        enableHiding: false,
    },
    // {
    //     accessorKey: "target",
    //     header: () => <div className="w-full text-right">Target</div>,
    //     cell: ({ row }) => (
    //         <form
    //             onSubmit={(e) => {
    //                 e.preventDefault()
    //                 toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
    //                     loading: `Saving ${row.original.name}`,
    //                     success: "Done",
    //                     error: "Error",
    //                 })
    //             }}
    //         >
    //             <Label htmlFor={`${row.original.id}-target`} className="sr-only">
    //                 Target
    //             </Label>
    //             <Input
    //                 className="hover:bg-input/30 focus-visible:bg-background dark:hover:bg-input/30 dark:focus-visible:bg-input/30 h-8 w-16 border-transparent bg-transparent text-right shadow-none focus-visible:border dark:bg-transparent"
    //                 defaultValue={row.original.artist}
    //                 id={`${row.original.id}-target`}
    //             />
    //         </form>
    //     ),
    // },
    // {
    //     accessorKey: "limit",
    //     header: () => <div className="w-full text-right">Limit</div>,
    //     cell: ({ row }) => (
    //         <form
    //             onSubmit={(e) => {
    //                 e.preventDefault()
    //                 toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
    //                     loading: `Saving ${row.original.name}`,
    //                     success: "Done",
    //                     error: "Error",
    //                 })
    //             }}
    //         >
    //             <Label htmlFor={`${row.original.id}-limit`} className="sr-only">
    //                 Limit
    //             </Label>
    //             <Input
    //                 className="hover:bg-input/30 focus-visible:bg-background dark:hover:bg-input/30 dark:focus-visible:bg-input/30 h-8 w-16 border-transparent bg-transparent text-right shadow-none focus-visible:border dark:bg-transparent"
    //                 defaultValue={row.original.pixelId}
    //                 id={`${row.original.id}-limit`}
    //             />
    //         </form>
    //     ),
    // },
    // {
    //     accessorKey: "reviewer",
    //     header: "Reviewer",
    //     cell: ({ row }) => {
    //         const isAssigned = row.original.artist !== "Assign reviewer"

    //         if (isAssigned) {
    //             return row.original.artist
    //         }

    //         return (
    //             <>
    //                 <Label htmlFor={`${row.original.id}-reviewer`} className="sr-only">
    //                     Reviewer
    //                 </Label>
    //                 <Select>
    //                     <SelectTrigger
    //                         className="w-38 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate"
    //                         size="sm"
    //                         id={`${row.original.id}-reviewer`}
    //                     >
    //                         <SelectValue placeholder="Assign reviewer" />
    //                     </SelectTrigger>
    //                     <SelectContent align="end">
    //                         <SelectItem value="Eddie Lake">Eddie Lake</SelectItem>
    //                         <SelectItem value="Jamik Tashpulatov">
    //                             Jamik Tashpulatov
    //                         </SelectItem>
    //                     </SelectContent>
    //                 </Select>
    //             </>
    //         )
    //     },
    // },
    {
        id: "actions",
        cell: ({ row }) => {
            const utils = api.useUtils();
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const [name, setName] = React.useState<string>(row.original.name);

            const updateMutation = api.campaign.update.useMutation({
                onSuccess: async () => {
                    await utils.campaign.getAll.invalidate();
                    toast.success("Kampagne wurde erfolgreich gespeichert");
                    setIsEditDialogOpen(false);
                    setIsDeleteDialogOpen(false);
                },
                onError: (err) => {
                    console.error(err);
                    toast.error("Es ist ein Fehler aufgetreten", {
                        description: "Bitte versuche es später erneut."
                    });
                }
            });

            const deleteMutation = api.campaign.delete.useMutation({
                onSuccess: async () => {
                    await utils.campaign.getAll.invalidate();
                    setIsDeleteDialogOpen(false);
                    toast.success("Kampagne wurde erfolgreich gelöscht");
                },
                onError: (err) => {
                    console.error(err);
                    toast.error("Es ist ein Fehler aufgetreten", {
                        description: "Bitte versuche es später erneut."
                    });
                }
            });

            return (
                <>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                                size="icon"
                            >
                                <IconDotsVertical />
                                <span className="sr-only">Menü öffnen</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32">
                            <DropdownMenuItem onSelect={() => {
                                setIsDeleteDialogOpen(false);
                                setIsEditDialogOpen(true);
                            }}>
                                Bearbeiten
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                variant="destructive"
                                onSelect={() => {
                                    setIsEditDialogOpen(false);
                                    setIsDeleteDialogOpen(true);
                                }}
                            >
                                Löschen
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>{row.original.name} bearbeiten</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">
                                        Name
                                    </Label>
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="col-span-3"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Abbrechen</Button>
                                </DialogClose>
                                <Button type="submit" disabled={updateMutation.isPending} onClick={() => updateMutation.mutate({ id: row.original.id, name })}>Kampagne speichern</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>{row.original.name} löschen</DialogTitle>
                                <DialogDescription>
                                    Bist du dir sicher, dass du dieses Projekt löschen willst?
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">Abbrechen</Button>
                                </DialogClose>
                                <Button type="submit" variant="destructive" disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate({ id: row.original.id })}>Projekt löschen</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </>
            )
        },
    },
]

function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
    const { transform, transition, setNodeRef, isDragging } = useSortable({
        id: row.original.id,
    })

    return (
        <TableRow
            data-state={row.getIsSelected() && "selected"}
            data-dragging={isDragging}
            ref={setNodeRef}
            className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
            style={{
                transform: CSS.Transform.toString(transform),
                transition: transition,
            }}
        >
            {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
            ))}
        </TableRow>
    )
}

export function CampaignsOverview({ projectId }: { projectId: string }) {
    const { data } = api.campaign.getAll.useQuery({ projectId });

    if (!data) {
        return <LoadingDots />;
    }

    return <LinksOverviewTable data={data} projectId={projectId} />;
}

function LinksOverviewTable({ data: initialData, projectId }: { data: z.infer<typeof schema>[]; projectId: string }) {
    const [data, setData] = React.useState(() => initialData);
    const [rowSelection, setRowSelection] = React.useState({})
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({})
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    )
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [pagination, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: 10,
    })
    const sortableId = React.useId()
    const sensors = useSensors(
        useSensor(MouseSensor, {}),
        useSensor(TouchSensor, {}),
        useSensor(KeyboardSensor, {})
    );

    const dataIds = React.useMemo<UniqueIdentifier[]>(
        () => data?.map(({ id }) => id) ?? [],
        [data]
    )

    const table = useReactTable({
        data: data ?? [],
        columns,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
            pagination,
        },
        getRowId: (row) => row.id.toString(),
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
    });

    if (!data) {
        return <LoadingDots />
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event
        if (active && over && active.id !== over.id) {
            setData((data) => {
                const oldIndex = dataIds.indexOf(active.id)
                const newIndex = dataIds.indexOf(over.id)
                return arrayMove(data, oldIndex, newIndex)
            })
        }
    }

    return (
        <Tabs
            defaultValue="all"
            className="w-full flex-col justify-start gap-6"
        >
            <div className="flex items-center justify-end px-4 lg:px-6">
                <div className="flex items-center gap-2">
                    <CreateCampaign projectId={projectId} />
                </div>
            </div>
            <TabsContent
                value="all"
                className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
            >
                <div className="overflow-hidden rounded-lg border">
                    <DndContext
                        collisionDetection={closestCenter}
                        modifiers={[restrictToVerticalAxis]}
                        onDragEnd={handleDragEnd}
                        sensors={sensors}
                        id={sortableId}
                    >
                        <Table>
                            <TableHeader className="bg-muted sticky top-0 z-10">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => {
                                            return (
                                                <TableHead key={header.id} colSpan={header.colSpan}>
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext()
                                                        )}
                                                </TableHead>
                                            )
                                        })}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody className="**:data-[slot=table-cell]:first:w-8">
                                {table.getRowModel().rows?.length ? (
                                    <SortableContext
                                        items={dataIds}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {table.getRowModel().rows.map((row) => (
                                            <DraggableRow key={row.id} row={row} />
                                        ))}
                                    </SortableContext>
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={columns.length}
                                            className="h-24 text-center"
                                        >
                                            Keine Kampagnen gefunden.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </DndContext>
                </div>
                <div className="flex items-center justify-between px-4">
                    <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
                        {table.getFilteredSelectedRowModel().rows.length} von{" "}
                        {table.getFilteredRowModel().rows.length} Zeile(n) ausgewählt.
                    </div>
                    <div className="flex w-full items-center gap-8 lg:w-fit">
                        <div className="hidden items-center gap-2 lg:flex">
                            <Label htmlFor="rows-per-page" className="text-sm font-medium">
                                Zeilen pro Seite
                            </Label>
                            <Select
                                value={`${table.getState().pagination.pageSize}`}
                                onValueChange={(value) => {
                                    table.setPageSize(Number(value))
                                }}
                            >
                                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                                    <SelectValue
                                        placeholder={table.getState().pagination.pageSize}
                                    />
                                </SelectTrigger>
                                <SelectContent side="top">
                                    {[10, 20, 30, 40, 50].map((pageSize) => (
                                        <SelectItem key={pageSize} value={`${pageSize}`}>
                                            {pageSize}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex w-fit items-center justify-center text-sm font-medium">
                            Seite {table.getState().pagination.pageIndex + 1} von{" "}
                            {table.getPageCount()}
                        </div>
                        <div className="ml-auto flex items-center gap-2 lg:ml-0">
                            <Button
                                variant="outline"
                                className="hidden h-8 w-8 p-0 lg:flex"
                                onClick={() => table.setPageIndex(0)}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <span className="sr-only">Erste Seite</span>
                                <IconChevronsLeft />
                            </Button>
                            <Button
                                variant="outline"
                                className="size-8"
                                size="icon"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <span className="sr-only">Vorherige Seite</span>
                                <IconChevronLeft />
                            </Button>
                            <Button
                                variant="outline"
                                className="size-8"
                                size="icon"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                            >
                                <span className="sr-only">Nächste Seite</span>
                                <IconChevronRight />
                            </Button>
                            <Button
                                variant="outline"
                                className="hidden size-8 lg:flex"
                                size="icon"
                                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                disabled={!table.getCanNextPage()}
                            >
                                <span className="sr-only">Letzte Seite</span>
                                <IconChevronsRight />
                            </Button>
                        </div>
                    </div>
                </div>
            </TabsContent>
        </Tabs>
    )
}

// const chartData = [
//     { month: "January", desktop: 186, mobile: 80 },
//     { month: "February", desktop: 305, mobile: 200 },
//     { month: "March", desktop: 237, mobile: 120 },
//     { month: "April", desktop: 73, mobile: 190 },
//     { month: "May", desktop: 209, mobile: 130 },
//     { month: "June", desktop: 214, mobile: 140 },
// ]

// const chartConfig = {
//     desktop: {
//         label: "Desktop",
//         color: "var(--primary)",
//     },
//     mobile: {
//         label: "Mobile",
//         color: "var(--primary)",
//     },
// } satisfies ChartConfig

// function TableCellViewer({ item }: { item: z.infer<typeof schema> }) {
//     const isMobile = useIsMobile()

//     return (
//         <Drawer direction={isMobile ? "bottom" : "right"}>
//             <DrawerTrigger asChild>
//                 <Button variant="link" className="text-foreground w-fit px-0 text-left">
//                     {item.songtitle}
//                 </Button>
//             </DrawerTrigger>
//             {item.testMode && (
//                 <Badge variant="secondary" className="text-muted-foreground px-1.5 ml-1">
//                     Test
//                 </Badge>
//             )}
//             <DrawerContent>
//                 <DrawerHeader className="gap-1">
//                     <DrawerTitle>{item.songtitle}</DrawerTitle>
//                     <DrawerDescription>
//                         Showing total visitors for the last 6 months
//                     </DrawerDescription>
//                 </DrawerHeader>
//                 <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
//                     {!isMobile && (
//                         <>
//                             <ChartContainer config={chartConfig}>
//                                 <AreaChart
//                                     accessibilityLayer
//                                     data={chartData}
//                                     margin={{
//                                         left: 0,
//                                         right: 10,
//                                     }}
//                                 >
//                                     <CartesianGrid vertical={false} />
//                                     <XAxis
//                                         dataKey="month"
//                                         tickLine={false}
//                                         axisLine={false}
//                                         tickMargin={8}
//                                         tickFormatter={(value) => value.slice(0, 3)}
//                                         hide
//                                     />
//                                     <ChartTooltip
//                                         cursor={false}
//                                         content={<ChartTooltipContent indicator="dot" />}
//                                     />
//                                     <Area
//                                         dataKey="mobile"
//                                         type="natural"
//                                         fill="var(--color-mobile)"
//                                         fillOpacity={0.6}
//                                         stroke="var(--color-mobile)"
//                                         stackId="a"
//                                     />
//                                     <Area
//                                         dataKey="desktop"
//                                         type="natural"
//                                         fill="var(--color-desktop)"
//                                         fillOpacity={0.4}
//                                         stroke="var(--color-desktop)"
//                                         stackId="a"
//                                     />
//                                 </AreaChart>
//                             </ChartContainer>
//                             <Separator />
//                             <div className="grid gap-2">
//                                 <div className="flex gap-2 leading-none font-medium">
//                                     Trending up by 5.2% this month{" "}
//                                     <IconTrendingUp className="size-4" />
//                                 </div>
//                                 <div className="text-muted-foreground">
//                                     Showing total visitors for the last 6 months. This is just
//                                     some random text to test the layout. It spans multiple lines
//                                     and should wrap around.
//                                 </div>
//                             </div>
//                             <Separator />
//                         </>
//                     )}
//                     <form className="flex flex-col gap-4">
//                         <div className="flex flex-col gap-3">
//                             <Label htmlFor="header">Songtitel</Label>
//                             <Input id="header" defaultValue={item.songtitle} />
//                         </div>
//                         <div className="grid grid-cols-2 gap-4">
//                             <div className="flex flex-col gap-3">
//                                 <Label htmlFor="type">Type</Label>
//                                 <Select defaultValue={item.artist}>
//                                     <SelectTrigger id="type" className="w-full">
//                                         <SelectValue placeholder="Select a type" />
//                                     </SelectTrigger>
//                                     <SelectContent>
//                                         <SelectItem value="Table of Contents">
//                                             Table of Contents
//                                         </SelectItem>
//                                         <SelectItem value="Executive Summary">
//                                             Executive Summary
//                                         </SelectItem>
//                                         <SelectItem value="Technical Approach">
//                                             Technical Approach
//                                         </SelectItem>
//                                         <SelectItem value="Design">Design</SelectItem>
//                                         <SelectItem value="Capabilities">Capabilities</SelectItem>
//                                         <SelectItem value="Focus Documents">
//                                             Focus Documents
//                                         </SelectItem>
//                                         <SelectItem value="Narrative">Narrative</SelectItem>
//                                         <SelectItem value="Cover Page">Cover Page</SelectItem>
//                                     </SelectContent>
//                                 </Select>
//                             </div>
//                             <div className="flex flex-col gap-3">
//                                 <Label htmlFor="status">Status</Label>
//                                 <Select defaultValue={item.pixelId}>
//                                     <SelectTrigger id="status" className="w-full">
//                                         <SelectValue placeholder="Select a status" />
//                                     </SelectTrigger>
//                                     <SelectContent>
//                                         <SelectItem value="Done">Done</SelectItem>
//                                         <SelectItem value="In Progress">In Progress</SelectItem>
//                                         <SelectItem value="Not Started">Not Started</SelectItem>
//                                     </SelectContent>
//                                 </Select>
//                             </div>
//                         </div>
//                         <div className="grid grid-cols-2 gap-4">
//                             <div className="flex flex-col gap-3">
//                                 <Label htmlFor="target">Target</Label>
//                                 <Input id="target" defaultValue={item.artist} />
//                             </div>
//                             <div className="flex flex-col gap-3">
//                                 <Label htmlFor="limit">Limit</Label>
//                                 <Input id="limit" defaultValue={item.artist} />
//                             </div>
//                         </div>
//                         <div className="flex flex-col gap-3">
//                             <Label htmlFor="reviewer">Reviewer</Label>
//                             <Select defaultValue={item.artist}>
//                                 <SelectTrigger id="reviewer" className="w-full">
//                                     <SelectValue placeholder="Select a reviewer" />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     <SelectItem value="Eddie Lake">Eddie Lake</SelectItem>
//                                     <SelectItem value="Jamik Tashpulatov">
//                                         Jamik Tashpulatov
//                                     </SelectItem>
//                                     <SelectItem value="Emily Whalen">Emily Whalen</SelectItem>
//                                 </SelectContent>
//                             </Select>
//                         </div>
//                     </form>
//                 </div>
//                 <DrawerFooter>
//                     <Button>Submit</Button>
//                     <DrawerClose asChild>
//                         <Button variant="outline">Done</Button>
//                     </DrawerClose>
//                 </DrawerFooter>
//             </DrawerContent>
//         </Drawer>
//     )
// }

function CreateCampaign({ projectId }: { projectId: string }) {
    const utils = api.useUtils();
    const [name, setName] = React.useState<string>("");
    const [metaCampaignId, setMetaCampaignId] = React.useState<string>("");

    const { data: user } = api.user.getMetaToken.useQuery();
    const {
        data: campaigns,
    } = api.meta.getCampaigns.useQuery({ projectId }, {
        enabled: !!user?.metaAccessToken,
    });

    const createCampaign = api.campaign.create.useMutation({
        onSuccess: async () => {
            await utils.campaign.getAll.invalidate();
            toast.success("Die Kampagne wurde angelegt", {
                description: `Name: ${name}`
            });
            setName("");
            setMetaCampaignId("");
        },
    });

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="default" size="sm">
                    <IconPlus />
                    <span className="hidden lg:inline">Kampagne erstellen</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Kampagne erstellen</DialogTitle>
                    <DialogDescription>
                        Hier kannst du eine Kampagne erstellen
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                </div>
                {campaigns && (
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Meta-Kampagne
                            </Label>
                            <Select value={metaCampaignId} onValueChange={setMetaCampaignId}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Meta-Kampagne auswählen" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {campaigns.map((meta, index) => (
                                            <SelectItem key={index} value={meta.id}>
                                                {meta.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}
                <DialogFooter>
                    <DialogClose asChild>
                        <Button
                            type="submit"
                            disabled={createCampaign.isPending}
                            onClick={() =>
                                campaigns
                                    ? createCampaign.mutate({ name, projectId, metaCampaignId })
                                    : createCampaign.mutate({ name, projectId })
                            }
                        >
                            {createCampaign.isPending ? "Wird erstellt..." : "Erstellen"}
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}