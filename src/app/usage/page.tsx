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
            Allgemeine Geschäftsbedingungen
          </h1>
          <p className="leading-7 [&:not(:first-child)]:mt-2">
            Geltung gegenüber Unternehmern und Begriffsdefinitionen Die
            nachfolgenden Allgemeinen Geschäftbedingungen gelten für alle
            Lieferungen zwischen uns und einem Verbraucher in ihrer zum
            Zeitpunkt der Bestellung gültigen Fassung.
          </p>
          <p className="leading-7 [&:not(:first-child)]:mt-2">
            Verbraucher ist jede natürliche Person, die ein Rechtsgeschäft zu
            Zwecken abschließt, die überwiegend weder ihrer gewerblichen noch
            ihrer selbständigen beruflichen Tätigkeit zugerechnet werden können
            (§ 13 BGB).
          </p>
          {/* <p className="leading-7 [&:not(:first-child)]:mt-2">
            Zustandekommen eines Vertrages, Speicherung des Vertragstextes
            (1) Die folgenden Regelungen über den Vertragsabschluss gelten für
            Bestellungen über unseren Internetshop https://smartsavvy.eu/.
          </p> */}

          <h3 className="mt-10 scroll-m-20 text-2xl font-semibold tracking-tight">
            Im Falle des Vertragsschlusses kommt der Vertrag mit
          </h3>
          <p className="leading-7 [&:not(:first-child)]:mt-2">Joshua Stieber</p>
          <p className="leading-7">Auf der Geest 4</p>
          <p className="leading-7">30826 Garbsen</p>
          <p className="leading-7 [&:not(:first-child)]:mt-2">
            USt-IdNr: <span className="font-medium">DE362233985</span>
          </p>
          <p className="leading-7 [&:not(:first-child)]:mt-2">
            Telefon: +49 151 62368185
          </p>
          <p className="leading-7">
            E-Mail:{" "}
            <a href="mailto:support@smartsavvy.eu" className="hover:underline">
              support@smartsavvy.eu
            </a>
          </p>
          <p className="font-semibold leading-7 [&:not(:first-child)]:mt-2">
            zustande.
          </p>

          <p className="leading-7 [&:not(:first-child)]:mt-10">
            Die Präsentation der Waren in unserem Internetshop stellen kein
            rechtlich bindendes Vertragsangebot unsererseits dar, sondern sind
            nur eine unverbindliche Aufforderungen an den Verbraucher, Waren zu
            bestellen. Mit der Bestellung der gewünschten Ware gibt der
            Verbraucher ein für ihn verbindliches Angebot auf Abschluss eines
            Kaufvertrages ab.
          </p>
          <p className="leading-7 [&:not(:first-child)]:mt-2">
            Bei Eingang einer Bestellung in unserem Internetshop gelten folgende
            Regelungen: Der Verbraucher gibt ein bindendes Vertragsangebot ab,
            indem er die in unserem Internetshop vorgesehene Bestellprozedur
            erfolgreich durchläuft.
          </p>

          <p className="leading-7 [&:not(:first-child)]:mt-2">
            Die Bestellung erfolgt in folgenden Schritten:
          </p>
          <ul className="ml-6 mt-2 list-decimal [&>li]:mt-2">
            <li>Auswahl des gewünschten Abos</li>
            <li>Bestätigen durch Anklicken der Buttons „Bestellen“</li>
            <li>Prüfung der Angaben im Warenkorb</li>
            <li>Betätigung des Buttons „zur Kasse“</li>
            <li>
              Anmeldung im Internetshop nach Registrierung und Eingabe der
              Anmelderangaben (E-Mail-Adresse und Login-Code).
            </li>
            <li>
              Nochmalige Prüfung bzw. Berichtigung der jeweiligen eingegebenen
              Daten.
            </li>
            <li>
              Verbindliche Absendung der Bestellung durch Anklicken des Buttons
              „kostenpflichtig bestellen“ bzw. „kaufen“
            </li>
          </ul>

          <p className="leading-7 [&:not(:first-child)]:mt-2">
            Der Verbraucher kann vor dem verbindlichen Absenden der Bestellung
            durch Betätigen der in dem von ihm verwendeten Internet-Browser
            enthaltenen „Zurück“-Taste nach Kontrolle seiner Angaben wieder zu
            der Internetseite gelangen, auf der die Angaben des Kunden erfasst
            werden und Eingabefehler berichtigen bzw. durch Schließen des
            Internetbrowsers den Bestellvorgang abbrechen. Wir bestätigen den
            Eingang der Bestellung unmittelbar durch eine automatisch generierte
            E-Mail („Auftragsbestätigung“). Mit dieser nehmen wir Ihr Angebot
            an.
          </p>

          <h3 className="mt-10 scroll-m-20 text-2xl font-semibold tracking-tight">
            §1 Preise, Versandkosten, Zahlung, Fälligkeit
          </h3>
          <p className="leading-7 [&:not(:first-child)]:mt-2">
            (1) Die angegebenen Preise enthalten die gesetzliche Umsatzsteuer
            und sonstige Preisbestandteile.
          </p>
          <p className="leading-7 [&:not(:first-child)]:mt-2">
            (2) Der Verbraucher hat die Möglichkeit der Zahlung per PayPal,
            Kreditkarte( Visa, Mastercard ) oder Klarna.
          </p>

          <h3 className="mt-10 scroll-m-20 text-2xl font-semibold tracking-tight">
            §2 Lieferung
          </h3>
          <p className="leading-7 [&:not(:first-child)]:mt-2">
            (1) Sofern wir dies in der Produktbeschreibung nicht deutlich anders
            angegeben haben, sind alle von uns angebotenen Artikel sofort
            versandfertig. Die Lieferung erfolgt hier spätesten innerhalb von 1
            Werktagen. Dabei beginnt die Frist für die Lieferung im Falle der
            Zahlung per Vorkasse am Tag nach Zahlungsauftrag an die mit der
            Überweisung beauftragte Bank und bei allen anderen Zahlungsarten am
            Tag nach Vertragsschluss zu laufen. Fällt das Fristende auf einen
            Samstag, Sonntag oder gesetzlichen Feiertag am Lieferort, so endet
            die Frist am nächsten Werktag.
          </p>
          <p className="leading-7 [&:not(:first-child)]:mt-2">
            (2) Die Gefahr des zufälligen Untergangs und der zufälligen
            Verschlechterung der verkauften Sache geht auch beim Versendungskauf
            erst mit der Übergabe der Sache an den Käufer auf diesen über.
          </p>

          <h3 className="mt-10 scroll-m-20 text-2xl font-semibold tracking-tight">
            §3 Eigentumsvorbehalt
          </h3>
          <p className="leading-7 [&:not(:first-child)]:mt-2">
            Wir behalten uns das Eigentum an der Ware bis zur vollständigen
            Bezahlung des Kaufpreises vor.
          </p>

          <h3 className="mt-10 scroll-m-20 text-2xl font-semibold tracking-tight">
            §4 Widerrufsrecht des Kunden als Verbraucher
          </h3>
          <p className="leading-7 [&:not(:first-child)]:mt-2">
            Verbrauchern steht ein Widerrufsrecht nach folgender Maßgabe zu,
            wobei Verbraucher jede natürliche Person ist, die ein Rechtsgeschäft
            zu Zwecken abschließt, die überwiegend weder ihrer gewerblichen noch
            ihrer selbständigen beruflichen Tätigkeit zugerechnet werden können:
          </p>
          <p className="font-semibold leading-7 [&:not(:first-child)]:mt-2">
            Widerrufsbelehrung:
          </p>
          <p className="leading-7 [&:not(:first-child)]:mt-2">
            Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen
            diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn
            Tage, ab dem Tag des Vertragsabschlusses.
          </p>
          <p className="leading-7 [&:not(:first-child)]:mt-2">
            Um Ihr Widerrufsrecht auszuüben, müssen Sie uns mittels einer
            eindeutigen Erklärung (z.B. ein mit der Post versandter Brief,
            Telefax oder E-Mail) über Ihren Entschluss, diesen Vertrag zu
            widerrufen, informieren.
          </p>
          <p className="leading-7 [&:not(:first-child)]:mt-2">
            Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die
            Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der
            Widerrufsfrist absenden.
          </p>
          <p className="font-semibold leading-7 [&:not(:first-child)]:mt-2">
            Widerrufsfolgen:
          </p>
          <p className="leading-7 [&:not(:first-child)]:mt-2">
            Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen,
            die wir von Ihnen erhalten haben, einschließlich der Lieferkosten
            (mit Ausnahme der zusätzlichen Kosten, die sich daraus ergeben, dass
            Sie eine andere Art der Lieferung als die von uns angebotene,
            günstigste Standardlieferung gewählt haben), unverzüglich und
            spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem
            die Mitteilung über Ihren Widerruf dieses Vertrags bei uns
            eingegangen ist. Für diese Rückzahlung verwenden wir dasselbe
            Zahlungsmittel, das Sie bei der ursprünglichen Transaktion
            eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich etwas
            anderes vereinbart; in keinem Fall werden Ihnen wegen dieser
            Rückzahlung Entgelte berechnet.
          </p>
          <p className="leading-7 [&:not(:first-child)]:mt-2">
            Haben Sie verlangt, dass die Dienstleistungen während der
            Widerrufsfrist beginnen soll, so haben Sie uns einen angemessenen
            Betrag zu zahlen, der dem Anteil der bis zu dem Zeitpunkt, zu dem
            Sie uns von der Ausübung des Widerrufsrechts hinsichtlich dieses
            Vertrags unterrichten, bereits erbrachten Dienstleistungen im
            Vergleich zum Gesamtumfang der im Vertrag vorgesehenen
            Dienstleistungen entspricht.
          </p>
          <p className="font-semibold leading-7 [&:not(:first-child)]:mt-2">
            Ende der Widerrufsbelehrung
          </p>

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
