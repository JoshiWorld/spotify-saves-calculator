"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner"
import { api } from "@/trpc/react";
import { LogType } from "@prisma/client";
import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import { z } from "zod";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { GlowStylePreview, NormalStylePreview } from "./link-preview";
import { motion, AnimatePresence } from "framer-motion";

const createLinkSchema = z.object({
  name: z.string().min(2, {
    message: "Der Link muss mindestens 2 Buchstaben enthalten",
  }),
  testEventCode: z.string(),
  pixelId: z.string().min(5, {
    message: "Du musst eine Pixel-ID angeben",
  }),
  accessToken: z.string().min(5, {
    message: "Du musst einen ConversionAPI-Token angeben",
  }),
  artist: z.string().min(2, {
    message: "Bitte gib den Namen des Artists ein",
  }),
  songtitle: z.string().min(2, {
    message: "Bitte gib einen Songtitel an",
  }),
  description: z.string(),
  genre: z.string().min(2, {
    message: "Bitte gib Genre an",
  }),
  spotifyUri: z.string().min(2, {
    message: "Bitte gib eine Spotify-URL an",
  }),
  appleUri: z.string(),
  deezerUri: z.string(),
  itunesUri: z.string(),
  napsterUri: z.string(),
  playbutton: z.boolean(),
  glow: z.boolean(),
  splittest: z.boolean(),
  spotifyGlowColor: z.string(),
  appleMusicGlowColor: z.string(),
  itunesGlowColor: z.string(),
  deezerGlowColor: z.string(),
});

