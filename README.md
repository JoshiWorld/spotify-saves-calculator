# SmartSavvy - SmartLinks und Online-Kurse für Musiker

[//]: # (Logo hier einfügen)
![SmartSavvy Logo](https://smartsavvy.eu/images/logo.png)

Willkommen im SmartSavvy Repository! SmartSavvy ist die ultimative Plattform für Musiker, die ihre Online-Präsenz optimieren und ihre Karriere vorantreiben möchten. Wir bieten leistungsstarke SmartLinks, um deine Musik optimal zu präsentieren, und hochwertige Online-Kurse, um dein Wissen und deine Fähigkeiten zu erweitern.

[https://smartsavvy.eu](https://smartsavvy.eu)

## Features

*   **SmartLinks:**
    *   Erstelle ansprechende und conversion-optimierte Landingpages für deine Musik.
    *   Verbinde alle deine Streaming-Dienste (Spotify, Apple Music, Deezer, etc.) an einem Ort.
    *   Tracke Klicks, Views und Conversions, um deine Marketingstrategie zu optimieren.
    *   Passe das Design deiner SmartLinks individuell an.
    *   Integriere Facebook Pixel für detailliertes Conversion-Tracking.
*   **Online-Kurse:**
    *   Erlerne die Grundlagen des Musikmarketings, der Promotion und des Brandings.
    *   Erhalte wertvolle Einblicke von erfahrenen Experten der Musikindustrie.
    *   Erweitere dein Wissen über Social Media Marketing, Spotify Algorithmen und mehr.
    *   Optimiere deine Musikvermarktung mit praxiserprobten Strategien.

## Tech Stack

SmartSavvy basiert auf den folgenden Technologien:

*   **Frontend:**
    *   [Next.js 15](https://nextjs.org/) - Das React Framework für Production
    *   [AceternetyUI](https://www.aceternety.com/) - Umfassende und moderne UI-Komponentenbibliothek
    *   [ShadcnUI](https://ui.shadcn.com/) - Wiederverwendbare UI-Komponenten, die du einfach kopieren und einfügen kannst
    *   [Tailwind CSS](https://tailwindcss.com/) - Utility-First CSS Framework
*   **Backend:**
    *   [T3 Stack](https://create.t3.gg/) - Ein moderner Webentwicklungsstack
        *   [tRPC](https://trpc.io/) - End-to-End Typesafe APIs
        *   [NextAuth.js](https://next-auth.js.org/) - Authentication
        *   [Prisma](https://www.prisma.io/) - ORM (Object-Relational Mapper)
*   **Datenbank:**
    *   MongoDB - Flexible und skalierbare NoSQL-Datenbank
    *   Upstash Redis - Für Stats
*   **Deployment:**
    *   [Vercel](https://vercel.com/) - Für automatische Deployments und globale Skalierung

## Lokale Entwicklung

So startest du SmartSavvy lokal:

1.  **Klonen des Repository:**

    ```bash
    git clone https://github.com/JoshiWorld/spotify-saves-calculator
    cd smartsavvy
    ```

2.  **Installation der Abhängigkeiten:**

    ```bash
    npm install
    # oder
    yarn install
    ```

3.  **Erstellung der `.env` Datei:**

    Kopiere die `.env.example` Datei und passe die Umgebungsvariablen an:

    ```bash
    cp .env.example .env
    ```

    Passe die Werte in der `.env` Datei an deine lokale Umgebung an.

4.  **Datenbank Migrationen anwenden:**

    ```bash
    npx prisma migrate dev
    ```

5.  **Entwicklungs-Server starten:**

    ```bash
    npm run dev
    # oder
    yarn dev
    ```

    Öffne [http://localhost:3000](http://localhost:3000) in deinem Browser, um SmartSavvy zu nutzen und um es weiterzuentwickeln.

## Deployment

SmartSavvy wird automatisch auf Vercel deployed. Jede Pull-Request in den `main` Branch löst einen neuen Deployment aus.

## Lizenz

[MIT](https://choosealicense.com/licenses/mit/)

## Kontakt

Joshua Stieber - joshua@smartsavvy.eu
