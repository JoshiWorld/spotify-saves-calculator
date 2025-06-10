import { GridLineVertical } from "@/components/ui/background-grids";
import { Navbar } from "@/app/_components/landing/navbar";

export default function AGB() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center overflow-hidden">
      <BackgroundGrids />
      <Navbar />

      <div className="container z-20 flex w-full flex-col items-center justify-center">
        <div className="container z-20 my-20 flex flex-col items-start justify-center rounded-sm border border-white border-opacity-40 bg-neutral-200 bg-opacity-95 p-5 shadow-xl dark:bg-zinc-950">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
            Allgemeine Geschäftsbedingungen (AGB)
          </h1>
          <h3 className="mt-10 scroll-m-20 text-2xl font-semibold tracking-tight">
            §1 Geltungsbereich & Anbieterinformation
          </h3>
          <p className="leading-7 [&:not(:first-child)]:mt-2">
            (1) Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge über die Nutzung der Softwarelösung „SmartSavvy“ (nachfolgend „Software“) zwischen
          </p>
          <p className="leading-7 [&:not(:first-child)]:mt-2 font-semibold">Joshua Stieber</p>
          <p className="leading-7">Auf der Geest 4</p>
          <p className="leading-7">30826 Garbsen</p>
          <p className="leading-7">Deutschland</p>
          <p className="leading-7">
            USt-IdNr: <span className="font-medium">DE362233985</span>
          </p>
          <p className="leading-7">
            Telefon: +49 151 62368185
          </p>
          <p className="leading-7">
            E-Mail:{" "}
            <a href="mailto:support@smartsavvy.eu" className="hover:underline">
              support@smartsavvy.eu
            </a>
          </p>
          <p className="leading-7 [&:not(:first-child)]:mt-2">
            und seinen Kunden.
          </p>

          <p className="leading-7 [&:not(:first-child)]:mt-5">
            (2) Der Verkauf der Software-Zugänge erfolgt über unseren Vertriebspartner:
          </p>
          <p className="leading-7 [&:not(:first-child)]:mt-2 font-semibold">Digistore24 GmbH</p>
          <p className="leading-7">St.-Godehard-Straße 32</p>
          <p className="leading-7">31139 Hildesheim</p>
          <p className="leading-7">Deutschland</p>
          <p className="leading-7"><a href="https://www.digistore24.com" target="_blank">www.digistore24.com</a></p>

          <p className="leading-7 [&:not(:first-child)]:mt-5">(3) Vertragspartner für die Nutzung der Software ist Joshua Stieber, die Zahlungsabwicklung erfolgt über Digistore24.</p>
          <p className="leading-7 [&:not(:first-child)]:mt-5">(4) Abweichende AGB des Kunden werden nicht anerkannt, es sei denn, wir stimmen ihrer Geltung ausdrücklich schriftlich zu.</p>

          <h3 className="mt-10 scroll-m-20 text-2xl font-semibold tracking-tight">
            §2 Vertragsgegenstand
          </h3>
          <p className="leading-7 [&:not(:first-child)]:mt-2">(1) Vertragsgegenstand ist die zeitlich beschränkte Nutzung der webbasierten Software „SmartSavvy“ im Abonnementmodell (SaaS – Software as a Service).</p>
          <p className="leading-7 [&:not(:first-child)]:mt-2">(2) Die Software wird ausschließlich online bereitgestellt. Ein physischer Versand von Datenträgern erfolgt nicht.</p>
          <p className="leading-7 [&:not(:first-child)]:mt-2">(3) Der Kunde erhält ein einfaches, nicht übertragbares Recht zur Nutzung der Software während der Laufzeit des Abonnements.</p>

          <h3 className="mt-10 scroll-m-20 text-2xl font-semibold tracking-tight">
            §3 Zustandekommen des Vertrags
          </h3>
          <p className="leading-7 [&:not(:first-child)]:mt-2">(1) Die Darstellung der Software auf unserer Website stellt kein rechtlich bindendes Angebot dar, sondern eine unverbindliche Aufforderung zur Bestellung.</p>
          <p className="leading-7 [&:not(:first-child)]:mt-2">(2) Der Vertragsabschluss erfolgt durch den Abschluss der Bestellung über die Plattform <span className="font-semibold">Digistore24</span>.</p>
          <p className="leading-7 [&:not(:first-child)]:mt-2">(3) Vor dem Absenden der Bestellung kann der Kunde die Angaben jederzeit korrigieren. Mit Klick auf „Kostenpflichtig bestellen“ gibt der Kunde ein verbindliches Angebot ab. Der Vertrag kommt mit Annahme durch Digistore24 zustande.</p>

          <h3 className="mt-10 scroll-m-20 text-2xl font-semibold tracking-tight">
            §4 Preise & Zahlungsbedingungen
          </h3>
          <p className="leading-7 [&:not(:first-child)]:mt-2">(1) Es gelten die zum Zeitpunkt der Bestellung angegebenen Preise. Diese enthalten die gesetzliche Umsatzsteuer.</p>
          <p className="leading-7 [&:not(:first-child)]:mt-2">(2) Die Zahlung erfolgt ausschließlich über die von Digistore24 angebotenen Zahlungsarten (z. B. Kreditkarte, PayPal, Sofortüberweisung, Klarna etc.).</p>
          <p className="leading-7 [&:not(:first-child)]:mt-2">(3) Die Rechnungsstellung erfolgt durch Digistore24.</p>

          <h3 className="mt-10 scroll-m-20 text-2xl font-semibold tracking-tight">
            §5 Laufzeit & Kündigung
          </h3>
          <p className="leading-7 [&:not(:first-child)]:mt-2">(1) Die Nutzung der Software erfolgt im Rahmen eines Abonnements mit der jeweils gewählten Laufzeit (z. B. monatlich oder jährlich).</p>
          <p className="leading-7 [&:not(:first-child)]:mt-2">(2) Das Abonnement verlängert sich automatisch um die gewählte Laufzeit, sofern es nicht vor Ablauf gekündigt wird. Die Kündigung ist jederzeit zum Ende des Abrechnungszeitraums möglich.</p>
          <p className="leading-7 [&:not(:first-child)]:mt-2">(3) Die Kündigung kann über das Kundenkonto oder per E-Mail erfolgen.</p>
          <p className="leading-7 [&:not(:first-child)]:mt-2">(4) Nach Kündigung wird der Zugang zur Software deaktiviert. Eine Reaktivierung ist nur durch Neubestellung möglich.</p>

          <h3 className="mt-10 scroll-m-20 text-2xl font-semibold tracking-tight">
            §6 Widerrufsrecht für Verbraucher
          </h3>
          <h4 className="mt-5 scroll-m-20 text-xl font-semibold tracking-tight">Widerrufsbelehrung</h4>
          <p className="leading-7 [&:not(:first-child)]:mt-2">Verbrauchern steht ein gesetzliches Widerrufsrecht zu. Verbraucher ist jede natürliche Person, die ein Rechtsgeschäft zu Zwecken abschließt, die überwiegend weder ihrer gewerblichen noch ihrer selbständigen beruflichen Tätigkeit zugerechnet werden können.</p>
          <h4 className="mt-5 scroll-m-20 text-xl font-semibold tracking-tight">Widerrufsrecht:</h4>
          <p className="leading-7 [&:not(:first-child)]:mt-2">Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die Frist beginnt mit dem Tag des Vertragsabschlusses.</p>
          <p className="leading-7 [&:not(:first-child)]:mt-2">Um Ihr Widerrufsrecht auszuüben, müssen Sie uns oder Digistore24 mittels einer eindeutigen Erklärung (z. B. per E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren.</p>
          <h4 className="mt-5 scroll-m-20 text-xl font-semibold tracking-tight">Folgen des Widerrufs:</h4>
          <p className="leading-7 [&:not(:first-child)]:mt-2">Im Falle eines Widerrufs erstatten wir Ihnen alle Zahlungen unverzüglich, spätestens binnen 14 Tagen nach Eingang der Widerrufserklärung. Die Rückzahlung erfolgt über dasselbe Zahlungsmittel wie bei der ursprünglichen Transaktion.</p>
          <h4 className="mt-5 scroll-m-20 text-xl font-semibold tracking-tight">Hinweis zum vorzeitigen Erlöschen des Widerrufsrechts:</h4>
          <p className="leading-7 [&:not(:first-child)]:mt-2">Das Widerrufsrecht erlischt vorzeitig, wenn wir mit der Ausführung der Dienstleistung (Freischaltung des Zugangs) begonnen haben, nachdem Sie ausdrücklich zugestimmt haben, dass wir vor Ablauf der Widerrufsfrist mit der Ausführung beginnen, und Sie Ihre Kenntnis davon bestätigt haben, dass Sie dadurch Ihr Widerrufsrecht verlieren.</p>

          <h3 className="mt-10 scroll-m-20 text-2xl font-semibold tracking-tight">
            §7 Nutzungsbedingungen & Verfügbarkeit
          </h3>
          <p className="leading-7 [&:not(:first-child)]:mt-2">(1) Der Kunde verpflichtet sich, die Software nur im Rahmen der geltenden Gesetze zu nutzen und keine rechtswidrigen Inhalte einzugeben, zu speichern oder zu verbreiten.</p>
          <p className="leading-7 [&:not(:first-child)]:mt-2">(2) Der Anbieter gewährleistet eine durchschnittliche Verfügbarkeit von 99 % im Monatsmittel. Davon ausgenommen sind Zeiten der Nichtverfügbarkeit, die auf technische Probleme außerhalb unseres Einflussbereichs oder auf notwendige Wartungsarbeiten zurückzuführen sind.</p>
          <p className="leading-7 [&:not(:first-child)]:mt-2">(3) Eine Weitergabe der Zugangsdaten an Dritte ist nicht gestattet. Der Kunde ist verpflichtet, seine Zugangsdaten sicher aufzubewahren.</p>


          <h3 className="mt-10 scroll-m-20 text-2xl font-semibold tracking-tight">
            §8 Haftung
          </h3>
          <p className="leading-7 [&:not(:first-child)]:mt-2">(1) Der Anbieter haftet unbeschränkt für Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit sowie für vorsätzliche oder grob fahrlässige Pflichtverletzungen.</p>
          <p className="leading-7 [&:not(:first-child)]:mt-2">(2) Bei leichter Fahrlässigkeit haftet der Anbieter nur für Schäden aus der Verletzung wesentlicher Vertragspflichten (Kardinalpflichten), jedoch beschränkt auf den vertragstypischen, vorhersehbaren Schaden.</p>
          <p className="leading-7 [&:not(:first-child)]:mt-2">(3) Eine weitergehende Haftung ist ausgeschlossen.</p>

          <h3 className="mt-10 scroll-m-20 text-2xl font-semibold tracking-tight">
            §9 Datenschutz
          </h3>
          <p className="leading-7 [&:not(:first-child)]:mt-2">(1) Die Verarbeitung personenbezogener Daten erfolgt im Einklang mit der DSGVO. Näheres entnehmen Sie unserer Datenschutzerklärung.</p>
          <p className="leading-7 [&:not(:first-child)]:mt-2">(2) Die Zahlungsabwicklung über Digistore24 erfolgt auf deren Plattform. Für die Verarbeitung dieser Daten ist Digistore24 datenschutzrechtlich verantwortlich. Datenschutzerklärung: <a href="https://www.digistore24.com/page/privacy" target="_blank">https://www.digistore24.com/page/privacy</a></p>

          <h3 className="mt-10 scroll-m-20 text-2xl font-semibold tracking-tight">
            §10 Schlussbestimmungen
          </h3>
          <p className="leading-7 [&:not(:first-child)]:mt-2">(1) Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts.</p>
          <p className="leading-7 [&:not(:first-child)]:mt-2">(2) Ist der Kunde Kaufmann, juristische Person des öffentlichen Rechts oder öffentlich-rechtliches Sondervermögen, ist ausschließlicher Gerichtsstand für alle Streitigkeiten der Sitz des Anbieters.</p>
          <p className="leading-7 [&:not(:first-child)]:mt-2">(3) Sollten einzelne Bestimmungen dieser AGB unwirksam sein, so bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.</p>

          <h4 className="mt-5 scroll-m-20 text-xl font-semibold tracking-tight">Stand: Juni 2025</h4>

          <div className="my-5 flex w-full items-center justify-center gap-5">
            <a
              href="/impressum"
              className="text-sm text-muted-foreground hover:underline"
            >
              Impressum
            </a>
            <a
              href="/usage"
              className="text-sm text-muted-foreground hover:underline"
            >
              AGB
            </a>
            <a
              href="/privacy"
              className="text-sm text-muted-foreground hover:underline"
            >
              Datenschutz
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

const BackgroundGrids = () => {
  return (
    <div className="pointer-events-none absolute left-0 top-0 z-0 grid h-full w-full -rotate-45 transform select-none grid-cols-2 gap-10 overflow-hidden md:grid-cols-4">
      <div className="relative h-full w-full">
        <GridLineVertical className="left-0" />
        <GridLineVertical className="left-auto right-0" />
      </div>
      <div className="relative h-full w-full">
        <GridLineVertical className="left-0" />
        <GridLineVertical className="left-auto right-0" />
      </div>
      <div className="relative h-full w-full bg-gradient-to-b from-transparent via-neutral-100 to-transparent dark:via-neutral-800">
        <GridLineVertical className="left-0" />
        <GridLineVertical className="left-auto right-0" />
      </div>
      <div className="relative h-full w-full">
        <GridLineVertical className="left-0" />
        <GridLineVertical className="left-auto right-0" />
      </div>
    </div>
  );
};