export function CreateLinkOverview() {
  const utils = api.useUtils();
  const router = useRouter();

  const [spotifyCoverURL, setSpotifyCoverURL] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const form = useForm<z.infer<typeof createLinkSchema>>({
    resolver: zodResolver(createLinkSchema),
    defaultValues: {
      name: "",
      testEventCode: "",
      pixelId: "",
      accessToken: "",
      artist: "",
      songtitle: "",
      description: "",
      genre: "",
      spotifyUri: "",
      appleUri: "",
      deezerUri: "",
      itunesUri: "",
      napsterUri: "",
      playbutton: false,
      glow: false,
      splittest: false,
      spotifyGlowColor: "#22c55e",
      appleMusicGlowColor: "#fb2c36",
      itunesGlowColor: "#fb2c36",
      deezerGlowColor: "#efb100",
    },
  });

  const createLog = api.log.create.useMutation();
  const createLink = api.link.create.useMutation({
    onSuccess: async () => {
      await utils.link.invalidate();
      toast.success("Der Link wurde erstellt");
      setImageFile(null);
      router.push("/app/links");
    },
    onError: (error) => {
      console.error("Fehler beim Erstellen des Links:", error);
      createLog.mutate({
        message: error.message,
        logtype: LogType.ERROR.toString(),
      });
      toast.error("Fehler beim erstellen des Links", {
        description: error.message
      });
    },
  });

  async function onSubmit(values: z.infer<typeof createLinkSchema>) {
    const isValid = await form.trigger();

    if (!isValid) {
      toast.warning("Bitte überprüfe deine Eingaben", {
        description: "Einige Felder sind noch nicht korrekt ausgefüllt."
      });
      return;
    }

    toast.info("Link wird erstellt..");
    setCurrentStep(4);

    if (!values.spotifyUri.includes("spotify.com")) {
      alert("Bitte gebe eine gültige Spotify-URI an.");
      setCurrentStep(3);
      return;
    }

    const image = await getCoverURL(imageFile, values.spotifyUri);
    if (!image) {
      alert("Es gab einen Fehler mit deinem Cover. Wende dich an unseren Support.");
      setCurrentStep(3);
      return;
    }

    values.name = formatName(values.name);

    createLink.mutate({
      name: values.name,
      pixelId: values.pixelId,
      artist: values.artist,
      songtitle: values.songtitle,
      description: values.description,
      spotifyUri: values.spotifyUri,
      playbutton: values.playbutton,
      genre: values.genre,
      appleUri: values.appleUri,
      deezerUri: values.deezerUri,
      itunesUri: values.itunesUri,
      napsterUri: values.napsterUri,
      image,
      accessToken: values.accessToken,
      testEventCode: values.testEventCode,
      glow: values.glow,
      spotifyGlowColor: values.spotifyGlowColor,
      appleMusicGlowColor: values.appleMusicGlowColor,
      itunesGlowColor: values.itunesGlowColor,
      deezerGlowColor: values.deezerGlowColor,
      splittest: values.splittest,
    });
  }

  useEffect(() => {
    if (form.getValues().spotifyUri) {
      fetch(
        `/api/getSpotifyCover?uri=${form.getValues().spotifyUri}`,
      ).then((res) => res.json()).then((data: { 
        coverUrl: string | null;
        artist: string | null;
        title: string | null;
      }) => {
        setSpotifyCoverURL(data.coverUrl);
        form.setValue("songtitle", data.title ?? "");
        form.setValue("artist", data.artist ?? "");
        form.setValue("name", data.title ? slugify(data.title) : "");
      }).catch((err) => {
        console.error(err);
        setSpotifyCoverURL(null);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.getValues().spotifyUri]);

  return (
    <div className="flex flex-col w-full items-start gap-5">
      <StepsHeader currentStep={currentStep} />

      <div className="flex w-full items-start gap-5">
        {currentStep < 4 && 
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex w-1/3 flex-col items-center justify-center gap-5"
            >
              <StepWrapper currentStep={currentStep}>
                {currentStep === 1 && <Step1 form={form} setCurrentStep={setCurrentStep} />}
                {currentStep === 2 && <Step2 form={form} setCurrentStep={setCurrentStep} />}
                {currentStep === 3 && <Step3 form={form} setCurrentStep={setCurrentStep} pending={createLink.isPending} />}
              </StepWrapper>
            </form>
          </Form>
        }

        <div className={`sticky top-20 flex ${currentStep === 4 ? "w-full" : "w-2/3"} flex-col items-center gap-2`}>
          <h2 className="scroll-m-20 border-b text-3xl font-semibold tracking-tight first:mt-0">
            Vorschau
          </h2>
          <div className="m-5 w-2/3 rounded-xl border border-white/20 bg-zinc-900/70 p-6 shadow-xl backdrop-blur-md transition-all duration-500 hover:scale-[1.02] hover:shadow-green-500/20">
            {form.getValues().glow ? (
              <GlowStylePreview link={form.getValues()} image={spotifyCoverURL ?? "/images/Spotify-Logo-Neon-Like-Sign-on.jpg"} />
            ) : (
              <NormalStylePreview link={form.getValues()} image={spotifyCoverURL ?? "/images/Spotify-Logo-Neon-Like-Sign-on.jpg"} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepsHeader({ currentStep }: { currentStep: number }) {
  const steps = ["Links eintragen", "Pixel einrichten", "Metadaten überprüfen", "Fertigstellen"];

  return (
    <div className="relative flex w-full items-center justify-between">
      {/* Progress Line */}
      <motion.div
        className="absolute top-5 left-0 h-1 bg-primary"
        initial={{ width: 0 }}
        animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        transition={{ duration: 0.4 }}
      />
      {steps.map((step, index) => (
        <div key={index} className="flex flex-col items-center w-full">
          <motion.div
            className={`h-10 w-10 flex items-center justify-center rounded-full border-2 z-20
              ${index + 1 <= currentStep ? "border-primary bg-primary text-white" : "border-zinc-500 bg-zinc-900"}`}
            initial={{ scale: 0.8 }}
            animate={{ scale: index + 1 === currentStep ? 1.1 : 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {index + 1}
          </motion.div>
          <p className="mt-2 text-sm">{step}</p>
        </div>
      ))}
    </div>
  );
}

function StepWrapper({ currentStep, children }: { currentStep: number; children: React.ReactNode }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

function Step1({ form, setCurrentStep }: { form: UseFormReturn<z.infer<typeof createLinkSchema>>; setCurrentStep: Dispatch<SetStateAction<number>> }) {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-5">
      <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        1. Links eintragen
      </h2>

      <FormField
        control={form.control}
        name="spotifyUri"
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel>Spotify*</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormDescription>Der Link zum Song auf Spotify</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="appleUri"
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel>AppleMusic</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormDescription>
              Der Link zum Song auf AppleMusic (Optional)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="deezerUri"
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel>Deezer</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormDescription>
              Der Link zum Song auf Deezer (Optional)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="itunesUri"
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel>iTunes</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormDescription>
              Der Link zum Song auf iTunes (Optional)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="napsterUri"
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel>Napster</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormDescription>
              Der Link zum Song auf Napster (Optional)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <Button
        type="button"
        onClick={() => setCurrentStep(2)}
        className="relative overflow-hidden rounded-lg bg-purple-600 px-6 py-2 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-purple-500/50"
      >
        <span className="relative z-10">Weiter</span>
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-400 to-purple-600 opacity-0"
          whileHover={{ opacity: 0.2 }}
          transition={{ duration: 0.3 }}
        />
      </Button>
    </div>
  )
}

function Step2({ form, setCurrentStep }: { form: UseFormReturn<z.infer<typeof createLinkSchema>>; setCurrentStep: Dispatch<SetStateAction<number>> }) {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-5">
      <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        2. Pixel einrichten
      </h2>

      <FormField
        control={form.control}
        name="pixelId"
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel>Pixel-ID*</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="accessToken"
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel>ConversionsAPI-Token*</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="testEventCode"
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel>Test-Event-Code</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormDescription>
              Dieser Code wird nur am Anfang zum Senden der Serverevents
              benötigt. Sobald du die Events im Eventsmanager empfangen und
              freigegeben hast, kannst du nach dem Erstellen des Smartlinks den Test-Modus deaktivieren.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex justify-between w-full">
        <Button
          type="button"
          onClick={() => setCurrentStep(1)}
          className="relative overflow-hidden rounded-lg bg-purple-600 px-6 py-2 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-purple-500/50"
        >
          <span className="relative z-10">Zurück</span>
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-400 to-purple-600 opacity-0"
            whileHover={{ opacity: 0.2 }}
            transition={{ duration: 0.3 }}
          />
        </Button>
        <Button
          type="button"
          onClick={() => setCurrentStep(3)}
          className="relative overflow-hidden rounded-lg bg-purple-600 px-6 py-2 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-purple-500/50"
        >
          <span className="relative z-10">Weiter</span>
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-400 to-purple-600 opacity-0"
            whileHover={{ opacity: 0.2 }}
            transition={{ duration: 0.3 }}
          />
        </Button>
      </div>
    </div>
  )
}

function Step3({ form, setCurrentStep, pending }: { form: UseFormReturn<z.infer<typeof createLinkSchema>>; setCurrentStep: Dispatch<SetStateAction<number>>; pending: boolean }) {
  const [showColorPicker, setShowColorPicker] = useState(false);

  const { data: genres } = api.genre.getAll.useQuery();

  return (
    <div className="flex w-full flex-col items-center justify-center gap-5">
      <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        3. Metadaten überprüfen
      </h2>

      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel>Name deiner URL*</FormLabel>
            <FormControl>
              <Input
                placeholder="bei-nacht"
                {...field}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^a-zA-Z0-9-]/g, "");
                  field.onChange(value);
                }}
              />
            </FormControl>
            <FormDescription>Das wird deine URL sein (nur Buchstaben, Zahlen und Bindestriche erlaubt).</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="artist"
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel>Artist*</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="songtitle"
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel>Song-Titel*</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="genre"
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel>Genre*</FormLabel>
            <Select onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Genre auswählen" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {genres?.map((genre, index) => (
                  <SelectItem key={index} value={genre.id}>
                    {genre.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="playbutton"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start w-full space-x-3 space-y-0 rounded-md border p-4 shadow">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Abspielbares Cover</FormLabel>
              <FormDescription>
                Zeigt einen Playbutton auf dem Cover an, wo man den Song
                abspielen kann
              </FormDescription>
            </div>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="glow"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start w-full space-x-3 space-y-0 rounded-md border p-4 shadow">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={(checked) => {
                  field.onChange(checked);
                  setShowColorPicker(Boolean(checked));
                }}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Linkstyle im Glow</FormLabel>
              <FormDescription>
                Verändert deinen Smartlink mit Gloweffekten
              </FormDescription>
            </div>
          </FormItem>
        )}
      />
      {showColorPicker && (
        <>
          <FormField
            control={form.control}
            name="spotifyGlowColor"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Spotify Glow-Farbe</FormLabel>
                <FormControl>
                  <Input type="color" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="appleMusicGlowColor"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>AppleMusic Glow-Farbe</FormLabel>
                <FormControl>
                  <Input type="color" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="itunesGlowColor"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>iTunes Glow-Farbe</FormLabel>
                <FormControl>
                  <Input type="color" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="deezerGlowColor"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Deezer Glow-Farbe</FormLabel>
                <FormControl>
                  <Input type="color" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </>
      )}
      <FormField
        control={form.control}
        name="splittest"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start w-full space-x-3 space-y-0 rounded-md border p-4 shadow">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Splittesting</FormLabel>
              <FormDescription>
                Aktiviert den Splittestmodus. Dadurch werden verschiedene
                Linktypen ausgetestet
              </FormDescription>
            </div>
          </FormItem>
        )}
      />

      <div className="flex justify-between w-full">
        <Button
          type="button"
          onClick={() => setCurrentStep(2)}
          className="relative overflow-hidden rounded-lg bg-purple-600 px-6 py-2 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-purple-500/50"
        >
          <span className="relative z-10">Zurück</span>
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-400 to-purple-600 opacity-0"
            whileHover={{ opacity: 0.2 }}
            transition={{ duration: 0.3 }}
          />
        </Button>
        <Button
          type="submit"
          disabled={pending}
          className="relative overflow-hidden rounded-lg bg-purple-600 px-6 py-2 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-purple-500/50"
        >
          <span className="relative z-10">{pending ? "Wird erstellt..." : "Erstellen"}</span>
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-400 to-purple-600 opacity-0"
            whileHover={{ opacity: 0.2 }}
            transition={{ duration: 0.3 }}
          />
        </Button>
      </div>
    </div>
  )
}

