"use client";

import { LoadingDots } from "@/components/ui/loading";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { type ActivityEntityType } from "@/lib/activity";
import { api } from "@/trpc/react";
import { Link, Music, Save } from "lucide-react";

export function DashboardActivityTable() {
    const { data: activities, isLoading } = api.dashboard.getLastActivities.useQuery();

    if (isLoading) {
        return <LoadingDots />
    }

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold flex justify-center">Letzte Aktivitäten</h2>
            <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6 rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Aktion</TableHead>
                            <TableHead>Typ</TableHead>
                            <TableHead>Nachricht</TableHead>
                            <TableHead>Datum</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!activities || activities?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground">
                                    Keine Aktivitäten vorhanden
                                </TableCell>
                            </TableRow>
                        ) : (
                            activities.map((a) => (
                                <TableRow key={a.id}>
                                    {/* <TableCell className="font-medium">{a.action}</TableCell> */}
                                    <TableCell className="font-medium">{a.action}</TableCell>
                                    <TableCell className="flex items-center gap-2">
                                        {getIcon(a.entityType ? a.entityType as ActivityEntityType : "UNKNOWN")}
                                        {a.entityType}
                                    </TableCell>
                                    <TableCell>{a.message}</TableCell>
                                    <TableCell>
                                        {new Date(a.createdAt).toLocaleString("de-DE", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

function getIcon(action: ActivityEntityType) {
    switch (action) {
        case "SMARTLINK":
            return <Link className="h-4 w-4 text-purple-500" />;
        case "PLAYLISTANALYZER":
            return <Music className="h-4 w-4 text-green-500" />;
        case "SAVESCALCULATOR":
            return <Save className="h-4 w-4 text-blue-500" />;
        default:
            return null;
    }
}