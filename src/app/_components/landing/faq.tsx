"use client";
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

const FAQs = [
  {
    question: "Was ist ein SmartLink?",
    answer:
      "Ein SmartLink ist ein intelligenter Link, der deine Hörer direkt zu deiner Musik führt, egal ob auf Spotify, Apple Music, YouTube oder anderen Plattformen. Mit SmartSavvy kannst du Daten wie Klicks, Streams und Interaktionen verfolgen und gezielt Retargeting betreiben, um deine Kampagne zu optimieren.",
  },
  {
    question: "Warum brauche ich SmartSavvy für meine Werbekampagnen?",
    answer:
      "SmartSavvy hilft dir, die richtigen Daten zu sammeln, um deine Zielgruppe effektiv anzusprechen. Plattformen wie Meta und TikTok verstehen besser, welche Nutzer deine Musik hören sollen, wenn du die richtigen Conversion Events und SmartLinks einsetzt. Dadurch steigen deine Streams und deine Hörerzahlen nachhaltig.",
  },
  {
    question: "Was unterscheidet SmartSavvy von anderen SmartLink-Anbietern?",
    answer:
      "SmartSavvy wurde speziell für Artists entwickelt. Neben der einfachen Erstellung von SmartLinks bietet es dir erweiterte Tracking-Optionen, Retargeting-Daten und als einziger SmartLink die Möglichkeit, dir die Kosten deiner neu gewonnenen Hörer durch Saves und Playlist-Adds exakt auszurechnen und die richtigen Entscheidungen für Kampagnen zu treffen. SmartSavvy wurde Datenschutztechnisch auf den DACH-Raum abgestimmt, was bei den meisten SmartLink-Anbietern nicht der Fall ist. Unser Fokus liegt darauf, dir die Kontrolle über deine Kampagne zu geben und die beste Performance zu erzielen.",
  },
  {
    question: "Kann ich SmartSavvy auch ohne technische Vorkenntnisse nutzen?",
    answer:
      "Ja! SmartSavvy ist so gestaltet, dass Artists jeder Erfahrungsstufe es problemlos verwenden können. Unsere Benutzeroberfläche ist intuitiv, und wir bieten Tutorials sowie Support, um dir bei jedem Schritt zu helfen.",
  },
  {
    question: "Wie starte ich mit SmartSavvy?",
    answer:
      "Du kannst dich einfach anmelden, den für dich passenden Plan wählen und direkt deinen ersten SmartLink erstellen. Mit unserer 14-tägigen kostenlosen Testphase kannst du alle Funktionen unverbindlich ausprobieren.",
  },
  // {
  //   question: "Wie wird die Performance meiner Kampagnen gemessen?",
  //   answer:
  //     "Mit SmartSavvy erhältst du detaillierte Analysen zu Klicks, Streams und Interaktionen. Außerdem kannst du deine Kampagnen mit Spotify for Artists und anderen Plattformen verbinden, um die Ergebnisse noch genauer zu tracken.",
  // },
  {
    question: "Was passiert, wenn ich mein Abo kündige?",
    answer:
      "Du kannst dein Abo jederzeit kündigen. Nach der Kündigung bleiben deine SmartLinks für 30 Tage aktiv, damit du Zeit hast, deine Daten zu sichern oder auf ein anderes Abo umzusteigen.",
  },
  {
    question: "Wie kann ich den Support kontaktieren?",
    answer:
      "Unser Team steht dir jederzeit zur Verfügung. Du kannst uns per E-Mail kontaktieren, und mit einem Label-Plan erhältst du priorisierten Support für schnelle Antworten auf deine Fragen.",
  },
  {
    question: "Wie sicher ist meine Musik mit SmartSavvy?",
    answer:
      "Datensicherheit hat bei uns höchste Priorität. Alle Daten werden verschlüsselt übertragen, und wir speichern nur das Nötigste, um dir die bestmögliche Kampagnen-Analyse zu bieten.",
  },
  {
    question: "Ist SmartSavvy DSGVO-konform?",
    answer:
      "Ja, SmartSavvy erfüllt alle Anforderungen der Datenschutz-Grundverordnung (DSGVO). Wir speichern nur die Daten, die für deine Kampagne nötig sind, und du kannst jederzeit auf Anfrage Einwilligungen oder Datenberichte erhalten.",
  },
];
export function FAQ() {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div id="faq" className="w-full bg-white px-4 dark:bg-neutral-950 md:px-8">
      <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-20 md:px-8">
        <h2 className="text-center text-4xl font-medium tracking-tight text-black dark:text-neutral-50 md:text-5xl">
          FAQs – Häufig gestellte Fragen
        </h2>
        <p className="mx-auto max-w-lg text-center text-base text-neutral-600 dark:text-neutral-50">
          Wir versuchen dir bei jeder Frage zu helfen. Falls du noch nicht
          gefunden hast, was du suchst, dann kannst du uns auch direkt per Mail
          kontaktieren:{" "}
          <a
            href="mailto:support@smartsavvy.eu"
            className="text-blue-500 underline"
          >
            support@smartsavvy.eu
          </a>
        </p>
        <div className="mx-auto mt-10 w-full max-w-3xl">
          {FAQs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              open={open}
              setOpen={setOpen}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const FAQItem = ({
  question,
  answer,
  setOpen,
  open,
}: {
  question: string;
  answer: string;
  open: string | null;
  setOpen: (open: string | null) => void;
}) => {
  const isOpen = open === question;

  return (
    <div
      className="mb-8 w-full cursor-pointer rounded-lg bg-gray-50 p-4 shadow-input dark:bg-neutral-900"
      onClick={() => {
        if (isOpen) {
          setOpen(null);
        } else {
          setOpen(question);
        }
      }}
    >
      <div className="flex items-start">
        <div className="relative mr-4 mt-1 h-6 w-6 flex-shrink-0">
          <IconChevronUp
            className={cn(
              "absolute inset-0 h-6 w-6 transform text-black transition-all duration-200 dark:text-white",
              isOpen && "rotate-90 scale-0",
            )}
          />
          <IconChevronDown
            className={cn(
              "absolute inset-0 h-6 w-6 rotate-90 scale-0 transform text-black transition-all duration-200 dark:text-white",
              isOpen && "rotate-0 scale-100",
            )}
          />
        </div>
        <div>
          <h3 className="text-lg font-medium text-neutral-700 dark:text-neutral-200">
            {question}
          </h3>
          <AnimatePresence mode="wait">
            {isOpen && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="overflow-hidden text-neutral-500 dark:text-neutral-400"
              >
                {answer.split("").map((line, index) => (
                  <motion.span
                    initial={{ opacity: 0, filter: "blur(5px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, filter: "blur(0px)" }}
                    transition={{
                      duration: 0.2,
                      ease: "easeOut",
                      delay: index * 0.005,
                    }}
                    key={index}
                  >
                    {line}
                  </motion.span>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