// function CreateLink({ form }: { form: UseFormReturn<z.infer<typeof createLinkSchema>> }) {
//   const { toast } = useToast();

//   const [imageFile, setImageFile] = useState<File | null>(null);
//   const [showColorPicker, setShowColorPicker] = useState(false);

//   const createLog = api.log.create.useMutation();
//   const { data: genres, isLoading } = api.genre.getAll.useQuery();

//   const createLink = api.link.create.useMutation({
//     onSuccess: async () => {
//       await utils.link.invalidate();
//       toast({
//         variant: "default",
//         title: "Der Link wurde erstellt",
//       });
//       setImageFile(null);
//       router.push("/app/links");
//     },
//     onError: (error) => {
//       console.error("Fehler beim Erstellen des Links:", error);
//       createLog.mutate({
//         message: error.message,
//         logtype: LogType.ERROR.toString(),
//       });
//       toast({
//         variant: "destructive",
//         title: "Fehler beim Erstellen des Links",
//       });
//     },
//   });

//   async function onSubmit(values: z.infer<typeof createLinkSchema>) {
//     if (!values.spotifyUri.includes("spotify.com")) {
//       alert("Bitte gebe eine gültige Spotify-URI an.");
//       return;
//     }

//     const image = await getCoverURL(imageFile, values.spotifyUri);
//     if (!image) {
//       alert("Es gab einen Fehler mit deinem Cover. Wende dich an unseren Support.");
//       return;
//     }
//     values.name = formatName(values.name);

