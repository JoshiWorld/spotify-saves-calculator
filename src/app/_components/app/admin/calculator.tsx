"use client";

import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Label } from "@/components/ui/label";

export function AdminCalculator() {
  return (
    <div className="flex w-full flex-col">
      <Calculator />
    </div>
  );
}

function Calculator() {
    const [kunden, setKunden] = useState(10);
    const [preisBrutto, setPreisBrutto] = useState(19.99);
    const [mwst, setMwst] = useState(19);
    const [splitIch, setSplitIch] = useState(60);
    const [digistoreFee, setDigistoreFee] = useState(7.9);
    const [digistoreFix, setDigistoreFix] = useState(1);

    const brutto = preisBrutto;
    const netto = brutto / (1 + mwst / 100);
    const digistore = brutto * (digistoreFee / 100) + digistoreFix;
    const erloesProKunde = netto - digistore;
    const gesamtErloesNetto = erloesProKunde * kunden;
    const gesamtErloesBrutto = (brutto - digistore) * kunden;
    const meinBrutto = gesamtErloesNetto * (splitIch / 100);
    // const meinNetto = meinBrutto * (1 - steuerSatz / 100);
    const meinNetto = berechneNettoAusBrutto(meinBrutto*12) / 12;

    console.log('Nettoeinkommen:', berechneEinkommensteuer2025(meinBrutto*12).netto / 12);
    console.log('Steuersatz:', berechneEinkommensteuer2025(meinBrutto*12).steuersatz * 100);
    console.log('Steuern:', berechneEinkommensteuer2025(meinBrutto*12).steuern / 12);

    return (
      <div className="mx-auto max-w-xl space-y-4 p-4">
        <h1 className="text-2xl font-bold">💸 Abo-Netto-Rechner</h1>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-1">
            <Label>Kundenanzahl:</Label>
            <Input
              type="number"
              step="1"
              value={kunden}
              onChange={(e) => setKunden(+e.target.value)}
            />
          </div>
          <div className="col-span-1">
            <Label>Bruttopreis (€):</Label>
            <Input
              type="number"
              step="0.01"
              value={preisBrutto}
              onChange={(e) => setPreisBrutto(+e.target.value)}
            />
          </div>
          <div className="col-span-1">
            <Label>MWSt (%)</Label>
            <Input
              type="number"
              value={mwst}
              onChange={(e) => setMwst(+e.target.value)}
              disabled
            />
          </div>
          <div className="col-span-1">
            <Label>Digistore %:</Label>
            <Input
              type="number"
              step="0.1"
              value={digistoreFee}
              onChange={(e) => setDigistoreFee(+e.target.value)}
              disabled
            />
          </div>
          <div className="col-span-1">
            <Label>Digistore Fix (€):</Label>
            <Input
              type="number"
              step="0.01"
              value={digistoreFix}
              onChange={(e) => setDigistoreFix(+e.target.value)}
              disabled
            />
          </div>
          <div className="col-span-1">
            <Label>Mein Anteil (%):</Label>
            <Input
              type="number"
              value={splitIch}
              onChange={(e) => setSplitIch(+e.target.value)}
            />
          </div>
        </div>
        <div className="mt-6 space-y-2 rounded-xl bg-background p-4">
          <p>
            ➡️ <strong>Erlös pro Kunde (nach Digistore):</strong>{" "}
            {erloesProKunde.toFixed(2)} €
          </p>
          <p>
            ➡️ <strong>Gesamterlös (nach Digistore mit MWSt.):</strong>{" "}
            {gesamtErloesBrutto.toFixed(2)} €
          </p>
          <p>
            ➡️ <strong>Gesamterlös (nach Digistore ohne MWSt.):</strong>{" "}
            {gesamtErloesNetto.toFixed(2)} €
          </p>
          <p>
            ➡️ <strong>Dein Brutto-Anteil (60 %):</strong>{" "}
            {meinBrutto.toFixed(2)} €
          </p>
          <p>
            ➡️ <strong>Dein Netto (nach Steuern):</strong>{" "}
            <span className="font-semibold text-green-600">
              {meinNetto.toFixed(2)} €
            </span>
          </p>
        </div>
      </div>
    );
}

const berechneNettoAusBrutto = (bruttoWert: number) => {
  // Sehr grobe Näherung nach deutschem Steuerrecht (Single, gesetzlich versichert, Kirchensteuer):
  let steuersatz = 0;
  if (bruttoWert < 11000) steuersatz = 0.1;
  else if (bruttoWert < 25000) steuersatz = 0.2;
  else if (bruttoWert < 45000) steuersatz = 0.3;
  else if (bruttoWert < 80000) steuersatz = 0.36;
  else steuersatz = 0.42;
  return bruttoWert * (1 - steuersatz);
};

const berechneEinkommensteuer2025 = (zvE: number) => {
  let ESt = 0;

  if (zvE <= 11604) {
    ESt = 0;
  } else if (zvE <= 17005) {
    const y = (zvE - 11604) / 10000;
    ESt = (922.98 * y + 1400) * y;
  } else if (zvE <= 66760) {
    const z = (zvE - 17005) / 10000;
    ESt = (181.19 * z + 2397) * z;
  } else if (zvE <= 277825) {
    ESt = 0.42 * zvE - 10602.13;
  } else {
    ESt = 0.45 * zvE - 18936.88;
  }

  return {
    steuern: ESt,
    steuersatz: ESt / zvE,
    netto: zvE - ESt,
  };
};