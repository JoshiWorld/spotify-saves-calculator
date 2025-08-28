import { GridLineVertical } from "@/components/ui/background-grids";
import { Navbar } from "@/app/_components/landing/navbar";

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
      <div className="relative h-full w-full bg-linear-to-b from-transparent via-neutral-100 to-transparent dark:via-neutral-800">
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

export default function Security() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center overflow-hidden">
      <BackgroundGrids />
      <Navbar />

      <div className="container z-20 flex w-full flex-col items-center justify-center">
        <div className="container z-20 my-20 flex flex-col items-start justify-center rounded-sm border border-white border-opacity-40 bg-neutral-200 bg-opacity-95 p-5 shadow-xl dark:bg-zinc-950">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
            Datenschutz
          </h1>
          <p className="leading-7 not-first:mt-2">
            Diese Datenschutzerklärung klärt Sie über die Art, den Umfang und
            Zweck der Verarbeitung von personenbezogenen Daten (nachfolgend kurz
            „Daten“) im Rahmen der Erbringung unserer Leistungen sowie innerhalb
            unseres Onlineangebotes und der mit ihm verbundenen Webseiten,
            Funktionen und Inhalte sowie externen Onlinepräsenzen, wie z.B.
            unser Social Media Profile auf (nachfolgend gemeinsam bezeichnet als
            „Onlineangebot“). Im Hinblick auf die verwendeten Begrifflichkeiten,
            wie z.B. „Verarbeitung“ oder „Verantwortlicher“ verweisen wir auf
            die Definitionen im Art. 4 der Datenschutzgrundverordnung (DSGVO).
          </p>

          <h3 className="mt-10 scroll-m-20 text-2xl font-semibold tracking-tight">
            Verantwortlicher
          </h3>
          <p className="leading-7 not-first:mt-2">Joshua Stieber</p>
          <p className="leading-7">Auf der Geest 4</p>
          <p className="leading-7">30826 Garbsen</p>
          <p className="leading-7 not-first:mt-2">
            Telefon: +49 151 62368185
          </p>
          <p className="leading-7">
            E-Mail:{" "}
            <a href="mailto:support@smartsavvy.eu" className="hover:underline">
              support@smartsavvy.eu
            </a>
          </p>
          <p className="leading-7 not-first:mt-2">
            Verantwortlicher: Joshua Stieber
          </p>

          <h3 className="mt-10 scroll-m-20 text-2xl font-semibold tracking-tight">
            Arten der verarbeiteten Daten
          </h3>
          <ul className="ml-6 mt-2 list-disc [&>li]:mt-2">
            <li>
              Bestandsdaten (z.B., Personen-Stammdaten, Namen oder Adressen).
            </li>
            <li>Kontaktdaten (z.B., E-Mail, Telefonnummern).</li>
            <li>Inhaltsdaten (z.B., Texteingaben, Fotografien, Videos).</li>
            <li>
              Nutzungsdaten (z.B., besuchte Webseiten, Interesse an Inhalten,
              Zugriffszeiten).
            </li>
            <li>
              Meta-/Kommunikationsdaten (z.B., Geräte-Informationen,
              IP-Adressen).
            </li>
          </ul>

          <h3 className="mt-10 scroll-m-20 text-2xl font-semibold tracking-tight">
            Kategorien betroffener Personen
          </h3>
          <p className="leading-7 not-first:mt-2">
            Besucher und Nutzer des Onlineangebotes (Nachfolgend bezeichnen wir
            die betroffenen Personen zusammenfassend auch als „Nutzer“).
          </p>

          <h3 className="mt-10 scroll-m-20 text-2xl font-semibold tracking-tight">
            Zweck der Verarbeitung
          </h3>
          <ul className="ml-6 mt-2 list-disc [&>li]:mt-2">
            <li>
              Zurverfügungstellung des Onlineangebotes, seiner Funktionen und
              Inhalte.
            </li>
            <li>
              Beantwortung von Kontaktanfragen und Kommunikation mit Nutzern.
            </li>
            <li>Sicherheitsmaßnahmen.</li>
            <li>Reichweitenmessung/Marketing</li>
          </ul>

          <h3 className="mt-10 scroll-m-20 text-2xl font-semibold tracking-tight">
            Verwendete Begrifflichkeiten
          </h3>
          <p className="leading-7 not-first:mt-2">
            „Personenbezogene Daten“ sind alle Informationen, die sich auf eine
            identifizierte oder identifizierbare natürliche Person (im Folgenden
            „betroffene Person“) beziehen; als identifizierbar wird eine
            natürliche Person angesehen, die direkt oder indirekt, insbesondere
            mittels Zuordnung zu einer Kennung wie einem Namen, zu einer
            Kennnummer, zu Standortdaten, zu einer Online-Kennung (z.B. Cookie)
            oder zu einem oder mehreren besonderen Merkmalen identifiziert
            werden kann, die Ausdruck der physischen, physiologischen,
            genetischen, psychischen, wirtschaftlichen, kulturellen oder
            sozialen Identität dieser natürlichen Person sind.
          </p>
          <p className="leading-7 not-first:mt-2">
            „Verarbeitung“ ist jeder mit oder ohne Hilfe automatisierter
            Verfahren ausgeführte Vorgang oder jede solche Vorgangsreihe im
            Zusammenhang mit personenbezogenen Daten. Der Begriff reicht weit
            und umfasst praktisch jeden Umgang mit Daten.
          </p>
          <p className="leading-7 not-first:mt-2">
            „Pseudonymisierung“ die Verarbeitung personenbezogener Daten in
            einer Weise, dass die personenbezogenen Daten ohne Hinzuziehung
            zusätzlicher Informationen nicht mehr einer spezifischen betroffenen
            Person zugeordnet werden können, sofern diese zusätzlichen
            Informationen gesondert aufbewahrt werden und technischen und
            organisatorischen Maßnahmen unterliegen, die gewährleisten, dass die
            personenbezogenen Daten nicht einer identifizierten oder
            identifizierbaren natürlichen Person zugewiesen werden.
          </p>
          <p className="leading-7 not-first:mt-2">
            „Profiling“ jede Art der automatisierten Verarbeitung
            personenbezogener Daten, die darin besteht, dass diese
            personenbezogenen Daten verwendet werden, um bestimmte persönliche
            Aspekte, die sich auf eine natürliche Person beziehen, zu bewerten,
            insbesondere um Aspekte bezüglich Arbeitsleistung, wirtschaftliche
            Lage, Gesundheit, persönliche Vorlieben, Interessen,
            Zuverlässigkeit, Verhalten, Aufenthaltsort oder Ortswechsel dieser
            natürlichen Person zu analysieren oder vorherzusagen.
          </p>
          <p className="leading-7 not-first:mt-2">
            Als „Verantwortlicher“ wird die natürliche oder juristische Person,
            Behörde, Einrichtung oder andere Stelle, die allein oder gemeinsam
            mit anderen über die Zwecke und Mittel der Verarbeitung von
            personenbezogenen Daten entscheidet, bezeichnet.
          </p>
          <p className="leading-7 not-first:mt-2">
            „Auftragsverarbeiter“ eine natürliche oder juristische Person,
            Behörde, Einrichtung oder andere Stelle, die personenbezogene Daten
            im Auftrag des Verantwortlichen verarbeitet.
          </p>

          <h3 className="mt-10 scroll-m-20 text-2xl font-semibold tracking-tight">
            Maßgebliche Rechtsgrundlagen
          </h3>
          <p className="leading-7 not-first:mt-2">
            Nach Maßgabe des Art. 13 DSGVO teilen wir Ihnen die Rechtsgrundlagen
            unserer Datenverarbeitungen mit. Für Nutzer aus dem Geltungsbereich
            der Datenschutzgrundverordnung (DSGVO), d.h. der EU und des EWG
            gilt, sofern die Rechtsgrundlage in der Datenschutzerklärung nicht
            genannt wird, Folgendes: Die Rechtsgrundlage für die Einholung von
            Einwilligungen ist Art. 6 Abs. 1 lit. a und Art. 7 DSGVO; Die
            Rechtsgrundlage für die Verarbeitung zur Erfüllung unserer
            Leistungen und Durchführung vertraglicher Maßnahmen sowie
            Beantwortung von Anfragen ist Art. 6 Abs. 1 lit. b DSGVO; Die
            Rechtsgrundlage für die Verarbeitung zur Erfüllung unserer
            rechtlichen Verpflichtungen ist Art. 6 Abs. 1 lit. c DSGVO; Für den
            Fall, dass lebenswichtige Interessen der betroffenen Person oder
            einer anderen natürlichen Person eine Verarbeitung personenbezogener
            Daten erforderlich machen, dient Art. 6 Abs. 1 lit. d DSGVO als
            Rechtsgrundlage. Die Rechtsgrundlage für die erforderliche
            Verarbeitung zur Wahrnehmung einer Aufgabe, die im öffentlichen
            Interesse liegt oder in Ausübung öffentlicher Gewalt erfolgt, die
            dem Verantwortlichen übertragen wurde ist Art. 6 Abs. 1 lit. e
            DSGVO. Die Rechtsgrundlage für die Verarbeitung zur Wahrung unserer
            berechtigten Interessen ist Art. 6 Abs. 1 lit. f DSGVO. Die
            Verarbeitung von Daten zu anderen Zwecken als denen, zu denen sie
            ehoben wurden, bestimmt sich nach den Vorgaben des Art 6 Abs. 4
            DSGVO. Die Verarbeitung von besonderen Kategorien von Daten
            (entsprechend Art. 9 Abs. 1 DSGVO) bestimmt sich nach den Vorgaben
            des Art. 9 Abs. 2 DSGVO.
          </p>

          <h3 className="mt-10 scroll-m-20 text-2xl font-semibold tracking-tight">
            Sicherheitsmaßnahmen
          </h3>
          <p className="leading-7 not-first:mt-2">
            Wir treffen nach Maßgabe der gesetzlichen Vorgabenunter
            Berücksichtigung des Stands der Technik, der Implementierungskosten
            und der Art, des Umfangs, der Umstände und der Zwecke der
            Verarbeitung sowie der unterschiedlichen Eintrittswahrscheinlichkeit
            und Schwere des Risikos für die Rechte und Freiheiten natürlicher
            Personen, geeignete technische und organisatorische Maßnahmen, um
            ein dem Risiko angemessenes Schutzniveau zu gewährleisten.
          </p>
          <p className="leading-7 not-first:mt-2">
            Zu den Maßnahmen gehören insbesondere die Sicherung der
            Vertraulichkeit, Integrität und Verfügbarkeit von Daten durch
            Kontrolle des physischen Zugangs zu den Daten, als auch des sie
            betreffenden Zugriffs, der Eingabe, Weitergabe, der Sicherung der
            Verfügbarkeit und ihrer Trennung. Des Weiteren haben wir Verfahren
            eingerichtet, die eine Wahrnehmung von Betroffenenrechten, Löschung
            von Daten und Reaktion auf Gefährdung der Daten gewährleisten.
            Ferner berücksichtigen wir den Schutz personenbezogener Daten
            bereits bei der Entwicklung, bzw. Auswahl von Hardware, Software
            sowie Verfahren, entsprechend dem Prinzip des Datenschutzes durch
            Technikgestaltung und durch datenschutzfreundliche Voreinstellungen.
          </p>

          <h3 className="mt-10 scroll-m-20 text-2xl font-semibold tracking-tight">
            Zusammenarbeit mit Auftragsverarbeitern, gemeinsam Verantwortlichen
            und Dritten
          </h3>
          <p className="leading-7 not-first:mt-2">
            Sofern wir im Rahmen unserer Verarbeitung Daten gegenüber anderen
            Personen und Unternehmen (Auftragsverarbeitern, gemeinsam
            Verantwortlichen oder Dritten) offenbaren, sie an diese übermitteln
            oder ihnen sonst Zugriff auf die Daten gewähren, erfolgt dies nur
            auf Grundlage einer gesetzlichen Erlaubnis (z.B. wenn eine
            Übermittlung der Daten an Dritte, wie an Zahlungsdienstleister, zur
            Vertragserfüllung erforderlich ist), Nutzer eingewilligt haben, eine
            rechtliche Verpflichtung dies vorsieht oder auf Grundlage unserer
            berechtigten Interessen (z.B. beim Einsatz von Beauftragten,
            Webhostern, etc.).
          </p>
          <p className="leading-7 not-first:mt-2">
            Sofern wir Daten anderen Unternehmen unserer Unternehmensgruppe
            offenbaren, übermitteln oder ihnen sonst den Zugriff gewähren,
            erfolgt dies insbesondere zu administrativen Zwecken als
            berechtigtes Interesse und darüberhinausgehend auf einer den
            gesetzlichen Vorgaben entsprechenden Grundlage.
          </p>

          <h3 className="mt-10 scroll-m-20 text-2xl font-semibold tracking-tight">
            Übermittlungen in Drittländer
          </h3>
          <p className="leading-7 not-first:mt-2">
            Sofern wir Daten in einem Drittland (d.h. außerhalb der Europäischen
            Union (EU), des Europäischen Wirtschaftsraums (EWR) oder der
            Schweizer Eidgenossenschaft) verarbeiten oder dies im Rahmen der
            Inanspruchnahme von Diensten Dritter oder Offenlegung, bzw.
            Übermittlung von Daten an andere Personen oder Unternehmen
            geschieht, erfolgt dies nur, wenn es zur Erfüllung unserer
            (vor)vertraglichen Pflichten, auf Grundlage Ihrer Einwilligung,
            aufgrund einer rechtlichen Verpflichtung oder auf Grundlage unserer
            berechtigten Interessen geschieht. Vorbehaltlich gesetzlicher oder
            vertraglicher Erlaubnisse, verarbeiten oder lassen wir die Daten in
            einem Drittland nur beim Vorliegen der gesetzlichen Voraussetzungen.
            D.h. die Verarbeitung erfolgt z.B. auf Grundlage besonderer
            Garantien, wie der offiziell anerkannten Feststellung eines der EU
            entsprechenden Datenschutzniveaus oder Beachtung offiziell
            anerkannter spezieller vertraglicher Verpflichtungen.
          </p>

          <h3 className="mt-10 scroll-m-20 text-2xl font-semibold tracking-tight">
            Rechte der betroffenen Personen
          </h3>
          <p className="leading-7 not-first:mt-2">
            Sie haben das Recht, eine Bestätigung darüber zu verlangen, ob
            betreffende Daten verarbeitet werden und auf Auskunft über diese
            Daten sowie auf weitere Informationen und Kopie der Daten
            entsprechend den gesetzlichen Vorgaben.
          </p>
          <p className="leading-7 not-first:mt-2">
            Sie haben entsprechend. den gesetzlichen Vorgaben das Recht, die
            Vervollständigung der Sie betreffenden Daten oder die Berichtigung
            der Sie betreffenden unrichtigen Daten zu verlangen.
          </p>
          <p className="leading-7 not-first:mt-2">
            Sie haben nach Maßgabe der gesetzlichen Vorgaben das Recht zu
            verlangen, dass betreffende Daten unverzüglich gelöscht werden, bzw.
            alternativ nach Maßgabe der gesetzlichen Vorgaben eine Einschränkung
            der Verarbeitung der Daten zu verlangen.
          </p>
          <p className="leading-7 not-first:mt-2">
            Sie haben das Recht zu verlangen, dass die Sie betreffenden Daten,
            die Sie uns bereitgestellt haben nach Maßgabe der gesetzlichen
            Vorgaben zu erhalten und deren Übermittlung an andere
            Verantwortliche zu fordern.
          </p>
          <p className="leading-7 not-first:mt-2">
            Sie haben ferner nach Maßgabe der gesetzlichen Vorgaben das Recht,
            eine Beschwerde bei der zuständigen Aufsichtsbehörde einzureichen.
          </p>

          <h3 className="mt-10 scroll-m-20 text-2xl font-semibold tracking-tight">
            Widerrufsrecht
          </h3>
          <p className="leading-7 not-first:mt-2">
            Sie haben das Recht, erteilte Einwilligungen mit Wirkung für die
            Zukunft zu widerrufen.
          </p>

          <h3 className="mt-10 scroll-m-20 text-2xl font-semibold tracking-tight">
            Widerspruchsrecht
          </h3>
          <p className="font-medium leading-7 not-first:mt-2">
            Sie können der künftigen Verarbeitung der Sie betreffenden Daten
            nach Maßgabe der gesetzlichen Vorgaben jederzeit widersprechen. Der
            Widerspruch kann insbesondere gegen die Verarbeitung für Zwecke der
            Direktwerbung erfolgen.
          </p>

          <h3 className="mt-10 scroll-m-20 text-2xl font-semibold tracking-tight">
            Cookies und Widerspruchsrecht bei Direktwerbung
          </h3>
          <p className="leading-7 not-first:mt-2">
            Als „Cookies“ werden kleine Dateien bezeichnet, die auf Rechnern der
            Nutzer gespeichert werden. Innerhalb der Cookies können
            unterschiedliche Angaben gespeichert werden. Ein Cookie dient primär
            dazu, die Angaben zu einem Nutzer (bzw. dem Gerät auf dem das Cookie
            gespeichert ist) während oder auch nach seinem Besuch innerhalb
            eines Onlineangebotes zu speichern. Als temporäre Cookies, bzw.
            „Session-Cookies“ oder „transiente Cookies“, werden Cookies
            bezeichnet, die gelöscht werden, nachdem ein Nutzer ein
            Onlineangebot verlässt und seinen Browser schließt. In einem solchen
            Cookie kann z.B. der Inhalt eines Warenkorbs in einem Onlineshop
            oder ein Login-Status gespeichert werden. Als „permanent“ oder
            „persistent“ werden Cookies bezeichnet, die auch nach dem Schließen
            des Browsers gespeichert bleiben. So kann z.B. der Login-Status
            gespeichert werden, wenn die Nutzer diese nach mehreren Tagen
            aufsuchen. Ebenso können in einem solchen Cookie die Interessen der
            Nutzer gespeichert werden, die für Reichweitenmessung oder
            Marketingzwecke verwendet werden. Als „Third-Party-Cookie“ werden
            Cookies bezeichnet, die von anderen Anbietern als dem
            Verantwortlichen, der das Onlineangebot betreibt, angeboten werden
            (andernfalls, wenn es nur dessen Cookies sind spricht man von
            „First-Party Cookies“).
          </p>
          <p className="leading-7 not-first:mt-2">
            Wir können temporäre und permanente Cookies einsetzen und klären
            hierüber im Rahmen unserer Datenschutzerklärung auf. Cookies werden
            auf SmartSavvy 1 Jahr lang gespeichert und gemäß der DSGVO nach
            Verfall automatisch gelöscht.
          </p>
          <p className="leading-7 not-first:mt-2">
            Falls die Nutzer nicht möchten, dass Cookies auf ihrem Rechner
            gespeichert werden, werden sie gebeten die entsprechende Option in
            den Systemeinstellungen ihres Browsers zu deaktivieren. Gespeicherte
            Cookies können in den Systemeinstellungen des Browsers gelöscht
            werden. Der Ausschluss von Cookies kann zu Funktionseinschränkungen
            dieses Onlineangebotes führen.
          </p>
          <p className="leading-7 not-first:mt-2">
            Ein genereller Widerspruch gegen den Einsatz der zu Zwecken des
            Onlinemarketing eingesetzten Cookies kann bei einer Vielzahl der
            Dienste, vor allem im Fall des Trackings, über die US-amerikanische
            Seite{" "}
            <a
              href="http://www.aboutads.info/choices/"
              className="hover:underline"
              target="_blank"
            >
              http://www.aboutads.info/choices/
            </a>{" "}
            oder die EU-Seite{" "}
            <a
              href="http://www.youronlinechoices.com/"
              className="hover:underline"
              target="_blank"
            >
              http://www.youronlinechoices.com/
            </a>{" "}
            erklärt werden. Des Weiteren kann die Speicherung von Cookies
            mittels deren Abschaltung in den Einstellungen des Browsers erreicht
            werden. Bitte beachten Sie, dass dann gegebenenfalls nicht alle
            Funktionen dieses Onlineangebotes genutzt werden können.
          </p>

          <h3 className="mt-10 scroll-m-20 text-2xl font-semibold tracking-tight">
            Löschung von Daten
          </h3>
          <p className="leading-7 not-first:mt-2">
            Die von uns verarbeiteten Daten werden nach Maßgabe der gesetzlichen
            Vorgaben gelöscht oder in ihrer Verarbeitung eingeschränkt. Sofern
            nicht im Rahmen dieser Datenschutzerklärung ausdrücklich angegeben,
            werden die bei uns gespeicherten Daten gelöscht, sobald sie für ihre
            Zweckbestimmung nicht mehr erforderlich sind und der Löschung keine
            gesetzlichen Aufbewahrungspflichten entgegenstehen.
          </p>
          <p className="leading-7 not-first:mt-2">
            Sofern die Daten nicht gelöscht werden, weil sie für andere und
            gesetzlich zulässige Zwecke erforderlich sind, wird deren
            Verarbeitung eingeschränkt. D.h. die Daten werden gesperrt und nicht
            für andere Zwecke verarbeitet. Das gilt z.B. für Daten, die aus
            handels- oder steuerrechtlichen Gründen aufbewahrt werden müssen.
          </p>

          <h3 className="mt-10 scroll-m-20 text-2xl font-semibold tracking-tight">
            Änderungen und Aktualisierungen der Datenschutzerklärung
          </h3>
          <p className="leading-7 not-first:mt-2">
            Wir bitten Sie sich regelmäßig über den Inhalt unserer
            Datenschutzerklärung zu informieren. Wir passen die
            Datenschutzerklärung an, sobald die Änderungen der von uns
            durchgeführten Datenverarbeitungen dies erforderlich machen. Wir
            informieren Sie, sobald durch die Änderungen eine
            Mitwirkungshandlung Ihrerseits (z.B. Einwilligung) oder eine
            sonstige individuelle Benachrichtigung erforderlich wird.
          </p>

          <h3 className="mt-10 scroll-m-20 text-2xl font-semibold tracking-tight">
            Geschäftsbezogene Verarbeitung
          </h3>
          <p className="leading-7 not-first:mt-2">
            Zusätzlich verarbeiten wir
          </p>
          <ul className="ml-6 list-disc [&>li]:mt-2">
            <li>
              Vertragsdaten (z.B., Vertragsgegenstand, Laufzeit,
              Kundenkategorie).
            </li>
            <li>Zahlungsdaten (z.B., Bankverbindung, Zahlungshistorie)</li>
          </ul>
          <p className="leading-7 not-first:mt-2">
            von unseren Kunden, Interessenten und Geschäftspartner zwecks
            Erbringung vertraglicher Leistungen, Service und Kundenpflege,
            Marketing, Werbung und Marktforschung.
          </p>

          <h3 className="mt-10 scroll-m-20 text-2xl font-semibold tracking-tight">
            Bestellabwicklung im Onlineshop und Kundenkonto
          </h3>
          <p className="leading-7 not-first:mt-2">
            Wir verarbeiten die Daten unserer Kunden im Rahmen der
            Bestellvorgänge in unserem Onlineshop, um ihnen die Auswahl und die
            Bestellung der gewählten Produkte und Leistungen, sowie deren
            Bezahlung und Zustellung, bzw. Ausführung zu ermöglichen.
          </p>
          <p className="leading-7 not-first:mt-2">
            Zu den verarbeiteten Daten gehören Bestandsdaten,
            Kommunikationsdaten, Vertragsdaten, Zahlungsdaten und zu den von der
            Verarbeitung betroffenen Personen gehören unsere Kunden,
            Interessenten und sonstige Geschäftspartner. Die Verarbeitung
            erfolgt zum Zweck der Erbringung von Vertragsleistungen im Rahmen
            des Betriebs eines Onlineshops, Abrechnung, Auslieferung und der
            Kundenservices. Hierbei setzen wir Session Cookies für die
            Speicherung des Warenkorb-Inhalts und permanente Cookies für die
            Speicherung des Login-Status ein.
          </p>
          <p className="leading-7 not-first:mt-2">
            Die Verarbeitung erfolgt zur Erfüllung unserer Leistungen und
            Durchführung vertraglicher Maßnahmen (z.B. Durchführung von
            Bestellvorgängen) und soweit sie gesetzlich vorgeschrieben ist
            (z.B., gesetzlich erforderliche Archivierung von Geschäftsvorgängen
            zu Handels und Steuerzwecken). Dabei sind die als erforderlich
            gekennzeichneten Angaben zur Begründung und Erfüllung des Vertrages
            erforderlich. Die Daten offenbaren wir gegenüber Dritten nur im
            Rahmen der Auslieferung, Zahlung oder im Rahmen der gesetzlichen
            Erlaubnisse und Pflichten, als auch wenn dies auf Grundlage unserer
            berechtigten Interessen erfolgt, worüber wir Sie im Rahmen dieser
            Datenschutzerklärung informieren (z.B., gegenüber Rechts- und
            Steuerberatern, Finanzinstituten, Frachtunternehmen sowie Behörden).
          </p>
          <p className="leading-7 not-first:mt-2">
            Nutzer können optional ein Nutzerkonto anlegen, indem sie
            insbesondere ihre Bestellungen einsehen können. Im Rahmen der
            Registrierung, werden die erforderlichen Pflichtangaben den Nutzern
            mitgeteilt. Die Nutzerkonten sind nicht öffentlich und können von
            Suchmaschinen nicht indexiert werden. Wenn Nutzer ihr Nutzerkonto
            gekündigt haben, werden deren Daten im Hinblick auf das Nutzerkonto
            gelöscht, vorbehaltlich deren Aufbewahrung ist aus handels- oder
            steuerrechtlichen Gründen notwendig. Angaben im Kundenkonto
            verbleiben bis zu dessen Löschung mit anschließender Archivierung im
            Fall einer rechtlichen Verpflichtung oder unser berechtigten
            Interessen (z.B., im Fall von Rechtsstreitigkeiten). Es obliegt den
            Nutzern, ihre Daten bei erfolgter Kündigung vor dem Vertragsende zu
            sichern.
          </p>
          <p className="leading-7 not-first:mt-2">
            Im Rahmen der Registrierung und erneuter Anmeldungen sowie
            Inanspruchnahme unserer Onlinedienste, speichern wir die IP-Adresse
            und den Zeitpunkt der jeweiligen Nutzerhandlung. Die Speicherung
            erfolgt auf Grundlage unserer berechtigten Interessen, als auch der
            Nutzer an Schutz vor Missbrauch und sonstiger unbefugter Nutzung.
            Eine Weitergabe dieser Daten an Dritte erfolgt grundsätzlich nicht,
            außer sie ist zur Verfolgung unserer gesetzlichen Ansprüche als
            berechtigtes Interesse erforderlich oder es besteht hierzu eine
            gesetzliche Verpflichtung.
          </p>
          <p className="leading-7 not-first:mt-2">
            Die Löschung erfolgt nach Ablauf gesetzlicher Gewährleistungs- und
            sonstiger vertraglicher Rechte oder Pflichten (z.B.,
            Zahlungsansprüche oder Leistungspflichten aus Verträgen mir Kunden),
            wobei die Erforderlichkeit der Aufbewahrung der Daten alle drei
            Jahre überprüft wird; im Fall der Aufbewahrung aufgrund gesetzlicher
            Archivierungspflichten, erfolgt die Löschung insoweit nach deren
            Ablauf.
          </p>

          <h3 className="mt-10 scroll-m-20 text-2xl font-semibold tracking-tight">
            Agenturdienstleistungen
          </h3>
          <p className="leading-7 not-first:mt-2">
            Wir verarbeiten die Daten unserer Kunden im Rahmen unserer
            vertraglichen Leistungen zu denen konzeptionelle und strategische
            Beratung, Kampagnenplanung, Software- und
            Designentwicklung/-beratung oder Pflege, Umsetzung von Kampagnen und
            Prozessen/ Handling, Serveradministration, Datenanalyse/
            Beratungsleistungen und Schulungsleistungen gehören.
          </p>
          <p className="leading-7 not-first:mt-2">
            Hierbei verarbeiten wir Bestandsdaten (z.B., Kundenstammdaten, wie
            Namen oder Adressen), Kontaktdaten (z.B., E-Mail, Telefonnummern),
            Inhaltsdaten (z.B., Texteingaben, Fotografien, Videos),
            Vertragsdaten (z.B., Vertragsgegenstand, Laufzeit), Zahlungsdaten
            (z.B., Bankverbindung, Zahlungshistorie), Nutzungs- und Metadaten
            (z.B. im Rahmen der Auswertung und Erfolgsmessung von
            Marketingmaßnahmen). Besondere Kategorien personenbezogener Daten
            verarbeiten wir grundsätzlich nicht, außer wenn diese Bestandteile
            einer beauftragten Verarbeitung sind. Zu den Betroffenen gehören
            unsere Kunden, Interessenten sowie deren Kunden, Nutzer,
            Websitebesucher oder Mitarbeiter sowie Dritte. Der Zweck der
            Verarbeitung besteht in der Erbringung von Vertragsleistungen,
            Abrechnung und unserem Kundenservice. Die Rechtsgrundlagen der
            Verarbeitung ergeben sich aus Art. 6 Abs. 1 lit. b DSGVO
            (vertragliche Leistungen), Art. 6 Abs. 1 lit. f DSGVO (Analyse,
            Statistik, Optimierung, Sicherheitsmaßnahmen). Wir verarbeiten
            Daten, die zur Begründung und Erfüllung der vertraglichen Leistungen
            erforderlich sind und weisen auf die Erforderlichkeit ihrer Angabe
            hin. Eine Offenlegung an Externe erfolgt nur, wenn sie im Rahmen
            eines Auftrags erforderlich ist. Bei der Verarbeitung der uns im
            Rahmen eines Auftrags überlassenen Daten handeln wir entsprechend
            den Weisungen der Auftraggeber sowie der gesetzlichen Vorgaben einer
            Auftragsverarbeitung gem. Art. 28 DSGVO und verarbeiten die Daten zu
            keinen anderen, als den auftragsgemäßen Zwecken.
          </p>
          <p className="leading-7 not-first:mt-2">
            Wir löschen die Daten nach Ablauf gesetzlicher Gewährleistungs- und
            vergleichbarer Pflichten. die Erforderlichkeit der Aufbewahrung der
            Daten wird alle drei Jahre überprüft; im Fall der gesetzlichen
            Archivierungspflichten erfolgt die Löschung nach deren Ablauf (6 J,
            gem. § 257 Abs. 1 HGB, 10 J, gem. § 147 Abs. 1 AO). Im Fall von
            Daten, die uns gegenüber im Rahmen eines Auftrags durch den
            Auftraggeber offengelegt wurden, löschen wir die Daten entsprechend
            den Vorgaben des Auftrags, grundsätzlich nach Ende des Auftrags.
          </p>

          <h3 className="mt-10 scroll-m-20 text-2xl font-semibold tracking-tight">
            Therapeutische Leistungen und Coaching
          </h3>
          <p className="leading-7 not-first:mt-2">
            Wir verarbeiten die Daten unserer Klienten und Interessenten und
            anderer Auftraggeber oder Vertragspartner (einheitlich bezeichnet
            als „Klienten“) entsprechend Art. 6 Abs. 1 lit. b) DSGVO, um ihnen
            gegenüber unsere vertraglichen oder vorvertraglichen Leistungen zu
            erbringen. Die hierbei verarbeiteten Daten, die Art, der Umfang und
            der Zweck und die Erforderlichkeit ihrer Verarbeitung, bestimmen
            sich nach dem zugrundeliegenden Vertragsverhältnis. Zu den
            verarbeiteten Daten gehören grundsätzlich Bestands- und Stammdaten
            der Klienten (z.B., Name, Adresse, etc.), als auch die Kontaktdaten
            (z.B., E-Mailadresse, Telefon, etc.), die Vertragsdaten (z.B., in
            Anspruch genommene Leistungen, Honorare, Namen von Kontaktpersonen,
            etc.) und Zahlungsdaten (z.B., Bankverbindung, Zahlungshistorie,
            etc.).
          </p>
          <p className="leading-7 not-first:mt-2">
            Im Rahmen unserer Leistungen, können wir ferner besondere Kategorien
            von Daten gem. Art. 9 Abs. 1 DSGVO, insbesondere Angaben zur
            Gesundheit der Klienten, ggf. mit Bezug zu deren Sexualleben oder
            der sexuellen Orientierung, ethnischer Herkunft oder religiösen oder
            weltanschaulichen Überzeugungen, verarbeiten. Hierzu holen wir,
            sofern erforderlich, gem. Art. 6 Abs. 1 lit. a., Art. 7, Art. 9 Abs.
            2 lit. a. DSGVO eine ausdrückliche Einwilligung der Klienten ein und
            verarbeiten die besonderen Kategorien von Daten ansonsten zu Zwecken
            der Gesundheitsvorsorge auf Grundlage des Art. 9 Abs. 2 lit h.
            DSGVO, § 22 Abs. 1 Nr. 1 b. BDSG.
          </p>
          <p className="leading-7 not-first:mt-2">
            Sofern für die Vertragserfüllung oder gesetzlich erforderlich,
            offenbaren oder übermitteln wir die Daten der Klienten im Rahmen der
            Kommunikation mit anderen Fachkräften, an der Vertragserfüllung
            erforderlicherweise oder typischerweise beteiligten Dritten, wie
            z.B. Abrechnungsstellen oder vergleichbare Dienstleister, sofern
            dies der Erbringung unserer Leistungen gem. Art. 6 Abs. 1 lit b.
            DSGVO dient, gesetzlich gem. Art. 6 Abs. 1 lit c. DSGVO
            vorgeschrieben ist, unseren Interessen oder denen der Klienten an
            einer effizienten und kostengünstigen Gesundheitsversorgung als
            berechtigtes Interesse gem. Art. 6 Abs. 1 lit f. DSGVO dient oder
            gem. Art. 6 Abs. 1 lit d. DSGVO notwendig ist. um lebenswichtige
            Interessen der Klienten oder einer anderen natürlichen Person zu
            schützen oder im Rahmen einer Einwilligung gem. Art. 6 Abs. 1 lit.
            a., Art. 7 DSGVO.
          </p>
          <p className="leading-7 not-first:mt-2">
            Die Löschung der Daten erfolgt, wenn die Daten zur Erfüllung
            vertraglicher oder gesetzlicher Fürsorgepflichten sowie Umgang mit
            etwaigen Gewährleistungs- und vergleichbaren Pflichten nicht mehr
            erforderlich ist, wobei die Erforderlichkeit der Aufbewahrung der
            Daten alle drei Jahre überprüft wird; im Übrigen gelten die
            gesetzlichen Aufbewahrungspflichten.
          </p>

          <h3 className="mt-10 scroll-m-20 text-2xl font-semibold tracking-tight">
            Vertragliche Leistungen
          </h3>
          <p className="leading-7 not-first:mt-2">
            Wir verarbeiten die Daten unserer Vertragspartner und Interessenten
            sowie anderer Auftraggeber, Kunden, Mandanten, Klienten oder
            Vertragspartner (einheitlich bezeichnet als „Vertragspartner“)
            entsprechend Art. 6 Abs. 1 lit. b. DSGVO, um ihnen gegenüber unsere
            vertraglichen oder vorvertraglichen Leistungen zu erbringen. Die
            hierbei verarbeiteten Daten, die Art, der Umfang und der Zweck und
            die Erforderlichkeit ihrer Verarbeitung, bestimmen sich nach dem
            zugrundeliegenden Vertragsverhältnis.
          </p>
          <p className="leading-7 not-first:mt-2">
            Zu den verarbeiteten Daten gehören die Stammdaten unserer
            Vertragspartner (z.B., Namen und Adressen), Kontaktdaten (z.B.
            E-Mailadressen und Telefonnummern) sowie Vertragsdaten (z.B., in
            Anspruch genommene Leistungen, Vertragsinhalte, vertragliche
            Kommunikation, Namen von Kontaktpersonen) und Zahlungsdaten (z.B.,
            Bankverbindungen, Zahlungshistorie).
          </p>
          <p className="leading-7 not-first:mt-2">
            Besondere Kategorien personenbezogener Daten verarbeiten wir
            grundsätzlich nicht, außer wenn diese Bestandteile einer
            beauftragten oder vertragsgemäßen Verarbeitung sind.
          </p>
          <p className="leading-7 not-first:mt-2">
            Wir verarbeiten Daten, die zur Begründung und Erfüllung der
            vertraglichen Leistungen erforderlich sind und weisen auf die
            Erforderlichkeit ihrer Angabe, sofern diese für die Vertragspartner
            nicht evident ist, hin. Eine Offenlegung an externe Personen oder
            Unternehmen erfolgt nur, wenn sie im Rahmen eines Vertrags
            erforderlich ist. Bei der Verarbeitung der uns im Rahmen eines
            Auftrags überlassenen Daten, handeln wir entsprechend den Weisungen
            der Auftraggeber sowie der gesetzlichen Vorgaben.
          </p>
          <p className="leading-7 not-first:mt-2">
            Im Rahmen der Inanspruchnahme unserer Onlinedienste, können wir die
            IP-Adresse und den Zeitpunkt der jeweiligen Nutzerhandlung
            speichern. Die Speicherung erfolgt auf Grundlage unserer
            berechtigten Interessen, als auch der Interessen der Nutzer am
            Schutz vor Missbrauch und sonstiger unbefugter Nutzung. Eine
            Weitergabe dieser Daten an Dritte erfolgt grundsätzlich nicht, außer
            sie ist zur Verfolgung unserer Ansprüche gem. Art. 6 Abs. 1 lit. f.
            DSGVO erforderlich oder es besteht hierzu eine gesetzliche
            Verpflichtung gem. Art. 6 Abs. 1 lit. c. DSGVO.
          </p>
          <p className="leading-7 not-first:mt-2">
            Die Löschung der Daten erfolgt, wenn die Daten zur Erfüllung
            vertraglicher oder gesetzlicher Fürsorgepflichten sowie für den
            Umgang mit etwaigen Gewährleistungs- und vergleichbaren Pflichten
            nicht mehr erforderlich sind, wobei die Erforderlichkeit der
            Aufbewahrung der Daten alle drei Jahre überprüft wird; im Übrigen
            gelten die gesetzlichen Aufbewahrungspflichten.
          </p>

          <h3 className="mt-10 scroll-m-20 text-2xl font-semibold tracking-tight">
            Externe Zahlungsdienstleister
          </h3>
          <p className="leading-7 not-first:mt-2">
            Wir setzen externe Zahlungsdienstleister ein, über deren Plattformen
            die Nutzer und wir Zahlungstransaktionen vornehmen können (z.B.,
            jeweils mit Link zur Datenschutzerklärung, Paypal (
            <a
              href="https://www.paypal.com/de/webapps/mpp/ua/privacy-full"
              className="hover:underline"
              target="_blank"
            >
              https://www.paypal.com/de/webapps/mpp/ua/privacy-full
            </a>
            ), Klarna (
            <a
              href="https://www.klarna.com/de/datenschutz/"
              className="hover:underline"
              target="_blank"
            >
              https://www.klarna.com/de/datenschutz/
            </a>
            ), Skrill (
            <a
              href="https://www.skrill.com/de/fusszeile/datenschutzrichtlinie/"
              className="hover:underline"
              target="_blank"
            >
              https://www.skrill.com/de/fusszeile/datenschutzrichtlinie/
            </a>
            ), Giropay (
            <a
              href="https://www.giropay.de/rechtliches/datenschutz-agb/"
              className="hover:underline"
              target="_blank"
            >
              https://www.giropay.de/rechtliches/datenschutz-agb/
            </a>
            ), Visa (
            <a
              href="https://www.visa.de/datenschutz"
              className="hover:underline"
              target="_blank"
            >
              https://www.visa.de/datenschutz
            </a>
            ), Mastercard (
            <a
              href="https://www.mastercard.de/de-de/datenschutz.html"
              className="hover:underline"
              target="_blank"
            >
              https://www.mastercard.de/de-de/datenschutz.html
            </a>
            ), American Express (
            <a
              href="https://www.americanexpress.com/de/content/privacy-policy-statement.html"
              className="hover:underline"
              target="_blank"
            >
              https://www.americanexpress.com/de/content/privacy-policy-statement.html
            </a>
            )
          </p>
          <p className="leading-7 not-first:mt-2">
            Im Rahmen der Erfüllung von Verträgen setzen wir die
            Zahlungsdienstleister auf Grundlage des Art. 6 Abs. 1 lit. b. DSGVO
            ein. Im Übrigen setzen wir externe Zahlungsdienstleister auf
            Grundlage unserer berechtigten Interessen gem. Art. 6 Abs. 1 lit. f.
            DSGVO ein, um unseren Nutzern effektive und sichere
            Zahlungsmöglichkeit zu bieten.
          </p>
          <p className="leading-7 not-first:mt-2">
            Zu den, durch die Zahlungsdienstleister verarbeiteten Daten gehören
            Bestandsdaten, wie z.B. der Name und die Adresse, Bankdaten, wie
            z.B. Kontonummern oder Kreditkartennummern, Passwörter, TANs und
            Prüfsummen sowie die Vertrags-, Summen und empfängerbezogenen
            Angaben. Die Angaben sind erforderlich, um die Transaktionen
            durchzuführen. Die eingegebenen Daten werden jedoch nur durch die
            Zahlungsdienstleister verarbeitet und bei diesen gespeichert. D.h.
            wir erhalten keine konto- oder kreditkartenbezogenen Informationen,
            sondern lediglich Informationen mit Bestätigung oder
            Negativbeauskunftung der Zahlung. Unter Umständen werden die Daten
            seitens der Zahlungsdienstleister an Wirtschaftsauskunfteien
            übermittelt. Diese Übermittlung bezweckt die Identitäts- und
            Bonitätsprüfung. Hierzu verweisen wir auf die AGB und
            Datenschutzhinweise der Zahlungsdienstleister.
          </p>
          <p className="leading-7 not-first:mt-2">
            Für die Zahlungsgeschäfte gelten die Geschäftsbedingungen und die
            Datenschutzhinweise der jeweiligen Zahlungsdienstleister, welche
            innerhalb der jeweiligen Webseiten, bzw. Transaktionsapplikationen
            abrufbar sind. Wir verweisen auf diese ebenfalls zwecks weiterer
            Informationen und Geltendmachung von Widerrufs-, Auskunfts- und
            anderen Betroffenenrechten.
          </p>

          <h3 className="mt-10 scroll-m-20 text-2xl font-semibold tracking-tight">
            Administration, Finanzbuchhaltung, Büroorganisation,
            Kontaktverwaltung
          </h3>
          <p className="leading-7 not-first:mt-2">
            Wir verarbeiten Daten im Rahmen von Verwaltungsaufgaben sowie
            Organisation unseres Betriebs, Finanzbuchhaltung und Befolgung der
            gesetzlichen Pflichten, wie z.B. der Archivierung. Hierbei
            verarbeiten wir dieselben Daten, die wir im Rahmen der Erbringung
            unserer vertraglichen Leistungen verarbeiten. Die
            Verarbeitungsgrundlagen sind Art. 6 Abs. 1 lit. c. DSGVO, Art. 6
            Abs. 1 lit. f. DSGVO. Von der Verarbeitung sind Kunden,
            Interessenten, Geschäftspartner und Websitebesucher betroffen. Der
            Zweck und unser Interesse an der Verarbeitung liegt in der
            Administration, Finanzbuchhaltung, Büroorganisation, Archivierung
            von Daten, also Aufgaben die der Aufrechterhaltung unserer
            Geschäftstätigkeiten, Wahrnehmung unserer Aufgaben und Erbringung
            unserer Leistungen dienen. Die Löschung der Daten im Hinblick auf
            vertragliche Leistungen und die vertragliche Kommunikation
            entspricht den, bei diesen Verarbeitungstätigkeiten genannten
            Angaben.
          </p>
          <p className="leading-7 not-first:mt-2">
            Wir offenbaren oder übermitteln hierbei Daten an die
            Finanzverwaltung, Berater, wie z.B., Steuerberater oder
            Wirtschaftsprüfer sowie weitere Gebührenstellen und
            Zahlungsdienstleister.
          </p>
          <p className="leading-7 not-first:mt-2">
            Ferner speichern wir auf Grundlage unserer betriebswirtschaftlichen
            Interessen Angaben zu Lieferanten, Veranstaltern und sonstigen
            Geschäftspartnern, z.B. zwecks späterer Kontaktaufnahme. Diese
            mehrheitlich unternehmensbezogenen Daten, speichern wir
            grundsätzlich dauerhaft.
          </p>

          <h3 className="mt-10 scroll-m-20 text-2xl font-semibold tracking-tight">
            Betriebswirtschaftliche Analysen und Marktforschung
          </h3>
          <p className="leading-7 not-first:mt-2">
            Um unser Geschäft wirtschaftlich betreiben, Markttendenzen, Wünsche
            der Vertragspartner und Nutzer erkennen zu können, analysieren wir
            die uns vorliegenden Daten zu Geschäftsvorgängen, Verträgen,
            Anfragen, etc. Wir verarbeiten dabei Bestandsdaten,
            Kommunikationsdaten, Vertragsdaten, Zahlungsdaten, Nutzungsdaten,
            Metadaten auf Grundlage des Art. 6 Abs. 1 lit. f. DSGVO, wobei zu
            den betroffenen Personen Vertragspartner, Interessenten, Kunden,
            Besucher und Nutzer unseres Onlineangebotes gehören.
          </p>
          <p className="leading-7 not-first:mt-2">
            Die Analysen erfolgen zum Zweck betriebswirtschaftlicher
            Auswertungen, des Marketings und der Marktforschung. Dabei können
            wir die Profile der registrierten Nutzer mit Angaben, z.B. zu deren
            in Anspruch genommenen Leistungen, berücksichtigen. Die Analysen
            dienen uns zur Steigerung der Nutzerfreundlichkeit, der Optimierung
            unseres Angebotes und der Betriebswirtschaftlichkeit. Die Analysen
            dienen alleine uns und werden nicht extern offenbart, sofern es sich
            nicht um anonyme Analysen mit zusammengefassten Werten handelt.
          </p>
          <p className="leading-7 not-first:mt-2">
            Sofern diese Analysen oder Profile personenbezogen sind, werden sie
            mit Kündigung der Nutzer gelöscht oder anonymisiert, sonst nach zwei
            Jahren ab Vertragsschluss. Im Übrigen werden die
            gesamtbetriebswirtschaftlichen Analysen und allgemeine
            Tendenzbestimmungen nach Möglichkeit anonym erstellt.
          </p>

          <h3 className="mt-10 scroll-m-20 text-2xl font-semibold tracking-tight">
            Teilnahme an Affiliate-Partnerprogrammen
          </h3>
          <p className="leading-7 not-first:mt-2">
            Innerhalb unseres Onlineangebotes setzen wir auf Grundlage unserer
            berechtigten Interessen (d.h. Interesse an der Analyse, Optimierung
            und wirtschaftlichem Betrieb unseres Onlineangebotes) gem. Art. 6
            Abs. 1 lit. f DSGVO branchenübliche Trackingmaßnahmen ein, soweit
            diese für den Betrieb des Affiliatesystems erforderlich sind.
            Nachfolgend klären wir die Nutzer über die technischen Hintergründe
            auf.
          </p>
          <p className="leading-7 not-first:mt-2">
            Die von unseren Vertragspartnern angebotene Leistungen können auch
            auf anderen Webseiten beworben und verlinkt werden (sog.
            Affiliate-Links oder After-Buy-Systeme, wenn z.B. Links oder
            Leistungen Dritter nach einem Vertragsschluss angeboten werden). Die
            Betreiber der jeweiligen Webseiten erhalten eine Provision, wenn
            Nutzer den Affiliate-Links folgen und anschließend die Angebote
            wahrnehmen.
          </p>
          <p className="leading-7 not-first:mt-2">
            Zusammenfassend, ist es für unser Onlineangebot erforderlich, dass
            wir nachverfolgen können, ob Nutzer, die sich für Affiliate-Links
            und/oder die bei uns verfügbaren Angebote interessieren, die
            Angebote anschließend auf die Veranlassung der Affiliate-Links oder
            unserer Onlineplattform, wahrnehmen. Hierzu werden die
            Affiliate-Links und unsere Angebote um bestimmte Werte ergänzt, die
            ein Bestandteil des Links oder anderweitig, z.B. in einem Cookie,
            gesetzt werden können. Zu den Werten gehören insbesondere die
            Ausgangswebseite (Referrer), Zeitpunkt, eine Online-Kennung der
            Betreiber der Webseite, auf der sich der Affiliate-Link befand, eine
            Online-Kennung des jeweiligen Angebotes, eine Online-Kennung des
            Nutzers, als auch Tracking-spezifische Werte wie z.B.
            Werbemittel-ID, Partner-ID und Kategorisierungen.
          </p>
          <p className="leading-7 not-first:mt-2">
            Bei der von uns verwendeten Online-Kennungen der Nutzer, handelt es
            sich um pseudonyme Werte. D.h. die Online-Kennungen enthalten selbst
            keine personenbezogenen Daten wie Namen oder E-Mailadressen. Sie
            helfen uns nur zu bestimmen ob derselbe Nutzer, der auf einen
            Affiliate-Link geklickt oder sich über unser Onlineangebot für ein
            Angebot interessiert hat, das Angebot wahrgenommen, d.h. z.B. einen
            Vertrag mit dem Anbieter abgeschlossen hat. Die Online-Kennung ist
            jedoch insoweit personenbezogen, als dem Partnerunternehmen und auch
            uns, die Online-Kennung zusammen mit anderen Nutzerdaten vorliegen.
            Nur so kann das Partnerunternehmen uns mitteilen, ob derjenige
            Nutzer das Angebot wahrgenommen hat und wir z.B. den Bonus auszahlen
            können.
          </p>

          <h3 className="mt-10 scroll-m-20 text-2xl font-semibold tracking-tight">
            Amazon-Partnerprogramm
          </h3>
          <p className="leading-7 not-first:mt-2">
            Wir sind auf Grundlage unserer berechtigten Interessen (d.h.
            Interesse am wirtschaftlichem Betrieb unseres Onlineangebotes im
            Sinne des Art. 6 Abs. 1 lit. f. DSGVO) Teilnehmer des
            Partnerprogramms von Amazon EU, das zur Bereitstellung eines Mediums
            für Websites konzipiert wurde, mittels dessen durch die Platzierung
            von Werbeanzeigen und Links zu Amazon.de Werbekostenerstattung
            verdient werden kann (sog. Affiliate-System). D.h. als
            Amazon-Partner verdienen wir an qualifizierten Käufen.
          </p>
          <p className="leading-7 not-first:mt-2">
            Amazon setzt Cookies ein, um die Herkunft der Bestellungen
            nachvollziehen zu können. Unter anderem kann Amazon erkennen, dass
            Sie den Partnerlink auf dieser Website geklickt und anschließend ein
            Produkt bei Amazon erworben haben.
          </p>
          <p className="leading-7 not-first:mt-2">
            Weitere Informationen zur Datennutzung durch Amazon und
            Widerspruchsmöglichkeiten erhalten Sie in der Datenschutzerklärung
            des Unternehmens:
            <a
              href="https://www.amazon.de/gp/help/customer/display.html?nodeId=201909010"
              className="hover:underline"
              target="_blank"
            >
              https://www.amazon.de/gp/help/customer/display.html?nodeId=201909010
            </a>
            .
          </p>
          <p className="leading-7 not-first:mt-2">
            Hinweis: Amazon und das Amazon-Logo sind Warenzeichen von
            Amazon.com, Inc. oder eines seiner verbundenen Unternehmen.
          </p>

          <h3 className="mt-10 scroll-m-20 text-2xl font-semibold tracking-tight">
            Digistore24 -Partnerprogramm
          </h3>
          <p className="leading-7 not-first:mt-2">
            Wir sind auf Grundlage unserer berechtigten Interessen (d.h.
            Interesse am wirtschaftlichem Betrieb unseres Onlineangebotes im
            Sinne des Art. 6 Abs. 1 lit. f. DSGVO) Teilnehmer des
            Partnerprogramms von Digistore24 GmbH, St.-Godehard-Straße 32, 31139
            Hildesheim, Deutschland, das zur Bereitstellung eines Mediums für
            Websites konzipiert wurde, mittels dessen durch die Platzierung von
            Werbeanzeigen und Links zu Digistore24 Werbekostenerstattung
            verdient werden kann (sog. Affiliate-System). Digistore24 setzt
            Cookies ein, um die Herkunft des Vertragsschlusses nachvollziehen zu
            können. Unter anderem kann Digistore24 erkennen, dass Sie den
            Partnerlink auf dieser Website geklickt und anschließend einen
            Vertragsschluss bei oder über Digistore24 getätigt haben.
          </p>
          <p className="leading-7 not-first:mt-2">
            Weitere Informationen zur Datennutzung durch Digistore24 und
            Widerspruchsmöglichkeiten erhalten Sie in der Datenschutzerklärung
            des Unternehmens:{" "}
            <a
              href="https://www.digistore24.com/page/privacyl"
              className="hover:underline"
              target="_blank"
            >
              https://www.digistore24.com/page/privacyl
            </a>
            .
          </p>

          <h3 className="mt-10 scroll-m-20 text-2xl font-semibold tracking-tight">
            Datenschutzhinweise im Bewerbungsverfahren
          </h3>
          <p className="leading-7 not-first:mt-2">
            Wir verarbeiten die Bewerberdaten nur zum Zweck und im Rahmen des
            Bewerbungsverfahrens im Einklang mit den gesetzlichen Vorgaben. Die
            Verarbeitung der Bewerberdaten erfolgt zur Erfüllung unserer
            (vor)vertraglichen Verpflichtungen im Rahmen des
            Bewerbungsverfahrens im Sinne des Art. 6 Abs. 1 lit. b. DSGVO Art. 6
            Abs. 1 lit. f. DSGVO sofern die Datenverarbeitung z.B. im Rahmen von
            rechtlichen Verfahren für uns erforderlich wird (in Deutschland gilt
            zusätzlich § 26 BDSG).
          </p>
          <p className="leading-7 not-first:mt-2">
            Das Bewerbungsverfahren setzt voraus, dass Bewerber uns die
            Bewerberdaten mitteilen. Die notwendigen Bewerberdaten sind, sofern
            wir ein Onlineformular anbieten gekennzeichnet, ergeben sich sonst
            aus den Stellenbeschreibungen und grundsätzlich gehören dazu die
            Angaben zur Person, Post- und Kontaktadressen und die zur Bewerbung
            gehörenden Unterlagen, wie Anschreiben, Lebenslauf und die
            Zeugnisse. Daneben können uns Bewerber freiwillig zusätzliche
            Informationen mitteilen.
          </p>
          <p className="leading-7 not-first:mt-2">
            Mit der Übermittlung der Bewerbung an uns, erklären sich die
            Bewerber mit der Verarbeitung ihrer Daten zu Zwecken des
            Bewerbungsverfahrens entsprechend der in dieser Datenschutzerklärung
            dargelegten Art und Umfang einverstanden.
          </p>
          <p className="leading-7 not-first:mt-2">
            Soweit im Rahmen des Bewerbungsverfahrens freiwillig besondere
            Kategorien von personenbezogenen Daten im Sinne des Art. 9 Abs. 1
            DSGVO mitgeteilt werden, erfolgt deren Verarbeitung zusätzlich nach
            Art. 9 Abs. 2 lit. b DSGVO (z.B. Gesundheitsdaten, wie z.B.
            Schwerbehinderteneigenschaft oder ethnische Herkunft). Soweit im
            Rahmen des Bewerbungsverfahrens besondere Kategorien von
            personenbezogenen Daten im Sinne des Art. 9 Abs. 1 DSGVO bei
            Bewerbern angefragt werden, erfolgt deren Verarbeitung zusätzlich
            nach Art. 9 Abs. 2 lit. a DSGVO (z.B. Gesundheitsdaten, wenn diese
            für die Berufsausübung erforderlich sind).
          </p>
          <p className="leading-7 not-first:mt-2">
            Sofern zur Verfügung gestellt, können uns Bewerber ihre Bewerbungen
            mittels eines Onlineformulars auf unserer Website übermitteln. Die
            Daten werden entsprechend dem Stand der Technik verschlüsselt an uns
            übertragen. Ferner können Bewerber uns ihre Bewerbungen via E-Mail
            übermitteln. Hierbei bitten wir jedoch zu beachten, dass E-Mails
            grundsätzlich nicht verschlüsselt versendet werden und die Bewerber
            selbst für die Verschlüsselung sorgen müssen. Wir können daher für
            den Übertragungsweg der Bewerbung zwischen dem Absender und dem
            Empfang auf unserem Server keine Verantwortung übernehmen und
            empfehlen daher eher ein Online-Formular oder den postalischen
            Versand zu nutzen. Denn statt der Bewerbung über das Online-Formular
            und E-Mail, steht den Bewerbern weiterhin die Möglichkeit zur
            Verfügung, uns die Bewerbung auf dem Postweg zuzusenden.
          </p>
          <p className="leading-7 not-first:mt-2">
            Die von den Bewerbern zur Verfügung gestellten Daten, können im Fall
            einer erfolgreichen Bewerbung für die Zwecke des
            Beschäftigungsverhältnisses von uns weiterverarbeitet werden.
            Andernfalls, sofern die Bewerbung auf ein Stellenangebot nicht
            erfolgreich ist, werden die Daten der Bewerber gelöscht. Die Daten
            der Bewerber werden ebenfalls gelöscht, wenn eine Bewerbung
            zurückgezogen wird, wozu die Bewerber jederzeit berechtigt sind.
          </p>
          <p className="leading-7 not-first:mt-2">
            Die Löschung erfolgt, vorbehaltlich eines berechtigten Widerrufs der
            Bewerber, nach dem Ablauf eines Zeitraums von sechs Monaten, damit
            wir etwaige Anschlussfragen zu der Bewerbung beantworten und unseren
            Nachweispflichten aus dem Gleichbehandlungsgesetz genügen können.
            Rechnungen über etwaige Reisekostenerstattung werden entsprechend
            den steuerrechtlichen Vorgaben archiviert.
          </p>

          <h3 className="mt-10 scroll-m-20 text-2xl font-semibold tracking-tight">
            Registrierfunktion
          </h3>
          <p className="leading-7 not-first:mt-2">
            Nutzer können ein Nutzerkonto anlegen. Im Rahmen der Registrierung
            werden die erforderlichen Pflichtangaben den Nutzern mitgeteilt und
            auf Grundlage des Art. 6 Abs. 1 lit. b DSGVO zu Zwecken der
            Bereitstellung des Nutzerkontos verarbeitet. Zu den verarbeiteten
            Daten gehören insbesondere die Login-Informationen (Name, Passwort
            sowie eine E-Mailadresse). Die im Rahmen der Registrierung
            eingegebenen Daten werden für die Zwecke der Nutzung des
            Nutzerkontos und dessen Zwecks verwendet.
          </p>
          <p className="leading-7 not-first:mt-2">
            Die Nutzer können über Informationen, die für deren Nutzerkonto
            relevant sind, wie z.B. technische Änderungen, per E-Mail informiert
            werden. Wenn Nutzer ihr Nutzerkonto gekündigt haben, werden deren
            Daten im Hinblick auf das Nutzerkonto, vorbehaltlich einer
            gesetzlichen Aufbewahrungspflicht, gelöscht. Es obliegt den Nutzern,
            ihre Daten bei erfolgter Kündigung vor dem Vertragsende zu sichern.
            Wir sind berechtigt, sämtliche während der Vertragsdauer
            gespeicherten Daten des Nutzers unwiederbringlich zu löschen.
          </p>
          <p className="leading-7 not-first:mt-2">
            Im Rahmen der Inanspruchnahme unserer Registrierungs- und
            Anmeldefunktionen sowie der Nutzung des Nutzerkontos, speichern wir
            die IP-Adresse und den Zeitpunkt der jeweiligen Nutzerhandlung. Die
            Speicherung erfolgt auf Grundlage unserer berechtigten Interessen,
            als auch der Nutzer an Schutz vor Missbrauch und sonstiger
            unbefugter Nutzung. Eine Weitergabe dieser Daten an Dritte erfolgt
            grundsätzlich nicht, außer sie ist zur Verfolgung unserer Ansprüche
            erforderlich oder es besteht hierzu besteht eine gesetzliche
            Verpflichtung gem. Art. 6 Abs. 1 lit. c. DSGVO. Die IP-Adressen
            werden spätestens nach 7 Tagen anonymisiert oder gelöscht.
          </p>

          <h3 className="mt-10 scroll-m-20 text-2xl font-semibold tracking-tight">
            Kontaktaufnahme
          </h3>
          <p className="leading-7 not-first:mt-2">
            Bei der Kontaktaufnahme mit uns (z.B. per Kontaktformular, E-Mail,
            Telefon oder via sozialer Medien) werden die Angaben des Nutzers zur
            Bearbeitung der Kontaktanfrage und deren Abwicklung gem. Art. 6 Abs.
            1 lit. b. (im Rahmen vertraglicher-/vorvertraglicher Beziehungen),
            Art. 6 Abs. 1 lit. f. (andere Anfragen) DSGVO verarbeitet.. Die
            Angaben der Nutzer können in einem Customer-Relationship-Management
            System (&quot;CRM System&rdquo;) oder vergleichbarer
            Anfragenorganisation gespeichert werden.
          </p>
          <p className="leading-7 not-first:mt-2">
            Wir löschen die Anfragen, sofern diese nicht mehr erforderlich sind.
            Wir überprüfen die Erforderlichkeit alle zwei Jahre; Ferner gelten
            die gesetzlichen Archivierungspflichten.
          </p>

          <h3 className="mt-10 scroll-m-20 text-2xl font-semibold tracking-tight">
            Newsletter
          </h3>
          <p className="leading-7 not-first:mt-2">
            Mit den nachfolgenden Hinweisen informieren wir Sie über die Inhalte
            unseres Newsletters sowie das Anmelde-, Versand- und das
            statistische Auswertungsverfahren sowie Ihre Widerspruchsrechte auf.
            Indem Sie unseren Newsletter abonnieren, erklären Sie sich mit dem
            Empfang und den beschriebenen Verfahren einverstanden.
          </p>
          <p className="leading-7 not-first:mt-2">
            Inhalt des Newsletters: Wir versenden Newsletter, E-Mails und
            weitere elektronische Benachrichtigungen mit werblichen
            Informationen (nachfolgend „Newsletter“) nur mit der Einwilligung
            der Empfänger oder einer gesetzlichen Erlaubnis. Sofern im Rahmen
            einer Anmeldung zum Newsletter dessen Inhalte konkret umschrieben
            werden, sind sie für die Einwilligung der Nutzer maßgeblich. Im
            Übrigen enthalten unsere Newsletter Informationen zu unseren
            Leistungen und uns.
          </p>
          <p className="leading-7 not-first:mt-2">
            Double-Opt-In und Protokollierung: Die Anmeldung zu unserem
            Newsletter erfolgt in einem sog. Double-Opt-In-Verfahren. D.h. Sie
            erhalten nach der Anmeldung eine E-Mail, in der Sie um die
            Bestätigung Ihrer Anmeldung gebeten werden. Diese Bestätigung ist
            notwendig, damit sich niemand mit fremden E-Mailadressen anmelden
            kann. Die Anmeldungen zum Newsletter werden protokolliert, um den
            Anmeldeprozess entsprechend den rechtlichen Anforderungen nachweisen
            zu können. Hierzu gehört die Speicherung des Anmelde- und des
            Bestätigungszeitpunkts, als auch der IP-Adresse. Ebenso werden die
            Änderungen Ihrer bei dem Versanddienstleister gespeicherten Daten
            protokolliert.
          </p>
          <p className="leading-7 not-first:mt-2">
            Anmeldedaten: Um sich für den Newsletter anzumelden, reicht es aus,
            wenn Sie Ihre E-Mailadresse angeben. Optional bitten wir Sie einen
            Namen, zwecks persönlicher Ansprache im Newsletters anzugeben.
          </p>
          <p className="leading-7 not-first:mt-2">
            Der Versand des Newsletters und die mit ihm verbundene
            Erfolgsmessung erfolgen auf Grundlage einer Einwilligung der
            Empfänger gem. Art. 6 Abs. 1 lit. a, Art. 7 DSGVO i.V.m § 7 Abs. 2
            Nr. 3 UWG oder falls eine Einwilligung nicht erforderlich ist, auf
            Grundlage unserer berechtigten Interessen am Direktmarketing gem.
            Art. 6 Abs. 1 lt. f. DSGVO i.V.m. § 7 Abs. 3 UWG.
          </p>
          <p className="leading-7 not-first:mt-2">
            Die Protokollierung des Anmeldeverfahrens erfolgt auf Grundlage
            unserer berechtigten Interessen gem. Art. 6 Abs. 1 lit. f DSGVO.
            Unser Interesse richtet sich auf den Einsatz eines
            nutzerfreundlichen sowie sicheren Newslettersystems, das sowohl
            unseren geschäftlichen Interessen dient, als auch den Erwartungen
            der Nutzer entspricht und uns ferner den Nachweis von Einwilligungen
            erlaubt.
          </p>
          <p className="leading-7 not-first:mt-2">
            Kündigung/Widerruf - Sie können den Empfang unseres Newsletters
            jederzeit kündigen, d.h. Ihre Einwilligungen widerrufen. Einen Link
            zur Kündigung des Newsletters finden Sie am Ende eines jeden
            Newsletters. Wir können die ausgetragenen E-Mailadressen bis zu drei
            Jahren auf Grundlage unserer berechtigten Interessen speichern bevor
            wir sie löschen, um eine ehemals gegebene Einwilligung nachweisen zu
            können. Die Verarbeitung dieser Daten wird auf den Zweck einer
            möglichen Abwehr von Ansprüchen beschränkt. Ein individueller
            Löschungsantrag ist jederzeit möglich, sofern zugleich das ehemalige
            Bestehen einer Einwilligung bestätigt wird.
          </p>

          <h3 className="mt-10 scroll-m-20 text-2xl font-semibold tracking-tight">
            Newsletter - Versanddienstleister
          </h3>
          <p className="leading-7 not-first:mt-2">
            Der Versand der Newsletter erfolgt mittels des Versanddienstleisters
            [NAME, ADRESSE, LAND]. Die Datenschutzbestimmungen des
            Versanddienstleisters können Sie hier einsehen: [LINK ZU DEN
            DATENSCHUTZBESTIMMUNGEN]. Der Versanddienstleister wird auf
            Grundlage unserer berechtigten Interessen gem. Art. 6 Abs. 1 lit. f.
            DSGVO und eines Auftragsverarbeitungsvertrages gem. Art. 28 Abs. 3
            S. 1 DSGVO eingesetzt.
          </p>
          <p className="leading-7 not-first:mt-2">
            Der Versanddienstleister kann die Daten der Empfänger in pseudonymer
            Form, d.h. ohne Zuordnung zu einem Nutzer, zur Optimierung oder
            Verbesserung der eigenen Services nutzen, z.B. zur technischen
            Optimierung des Versandes und der Darstellung der Newsletter oder
            für statistische Zwecke verwenden. Der Versanddienstleister nutzt
            die Daten unserer Newsletterempfänger jedoch nicht, um diese selbst
            anzuschreiben oder um die Daten an Dritte weiterzugeben.
          </p>

          <h3 className="mt-10 scroll-m-20 text-2xl font-semibold tracking-tight">
            Newsletter - Erfolgsmessung
          </h3>
          <p className="leading-7 not-first:mt-2">
            Die Newsletter enthalten einen sog. „web-beacon“, d.h. eine
            pixelgroße Datei, die beim Öffnen des Newsletters von unserem
            Server, bzw. sofern wir einen Versanddienstleister einsetzen, von
            dessen Server abgerufen wird. Im Rahmen dieses Abrufs werden
            zunächst technische Informationen, wie Informationen zum Browser und
            Ihrem System, als auch Ihre IP-Adresse und Zeitpunkt des Abrufs
            erhoben.
          </p>
          <p className="leading-7 not-first:mt-2">
            Diese Informationen werden zur technischen Verbesserung der Services
            anhand der technischen Daten oder der Zielgruppen und ihres
            Leseverhaltens anhand derer Abruforte (die mit Hilfe der IP-Adresse
            bestimmbar sind) oder der Zugriffszeiten genutzt. Zu den
            statistischen Erhebungen gehört ebenfalls die Feststellung, ob die
            Newsletter geöffnet werden, wann sie geöffnet werden und welche
            Links geklickt werden. Diese Informationen können aus technischen
            Gründen zwar den einzelnen Newsletterempfängern zugeordnet werden.
            Es ist jedoch weder unser Bestreben, noch, sofern eingesetzt, das
            des Versanddienstleisters, einzelne Nutzer zu beobachten. Die
            Auswertungen dienen uns viel mehr dazu, die Lesegewohnheiten unserer
            Nutzer zu erkennen und unsere Inhalte auf sie anzupassen oder
            unterschiedliche Inhalte entsprechend den Interessen unserer Nutzer
            zu versenden.
          </p>
          <p className="leading-7 not-first:mt-2">
            Ein getrennter Widerruf der Erfolgsmessung ist leider nicht möglich,
            in diesem Fall muss das gesamte Newsletterabonnement gekündigt
            werden.
          </p>

          <h3 className="mt-10 scroll-m-20 text-2xl font-semibold tracking-tight">
            Hosting und E-Mail-Versand
          </h3>
          <p className="leading-7 not-first:mt-2">
            Die von uns in Anspruch genommenen Hosting-Leistungen dienen der
            Zurverfügungstellung der folgenden Leistungen: Infrastruktur- und
            Plattformdienstleistungen, Rechenkapazität, Speicherplatz und
            Datenbankdienste, E-Mail-Versand, Sicherheitsleistungen sowie
            technische Wartungsleistungen, die wir zum Zwecke des Betriebs
            dieses Onlineangebotes einsetzen.
          </p>
          <p className="leading-7 not-first:mt-2">
            Hierbei verarbeiten wir, bzw. unser Hostinganbieter Bestandsdaten,
            Kontaktdaten, Inhaltsdaten, Vertragsdaten, Nutzungsdaten, Meta- und
            Kommunikationsdaten von Kunden, Interessenten und Besuchern dieses
            Onlineangebotes auf Grundlage unserer berechtigten Interessen an
            einer effizienten und sicheren Zurverfügungstellung dieses
            Onlineangebotes gem. Art. 6 Abs. 1 lit. f DSGVO i.V.m. Art. 28 DSGVO
            (Abschluss Auftragsverarbeitungsvertrag).
          </p>

          <h3 className="mt-10 scroll-m-20 text-2xl font-semibold tracking-tight">
            Erhebung von Zugriffsdaten und Logfiles
          </h3>
          <p className="leading-7 not-first:mt-2">
            Wir, bzw. unser Hostinganbieter, erhebt auf Grundlage unserer
            berechtigten Interessen im Sinne des Art. 6 Abs. 1 lit. f. DSGVO
            Daten über jeden Zugriff auf den Server, auf dem sich dieser Dienst
            befindet (sogenannte Serverlogfiles). Zu den Zugriffsdaten gehören
            Name der abgerufenen Webseite, Datei, Datum und Uhrzeit des Abrufs,
            übertragene Datenmenge, Meldung über erfolgreichen Abruf, Browsertyp
            nebst Version, das Betriebssystem des Nutzers, Referrer URL (die
            zuvor besuchte Seite), IP-Adresse und der anfragende Provider.
          </p>
          <p className="leading-7 not-first:mt-2">
            Logfile-Informationen werden aus Sicherheitsgründen (z.B. zur
            Aufklärung von Missbrauchs- oder Betrugshandlungen) für die Dauer
            von maximal 7 Tagen gespeichert und danach gelöscht. Daten, deren
            weitere Aufbewahrung zu Beweiszwecken erforderlich ist, sind bis zur
            endgültigen Klärung des jeweiligen Vorfalls von der Löschung
            ausgenommen.
          </p>

          <h3 className="mt-10 scroll-m-20 text-2xl font-semibold tracking-tight">
            Google Analytics
          </h3>
          <p className="leading-7 not-first:mt-2">
            Wir setzen auf Grundlage unserer berechtigten Interessen (d.h.
            Interesse an der Analyse, Optimierung und wirtschaftlichem Betrieb
            unseres Onlineangebotes im Sinne des Art. 6 Abs. 1 lit. f. DSGVO)
            Google Analytics, einen Webanalysedienst der Google LLC („Google“)
            ein. Google verwendet Cookies. Die durch das Cookie erzeugten
            Informationen über Benutzung des Onlineangebotes durch die Nutzer
            werden in der Regel an einen Server von Google in den USA übertragen
            und dort gespeichert.
          </p>
          <p className="leading-7 not-first:mt-2">
            Google ist unter dem Privacy-Shield-Abkommen zertifiziert und bietet
            hierdurch eine Garantie, das europäische Datenschutzrecht
            einzuhalten (
            <a
              href="https://www.privacyshield.gov/participant?id=a2zt000000001L5AAI&status=Active"
              className="hover:underline"
              target="_blank"
            >
              https://www.privacyshield.gov/participant?id=a2zt000000001L5AAI&status=Active
            </a>
            ).
          </p>
          <p className="leading-7 not-first:mt-2">
            Google wird diese Informationen in unserem Auftrag benutzen, um die
            Nutzung unseres Onlineangebotes durch die Nutzer auszuwerten, um
            Reports über die Aktivitäten innerhalb dieses Onlineangebotes
            zusammenzustellen und um weitere, mit der Nutzung dieses
            Onlineangebotes und der Internetnutzung verbundene Dienstleistungen,
            uns gegenüber zu erbringen. Dabei können aus den verarbeiteten Daten
            pseudonyme Nutzungsprofile der Nutzer erstellt werden.
          </p>
          <p className="leading-7 not-first:mt-2">
            Wir setzen Google Analytics nur mit aktivierter IP-Anonymisierung
            ein. Das bedeutet, die IP-Adresse der Nutzer wird von Google
            innerhalb von Mitgliedstaaten der Europäischen Union oder in anderen
            Vertragsstaaten des Abkommens über den Europäischen Wirtschaftsraum
            gekürzt. Nur in Ausnahmefällen wird die volle IP-Adresse an einen
            Server von Google in den USA übertragen und dort gekürzt.
          </p>
          <p className="leading-7 not-first:mt-2">
            Die von dem Browser des Nutzers übermittelte IP-Adresse wird nicht
            mit anderen Daten von Google zusammengeführt. Die Nutzer können die
            Speicherung der Cookies durch eine entsprechende Einstellung ihrer
            Browser-Software verhindern; die Nutzer können darüber hinaus die
            Erfassung der durch das Cookie erzeugten und auf ihre Nutzung des
            Onlineangebotes bezogenen Daten an Google sowie die Verarbeitung
            dieser Daten durch Google verhindern, indem sie das unter folgendem
            Link verfügbare Browser-Plugin herunterladen und installieren:
            <a
              href="http://tools.google.com/dlpage/gaoptout?hl=de"
              className="hover:underline"
              target="_blank"
            >
              http://tools.google.com/dlpage/gaoptout?hl=de
            </a>
            .
          </p>
          <p className="leading-7 not-first:mt-2">
            Weitere Informationen zur Datennutzung durch Google, Einstellungs-
            und Widerspruchsmöglichkeiten, erfahren Sie in der
            Datenschutzerklärung von Google (
            <a
              href="https://policies.google.com/privacy"
              className="hover:underline"
              target="_blank"
            >
              https://policies.google.com/privacy
            </a>
            ) sowie in den Einstellungen für die Darstellung von
            Werbeeinblendungen durch Google (
            <a
              href="https://adssettings.google.com/authenticated"
              className="hover:underline"
              target="_blank"
            >
              https://adssettings.google.com/authenticated
            </a>
            ).
          </p>
          <p className="leading-7 not-first:mt-2">
            Die personenbezogenen Daten der Nutzer werden nach 14 Monaten
            gelöscht oder anonymisiert.
          </p>

          <h3 className="mt-10 scroll-m-20 text-2xl font-semibold tracking-tight">
            Google Adsense mit personalisierten Anzeigen
          </h3>
          <p className="leading-7 not-first:mt-2">
            Wir nutzen auf Grundlage unserer berechtigten Interessen (d.h.
            Interesse an der Analyse, Optimierung und wirtschaftlichem Betrieb
            unseres Onlineangebotes im Sinne des Art. 6 Abs. 1 lit. f. DSGVO)
            die Dienste der Google LLC, 1600 Amphitheatre Parkway, Mountain
            View, CA 94043, USA, („Google“).
          </p>
          <p className="leading-7 not-first:mt-2">
            Google ist unter dem Privacy-Shield-Abkommen zertifiziert und bietet
            hierdurch eine Garantie, das europäische Datenschutzrecht
            einzuhalten (
            <a
              href="https://www.privacyshield.gov/participant?id=a2zt000000001L5AAI&status=Active"
              className="hover:underline"
              target="_blank"
            >
              https://www.privacyshield.gov/participant?id=a2zt000000001L5AAI&status=Active
            </a>
            ).
          </p>
          <p className="leading-7 not-first:mt-2">
            Wir Nutzen den Dienst AdSense, mit dessen Hilfe Anzeigen in unsere
            Webseite eingeblendet und wir für deren Einblendung oder sonstige
            Nutzung eine Entlohnung erhalten. Zu diesen Zwecken werden
            Nutzungsdaten, wie z.B. der Klick auf eine Anzeige und die
            IP-Adresse der Nutzer verarbeitet, wobei die IP-Adresse um die
            letzten beiden Stellen gekürzt wird. Daher erfolgt die Verarbeitung
            der Daten der Nutzer pseudonymisiert.
          </p>
          <p className="leading-7 not-first:mt-2">
            Wir setzen Adsense mit personalisierten Anzeigen ein. Dabei zieht
            Google auf Grundlage der von Nutzern besuchten Websites oder
            verwendeten Apps und den so erstellten Nutzerprofilen Rückschlüsse
            auf deren Interessen. Werbetreibende nutzen diese Informationen, um
            ihre Kampagnen an diesen Interessen auszurichten, was für Nutzer und
            Werbetreibende gleichermaßen von Vorteil ist. Für Google sind
            Anzeigen dann personalisiert, wenn erfasste oder bekannte Daten die
            Anzeigenauswahl bestimmen oder beeinflussen. Dazu zählen unter
            anderem frühere Suchanfragen, Aktivitäten, Websitebesuche, die
            Verwendung von Apps, demografische und Standortinformationen. Im
            Einzelnen umfasst dies: demografisches Targeting, Targeting auf
            Interessenkategorien, Remarketing sowie Targeting auf Listen zum
            Kundenabgleich und Zielgruppenlisten, die in DoubleClick Bid Manager
            oder Campaign Manager hochgeladen wurden.
          </p>
          <p className="leading-7 not-first:mt-2">
            Weitere Informationen zur Datennutzung durch Google, Einstellungs-
            und Widerspruchsmöglichkeiten, erfahren Sie in der
            Datenschutzerklärung von Google (
            <a
              href="https://policies.google.com/technologies/ads"
              className="hover:underline"
              target="_blank"
            >
              https://policies.google.com/technologies/ads
            </a>
            ) sowie in den Einstellungen für die Darstellung von
            Werbeeinblendungen durch Google (
            <a
              href="https://adssettings.google.com/authenticated"
              className="hover:underline"
              target="_blank"
            >
              https://adssettings.google.com/authenticated
            </a>
            ).
          </p>

          <h3 className="mt-10 scroll-m-20 text-2xl font-semibold tracking-tight">
            Facebook-Pixel, Custom Audiences und Facebook-Conversion
          </h3>
          <p className="leading-7 not-first:mt-2">
            Innerhalb unseres Onlineangebotes wird aufgrund unserer berechtigten
            Interessen an Analyse, Optimierung und wirtschaftlichem Betrieb
            unseres Onlineangebotes und zu diesen Zwecken das sog.
            &quot;Facebook-Pixel&rdquo; des sozialen Netzwerkes Facebook,
            welches von der Facebook Inc., 1 Hacker Way, Menlo Park, CA 94025,
            USA, bzw. falls Sie in der EU ansässig sind, Facebook Ireland Ltd.,
            4 Grand Canal Square, Grand Canal Harbour, Dublin 2, Irland
            betrieben wird (&quot;Facebook&rdquo;), eingesetzt.
          </p>
          <p className="leading-7 not-first:mt-2">
            Facebook ist unter dem Privacy-Shield-Abkommen zertifiziert und
            bietet hierdurch eine Garantie, das europäische Datenschutzrecht
            einzuhalten (
            <a
              href="https://www.privacyshield.gov/participant?id=a2zt0000000GnywAAC&status=Active"
              className="hover:underline"
              target="_blank"
            >
              https://www.privacyshield.gov/participant?id=a2zt0000000GnywAAC&status=Active
            </a>
            ).
          </p>
          <p className="leading-7 not-first:mt-2">
            Mit Hilfe des Facebook-Pixels ist es Facebook zum einen möglich, die
            Besucher unseres Onlineangebotes als Zielgruppe für die Darstellung
            von Anzeigen (sog. &quot;Facebook-Ads&rdquo;) zu bestimmen.
            Dementsprechend setzen wir das Facebook-Pixel ein, um die durch uns
            geschalteten Facebook-Ads nur solchen Facebook-Nutzern anzuzeigen,
            die auch ein Interesse an unserem Onlineangebot gezeigt haben oder
            die bestimmte Merkmale (z.B. Interessen an bestimmten Themen oder
            Produkten, die anhand der besuchten Webseiten bestimmt werden)
            aufweisen, die wir an Facebook übermitteln (sog. „Custom
            Audiences“). Mit Hilfe des Facebook-Pixels möchten wir auch
            sicherstellen, dass unsere Facebook-Ads dem potentiellen Interesse
            der Nutzer entsprechen und nicht belästigend wirken. Mit Hilfe des
            Facebook-Pixels können wir ferner die Wirksamkeit der
            Facebook-Werbeanzeigen für statistische und Marktforschungszwecke
            nachvollziehen, in dem wir sehen ob Nutzer nachdem Klick auf eine
            Facebook-Werbeanzeige auf unsere Website weitergeleitet wurden (sog.
            „Conversion“).
          </p>
          <p className="leading-7 not-first:mt-2">
            Die Verarbeitung der Daten durch Facebook erfolgt im Rahmen von
            Facebooks Datenverwendungsrichtlinie. Dementsprechend generelle
            Hinweise zur Darstellung von Facebook-Ads, in der
            Datenverwendungsrichtlinie von Facebook:
            <a
              href="https://www.facebook.com/policy"
              className="hover:underline"
              target="_blank"
            >
              https://www.facebook.com/policy
            </a>
            . Spezielle Informationen und Details zum Facebook-Pixel und seiner
            Funktionsweise erhalten Sie im Hilfebereich von Facebook:
            <a
              href="https://www.facebook.com/business/help/651294705016616"
              className="hover:underline"
              target="_blank"
            >
              https://www.facebook.com/business/help/651294705016616
            </a>
            .
          </p>
          <p className="leading-7 not-first:mt-2">
            Sie können der Erfassung durch den Facebook-Pixel und Verwendung
            Ihrer Daten zur Darstellung von Facebook-Ads widersprechen. Um
            einzustellen, welche Arten von Werbeanzeigen Ihnen innerhalb von
            Facebook angezeigt werden, können Sie die von Facebook eingerichtete
            Seite aufrufen und dort die Hinweise zu den Einstellungen
            nutzungsbasierter Werbung befolgen:
            <a
              href="https://www.facebook.com/settings?tab=ads"
              className="hover:underline"
              target="_blank"
            >
              https://www.facebook.com/settings?tab=ads
            </a>
            . Die Einstellungen erfolgen plattformunabhängig, d.h. sie werden
            für alle Geräte, wie Desktopcomputer oder mobile Geräte übernommen.
          </p>
          <p className="leading-7 not-first:mt-2">
            Sie können dem Einsatz von Cookies, die der Reichweitenmessung und
            Werbezwecken dienen, ferner über die Deaktivierungsseite der
            Netzwerkwerbeinitiative (
            <a
              href="http://optout.networkadvertising.org/"
              className="hover:underline"
              target="_blank"
            >
              http://optout.networkadvertising.org/
            </a>
            ) und zusätzlich die US-amerikanische Webseite (
            <a
              href="http://www.aboutads.info/choices"
              className="hover:underline"
              target="_blank"
            >
              http://www.aboutads.info/choices
            </a>
            ) oder die europäische Webseite (
            <a
              href="http://www.youronlinechoices.com/uk/your-ad-choices/"
              className="hover:underline"
              target="_blank"
            >
              http://www.youronlinechoices.com/uk/your-ad-choices/
            </a>
            ) widersprechen.
          </p>
          <p className="mt-6 text-sm text-muted-foreground">
            <a
              href="https://datenschutz-generator.de/"
              className="hover:underline"
              target="_blank"
            >
              Erstellt mit Datenschutz-Generator.de von RA Dr. Thomas Schwenke
            </a>
          </p>
          <p className="mt-6 text-sm text-muted-foreground">
            Tritt ab dem 09.12.2024 in Kraft.
          </p>
          <p className="mt-6 text-sm text-muted-foreground">
            <a
              href="https://ec.europa.eu/consumers/odr/main/index.cfm?event=main.home2.show&lng=DE"
              className="hover:underline"
              target="_blank"
            >
              Link zur Streitplattform
            </a>
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