//     createLink.mutate({
//       name: values.name,
//       pixelId: values.pixelId,
//       artist: values.artist,
//       songtitle: values.songtitle,
//       description: values.description,
//       spotifyUri: values.spotifyUri,
//       playbutton: values.playbutton,
//       genre: values.genre,
//       appleUri: values.appleUri,
//       deezerUri: values.deezerUri,
//       itunesUri: values.itunesUri,
//       napsterUri: values.napsterUri,
//       image,
//       accessToken: values.accessToken,
//       testEventCode: values.testEventCode,
//       glow: values.glow,
//       spotifyGlowColor: values.spotifyGlowColor,
//       appleMusicGlowColor: values.appleMusicGlowColor,
//       itunesGlowColor: values.itunesGlowColor,
//       deezerGlowColor: values.deezerGlowColor,
//       splittest: values.splittest,
//     });
//   }

//   if (isLoading) return <p>Daten werden geladen..</p>;
//   if (!genres) return <p>Fehler beim Laden der Daten.</p>;

//   return (
//     <Form {...form}>
//       <form
//         onSubmit={form.handleSubmit(onSubmit)}
//         className="w-full max-w-md space-y-8"
//       >
//         <Step1 form={form} />
//       </form>
//     </Form>
//   )

//   return (
//     <Form {...form}>
//       <form
//         onSubmit={form.handleSubmit(onSubmit)}
//         className="w-full max-w-md space-y-8"
//       >
//         <FormField
//           control={form.control}
//           name="name"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Name deiner URL*</FormLabel>
//               <FormControl>
//                 <Input
//                   placeholder="bei-nacht"
//                   {...field}
//                   onChange={(e) => {
//                     const value = e.target.value.replace(/[^a-zA-Z0-9-]/g, "");
//                     field.onChange(value);
//                   }}
//                 />
//               </FormControl>
//               <FormDescription>Das wird deine URL sein (nur Buchstaben, Zahlen und Bindestriche erlaubt).</FormDescription>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         <FormField
//           control={form.control}
//           name="artist"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Artist*</FormLabel>
//               <FormControl>
//                 <Input {...field} />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         <FormField
//           control={form.control}
//           name="songtitle"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Song-Titel*</FormLabel>
//               <FormControl>
//                 <Input {...field} />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         <FormField
//           control={form.control}
//           name="genre"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Genre*</FormLabel>
//               <Select onValueChange={field.onChange}>
//                 <FormControl>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Genre auswählen" />
//                   </SelectTrigger>
//                 </FormControl>
//                 <SelectContent>
//                   {genres.map((genre, index) => (
//                     <SelectItem key={index} value={genre.id}>
//                       {genre.name}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         <FormField
//           control={form.control}
//           name="pixelId"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Pixel-ID*</FormLabel>
//               <FormControl>
//                 <Input {...field} />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         <FormField
//           control={form.control}
//           name="accessToken"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>ConversionsAPI-Token*</FormLabel>
//               <FormControl>
//                 <Input {...field} />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         <FormField
//           control={form.control}
//           name="testEventCode"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Test-Event-Code</FormLabel>
//               <FormControl>
//                 <Input {...field} />
//               </FormControl>
//               <FormDescription>
//                 Dieser Code wird nur am Anfang zum Senden der Serverevents
//                 benötigt. Sobald du die Events im Eventsmanager empfangen und
//                 freigegeben hast, musst du diesen Code wieder entfernen.
//               </FormDescription>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         {/* <FormField
//           control={form.control}
//           name="description"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Beschreibung</FormLabel>
//               <FormControl>
//                 <Input {...field} />
//               </FormControl>
//               <FormDescription>
//                 Aktuell ein Platzhalter-Feld, was aber bis jetzt noch nicht
//                 angezeigt wird. Kommt in Zukunft.
//               </FormDescription>
//               <FormMessage />
//             </FormItem>
//           )}
//         /> */}
//         <FormField
//           control={form.control}
//           name="spotifyUri"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Spotify*</FormLabel>
//               <FormControl>
//                 <Input {...field} />
//               </FormControl>
//               <FormDescription>Der Link zum Song auf Spotify</FormDescription>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         <FormField
//           control={form.control}
//           name="appleUri"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>AppleMusic</FormLabel>
//               <FormControl>
//                 <Input {...field} />
//               </FormControl>
//               <FormDescription>
//                 Der Link zum Song auf AppleMusic (Optional)
//               </FormDescription>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         <FormField
//           control={form.control}
//           name="deezerUri"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Deezer</FormLabel>
//               <FormControl>
//                 <Input {...field} />
//               </FormControl>
//               <FormDescription>
//                 Der Link zum Song auf Deezer (Optional)
//               </FormDescription>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         <FormField
//           control={form.control}
//           name="itunesUri"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>iTunes</FormLabel>
//               <FormControl>
//                 <Input {...field} />
//               </FormControl>
//               <FormDescription>
//                 Der Link zum Song auf iTunes (Optional)
//               </FormDescription>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         <FormField
//           control={form.control}
//           name="napsterUri"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Napster</FormLabel>
//               <FormControl>
//                 <Input {...field} />
//               </FormControl>
//               <FormDescription>
//                 Der Link zum Song auf Napster (Optional)
//               </FormDescription>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
//           <Label htmlFor="image">Cover*</Label>
//           <div className="flex flex-col gap-2">
//             <Input
//               id="image"
//               type="file"
//               accept=".jpg, .jpeg, .png"
//               onChange={(e) => {
//                 if (e.target.files && e.target.files.length > 0) {
//                   setImageFile(e.target.files[0] ?? null);
//                 }
//               }}
//               className="col-span-3"
//             />
//             <p className="text-sm text-muted-foreground">
//               Wenn du kein Cover hochlädst, wird dein Cover automatisch von
//               Spotify gedownloadet, was allerdings zu schlechterer Qualität
//               führt.
//             </p>
//           </div>
//         </div>
//         <FormField
//           control={form.control}
//           name="playbutton"
//           render={({ field }) => (
//             <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
//               <FormControl>
//                 <Checkbox
//                   checked={field.value}
//                   onCheckedChange={field.onChange}
//                 />
//               </FormControl>
//               <div className="space-y-1 leading-none">
//                 <FormLabel>Abspielbares Cover</FormLabel>
//                 <FormDescription>
//                   Zeigt einen Playbutton auf dem Cover an, wo man den Song
//                   abspielen kann
//                 </FormDescription>
//               </div>
//             </FormItem>
//           )}
//         />
//         <FormField
//           control={form.control}
//           name="glow"
//           render={({ field }) => (
//             <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
//               <FormControl>
//                 <Checkbox
//                   checked={field.value}
//                   onCheckedChange={(checked) => {
//                     field.onChange(checked);
//                     setShowColorPicker(Boolean(checked));
//                   }}
//                 />
//               </FormControl>
//               <div className="space-y-1 leading-none">
//                 <FormLabel>Linkstyle im Glow</FormLabel>
//                 <FormDescription>
//                   Verändert deinen Smartlink mit Gloweffekten
//                 </FormDescription>
//               </div>
//             </FormItem>
//           )}
//         />
//         {showColorPicker && (
//           <>
//             <FormField
//               control={form.control}
//               name="spotifyGlowColor"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Spotify Glow-Farbe</FormLabel>
//                   <FormControl>
//                     <Input type="color" {...field} />
//                   </FormControl>
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="appleMusicGlowColor"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>AppleMusic Glow-Farbe</FormLabel>
//                   <FormControl>
//                     <Input type="color" {...field} />
//                   </FormControl>
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="itunesGlowColor"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>iTunes Glow-Farbe</FormLabel>
//                   <FormControl>
//                     <Input type="color" {...field} />
//                   </FormControl>
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="deezerGlowColor"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Deezer Glow-Farbe</FormLabel>
//                   <FormControl>
//                     <Input type="color" {...field} />
//                   </FormControl>
//                 </FormItem>
//               )}
//             />
//           </>
//         )}
//         <FormField
//           control={form.control}
//           name="splittest"
//           render={({ field }) => (
//             <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
//               <FormControl>
//                 <Checkbox
//                   checked={field.value}
//                   onCheckedChange={field.onChange}
//                 />
//               </FormControl>
//               <div className="space-y-1 leading-none">
//                 <FormLabel>Splittesting</FormLabel>
//                 <FormDescription>
//                   Aktiviert den Splittestmodus. Dadurch werden verschiedene
//                   Linktypen ausgetestet
//                 </FormDescription>
//               </div>
//             </FormItem>
//           )}
//         />
//         <Button type="submit" disabled={createLink.isPending} className="w-full">
//           {createLink.isPending ? "Wird erstellt..." : "Erstellen"}
//         </Button>
//       </form>
//     </Form>
//   );
// }

