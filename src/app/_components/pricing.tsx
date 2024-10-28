"use client";
import React from "react";
import { IconCheck, IconPlus } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button } from "@/app/_components/landing/button";
import { api } from "@/trpc/react";
import { type Product } from "@prisma/client";

export function Pricing() {
  const [products] = api.product.getAll.useSuspenseQuery();

  return (
    <div
      id="pricing"
      className="relative isolate w-full bg-background px-4 py-0 sm:py-20 lg:px-4"
    >
      <div
        className="absolute inset-x-0 -top-3 -z-10 transform-gpu overflow-hidden px-36 blur-3xl"
        aria-hidden="true"
      ></div>
      <>
        <h2 className="pt-4 text-center text-lg font-bold text-neutral-800 dark:text-neutral-100 md:text-4xl">
          Einfache Preisgestaltung für Artists
        </h2>
        <p className="mx-auto mt-4 max-w-md text-center text-base text-neutral-600 dark:text-neutral-300">
          Unsere Preise sind für Artists maßgeschnitten.
        </p>
      </>

      <div
        className={cn(
          "mx-auto mt-20 grid grid-cols-1 gap-4",
          "mx-auto max-w-7xl md:grid-cols-2 xl:grid-cols-3",
        )}
      >
        {
          products.map((product) => {
            return <Card product={product} key={product.id} />;
          })
        }
      </div>
    </div>
  );
}

const Card = ({ product }: { product: Product}) => {
  const buyProduct = () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    window.open(product.link, "_blank");
  }

  return (
    <div
      className={cn(
        "p-1 sm:p-4 md:p-4 rounded-3xl bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800"
      )}
    >
      <div className="flex flex-col gap-4 h-full justify-start">
        <div
          className={cn(
            "p-4 bg-white dark:bg-neutral-800 rounded-2xl shadow-input w-full dark:shadow-[0px_-1px_0px_0px_var(--neutral-700)]"
          )}
        >
          <div className="flex justify-between items-start ">
            <div className="flex gap-2 flex-col">
              <p
                className={cn("font-medium text-lg text-black dark:text-white")}
              >
                {product.name}
              </p>
            </div>

            {product.featured && (
              <div
                className={cn(
                  "font-medium text-xs px-3 py-1 rounded-full relative bg-neutral-900 dark:bg-white dark:text-black text-white"
                )}
              >
                <div className="absolute inset-x-0 bottom-0 w-3/4 mx-auto h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
                Ausgewählt
              </div>
            )}
          </div>
          <div className="mt-8 ">
            <div className="flex items-end">
              <span
                className={cn(
                  "text-lg font-bold text-neutral-500 dark:text-neutral-200"
                )}
              >
                {product.currency}
              </span>
              <div className="flex items-start gap-2">
                <span
                  className={cn(
                    "text-3xl md:text-7xl font-bold dark:text-neutral-50 text-neutral-800"
                  )}
                >
                  {product.price}
                </span>
              </div>
              <span
                className={cn(
                  "text-base font-normal text-neutral-500 dark:text-neutral-200 mb-1 md:mb-2"
                )}
              >
                {product.subText}
              </span>
            </div>
          </div>
          <Button variant="gradient" className="w-full mt-10" onClick={buyProduct}>
            {product.buttonText}
          </Button>
        </div>
        <div className="mt-1 p-4">
          {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          product.features.map((feature, idx) => (
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            <Step key={idx}>{feature}</Step>
          ))}
        </div>
        {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        product.additionalFeatures && product.additionalFeatures.length > 0 && product.additionalFeatures[0] !== "" && (
          <Divider />
        )}
        <div className="p-4">
          {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          product.additionalFeatures[0] !== "" &&
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          product.additionalFeatures?.map((feature, idx) => (
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            <Step additional key={idx}>
              {feature}
            </Step>
          ))}
        </div>
      </div>
    </div>
  );
};

const Step = ({
  children,
  additional,
}: {
  children: React.ReactNode;
  additional?: boolean;
  featured?: boolean;
}) => {
  return (
    <div className="flex items-start justify-start gap-2 my-4">
      <div
        className={cn(
          "h-4 w-4 rounded-full bg-neutral-700 flex items-center justify-center flex-shrink-0 mt-0.5",
          additional ? "bg-purple-500" : "bg-neutral-700"
        )}
      >
        <IconCheck className="h-3 w-3 [stroke-width:4px] text-neutral-300" />
      </div>
      <div className={cn("font-medium text-black text-sm dark:text-white")}>
        {children}
      </div>
    </div>
  );
};

const Divider = () => {
  return (
    <div className="relative">
      <div className={cn("w-full h-px dark:bg-neutral-950 bg-white")} />
      <div className={cn("w-full h-px bg-neutral-200 dark:bg-neutral-800")} />
      <div
        className={cn(
          "absolute inset-0 h-5 w-5 m-auto rounded-xl dark:bg-neutral-800 bg-white shadow-[0px_-1px_0px_0px_var(--neutral-200)] dark:shadow-[0px_-1px_0px_0px_var(--neutral-700)] flex items-center justify-center"
        )}
      >
        <IconPlus
          className={cn(
            "h-3 w-3 [stroke-width:4px] dark:text-neutral-300 text-black"
          )}
        />
      </div>
    </div>
  );
};
