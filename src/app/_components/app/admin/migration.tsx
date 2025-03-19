"use client";

// import { useToast } from "@/hooks/use-toast";
// import { api } from "@/trpc/react";

export function AdminMigration() {
    // const { toast } = useToast();

    // const migrateLinkStats = api.migration.migrateLinkStats.useMutation({
    //     onSuccess: (res) => {
    //         toast({
    //           variant: "default",
    //           title: res.message,
    //         });
    //     },
    //     onError: (err) => {
    //         toast({
    //           variant: "destructive",
    //           title: err.message,
    //         });
    //         console.error(err.data);
    //     }
    // });

    return (
      <div className="flex w-full items-center justify-center">
        {/* <Button onClick={() => migrateLinkStats.mutate()}>LinkStats migrieren</Button> */}
        <p>Aktuell keine Migration verfügbar</p>
      </div>
    );
}