function formatName(name: string) {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[äöü]/g, (match) =>
      match === "ä" ? "ae" : match === "ö" ? "oe" : "ue",
    )
    .replace(/[ÄÖÜ]/g, (match) =>
      match === "Ä" ? "Ae" : match === "Ö" ? "Oe" : "Ue",
    );
}

async function getCoverURL(file: File | null, spotifyUri: string) {
  let fileToUpload = file;

  if (!fileToUpload) {
    try {
      // Hole das Cover-Bild von der Spotify-URI
      const spotifyResponse = await fetch(
        `/api/getSpotifyCover?uri=${spotifyUri}`,
      );
      if (!spotifyResponse.ok) {
        alert("Fehler beim Abrufen des Spotify-Covers");
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { coverUrl } = await spotifyResponse.json();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const coverResponse = await fetch(coverUrl);

      if (!coverResponse.ok) {
        alert("Fehler beim Abrufen des Cover-Bildes");
        return;
      }

      const coverBlob = await coverResponse.blob();
      fileToUpload = new File([coverBlob], "spotify-cover.jpg", {
        type: coverBlob.type,
      });
    } catch (error) {
      console.error(
        "Fehler beim Abrufen oder Konvertieren des Spotify-Covers:",
        error,
      );
      alert("Ein unerwarteter Fehler ist aufgetreten.");
      return;
    }
  }

  const fileType = fileToUpload.type;
  const filename = fileToUpload.name;

  const signedUrlResponse = await fetch("/api/protected/s3/generateUrl", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filename,
      fileType,
    }),
  });

  if (!signedUrlResponse.ok) {
    alert("Fehler beim Abrufen der signierten URL");
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { uploadUrl, key, imageUrl } = await signedUrlResponse.json();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const uploadResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": fileType,
    },
    body: fileToUpload,
  });

  if (!uploadResponse.ok) {
    alert("Fehler beim Hochladen des Bildes");
    return;
  }

  return `${imageUrl}${key}`;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    // Umlaute ersetzen
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    // Sonderzeichen entfernen (alles außer a-z, 0-9 und Leerzeichen)
    .replace(/[^a-z0-9\s-]/g, "")
    // Leerzeichen durch Bindestriche ersetzen
    .replace(/\s+/g, "-")
    // Mehrere Bindestriche zu einem machen
    .replace(/-+/g, "-")
    // Trim Bindestriche am Anfang/Ende
    .replace(/^-+|-+$/g, "");
}