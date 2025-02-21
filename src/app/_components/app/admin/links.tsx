"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { motion, useInView, useSpring, useTransform } from "framer-motion";
import { api } from "@/trpc/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Dialog } from "@/components/ui/dialog";
import { DialogContent } from "@radix-ui/react-dialog";

type AdminLink = {
  genre: {
    id: string;
    name: string;
  } | null;
  user: {
    id: string;
    name: string | null;
  };
  id: string;
  name: string;
  artist: string;
  songtitle: string;
};

export function AdminLinks() {
  const [links] = api.link.getAllLinks.useSuspenseQuery();

  return (
    <div className="flex w-full flex-col">
      {links.length !== 0 ? (
        <LinksTable links={links} />
      ) : (
        <p>Es gibt noch keine Links.</p>
      )}
    </div>
  );
}

function LinksTable({ links }: { links: AdminLink[] }) {
    const [viewingLink, setViewingLink] = useState<AdminLink | null>(null);

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Song-Titel</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Link</TableHead>
            <TableHead>Artist</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {links.map((link, idx) => (
            <TableRow key={`${idx}`} onClick={() => setViewingLink(link)} className="hover:cursor-pointer">
              <TableCell className="font-medium">{link.songtitle}</TableCell>
              <TableCell>{link.user.name}</TableCell>
              <TableCell>{link.name}</TableCell>
              <TableCell>{link.artist}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {viewingLink && (
        <ViewLinkStats
          id={viewingLink.id}
          name={viewingLink.songtitle}
          onClose={() => setViewingLink(null)}
        />
      )}
    </div>
  );
}

export function ViewLinkStats({ id, name, onClose }: { id: string; name: string; onClose: () => void; }) {
  const [stats] = api.linkstats.get.useSuspenseQuery({ linkId: id });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <section className="group/container relative mx-auto w-full max-w-7xl overflow-hidden rounded-3xl p-10">
          <h2 className="scroll-m-20 border-b pb-2 text-3xl flex items-center justify-center font-semibold tracking-tight first:mt-0">
            Statistiken - {name}
          </h2>
          <div className="relative z-20">
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-3">
              {/* Visits */}
              <motion.div
                initial={{
                  y: 20,
                  opacity: 0,
                  filter: "blur(4px)",
                }}
                animate={{
                  y: 0,
                  opacity: 1,
                  filter: "blur(0px)",
                }}
                transition={{
                  duration: 0.5,
                  delay: 1 * 0.1,
                }}
                key={"card"}
                className={cn("group/card relative overflow-hidden rounded-lg")}
              >
                <div className="flex flex-col items-center gap-2">
                  <p>Aufrufe</p>
                  <p className="text-3xl font-bold text-neutral-700 dark:text-neutral-200">
                    <AnimatedNumber value={stats.visits} />
                  </p>
                </div>
              </motion.div>

              {/* Clicks */}
              <motion.div
                initial={{
                  y: 20,
                  opacity: 0,
                  filter: "blur(4px)",
                }}
                animate={{
                  y: 0,
                  opacity: 1,
                  filter: "blur(0px)",
                }}
                transition={{
                  duration: 0.5,
                  delay: 2 * 0.1,
                }}
                key={"card"}
                className={cn("group/card relative overflow-hidden rounded-lg")}
              >
                <div className="flex flex-col items-center gap-2">
                  <p>Klicks</p>
                  <p className="text-3xl font-bold text-neutral-700 dark:text-neutral-200">
                    <AnimatedNumber value={stats.clicks} />
                  </p>
                </div>
              </motion.div>

              {/* Conversion */}
              <motion.div
                initial={{
                  y: 20,
                  opacity: 0,
                  filter: "blur(4px)",
                }}
                animate={{
                  y: 0,
                  opacity: 1,
                  filter: "blur(0px)",
                }}
                transition={{
                  duration: 0.5,
                  delay: 3 * 0.1,
                }}
                key={"card"}
                className={cn("group/card relative overflow-hidden rounded-lg")}
              >
                <div className="flex flex-col items-center gap-2">
                  <p>Conversion-Rate</p>
                  <p className="text-3xl font-bold text-neutral-700 dark:text-neutral-200">
                    <AnimatedNumber value={stats.conversionRate.toFixed(2)} />%
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </DialogContent>
    </Dialog>
  );
}

function AnimatedNumber({
  value,
  initial = 0,
}: {
  value: number | string;
  initial?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref);

  const spring = useSpring(initial, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) =>
    Math.round(current).toLocaleString(),
  );

  useEffect(() => {
    if (isInView) {
      spring.set(Number(value));
    } else {
      spring.set(initial);
    }
  }, [isInView, spring, value, initial]);

  return <motion.span ref={ref}>{display}</motion.span>;
}