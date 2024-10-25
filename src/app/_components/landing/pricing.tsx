"use client";
import React from "react";
import { IconCheck, IconPlus } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export enum plan {
  hobby = "hobby",
  starter = "starter",
  pro = "pro",
}

export type Plan = {
  id: string;
  name: string;
  price: number | string;
  subText?: string;
  currency: string;
  features: string[];
  featured?: boolean;
  buttonText?: string;
  additionalFeatures?: string[];
  onClick: () => void;
};

const plans: Array<Plan> = [
  {
    id: plan.hobby,
    name: "Starter",
    price: 9.99,
    subText: "/month",
    currency: "€",
    features: [
      "Basis-Analysen der Spotify-Saves",
      "Bis zu 10 Smartlinks gleichzeitig",
      "E-Mail Support",
      "Zugriff aufs Forum",
      "Jederzeit kündbar",
    ],
    buttonText: "Starter-Paket holen",
    onClick: () => {
      console.log("Get Hobby");
    },
  },
  {
    id: plan.starter,
    name: "Artist",
    price: 19.99,
    subText: "/month",
    currency: "€",
    featured: true,
    features: [
      "Verbessertes Analysedashboard",
      "Benutzerdefinierte Graphen und Analysen",
      "Echtzeit Daten",
      "Meta-Conversions API Gateway",
    ],
    buttonText: "Artist-Paket holen",
    additionalFeatures: ["Alles aus dem Starter-Paket"],
    onClick: () => {
      console.log("Get Starter");
    },
  },
  {
    id: plan.pro,
    name: "Label",
    price: 300,
    subText: "/month",
    currency: "€",
    features: [
      "Unlimitierte Smartlinks",
      "Benutzerdefinierte Dashboards",
      "Echtzeit Datenverarbeitung",
      "AI-Insights",
    ],
    additionalFeatures: ["Alles aus dem Starter-Paket", "Alles aus dem Artist-Paket"],
    buttonText: "Label-Paket holen",
    onClick: () => {
      console.log("Get Pro");
    },
  },
];

export function Pricing() {
  return (
    <div
      id="pricing"
      className="relative isolate w-full bg-white px-4 py-0 dark:bg-neutral-950 sm:py-20 lg:px-4"
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
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          plans.map((tier, tierIdx) => {
            return <Card plan={tier} key={tier.id} onClick={tier.onClick} />;
          })
        }
      </div>
    </div>
  );
}

const Card = ({ plan, onClick }: { plan: Plan; onClick: () => void }) => {
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
                {plan.name}
              </p>
            </div>

            {plan.featured && (
              <div
                className={cn(
                  "font-medium text-xs px-3 py-1 rounded-full relative bg-neutral-900 dark:bg-white dark:text-black text-white"
                )}
              >
                <div className="absolute inset-x-0 bottom-0 w-3/4 mx-auto h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
                Featured
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
                {plan.currency}
              </span>
              <div className="flex items-start gap-2">
                <span
                  className={cn(
                    "text-3xl md:text-7xl font-bold dark:text-neutral-50 text-neutral-800"
                  )}
                >
                  {plan?.price}
                </span>
              </div>
              <span
                className={cn(
                  "text-base font-normal text-neutral-500 dark:text-neutral-200 mb-1 md:mb-2"
                )}
              >
                {plan.subText}
              </span>
            </div>
          </div>
          <Button variant="gradient" className="w-full mt-10" onClick={onClick}>
            {plan.buttonText}
          </Button>
        </div>
        <div className="mt-1 p-4">
          {plan.features.map((feature, idx) => (
            <Step key={idx}>{feature}</Step>
          ))}
        </div>
        {plan.additionalFeatures && plan.additionalFeatures.length > 0 && (
          <Divider />
        )}
        <div className="p-4">
          {plan.additionalFeatures?.map((feature, idx) => (
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
