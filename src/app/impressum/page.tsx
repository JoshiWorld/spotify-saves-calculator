export default function Impressum() {
    return (
      <div>
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Impressum
        </h1>
        <p className="leading-7 [&:not(:first-child)]:mt-6">
          Joshua Stieber
          <br />
          Auf der Geest 4
          <br />
          30826 Garbsen
          <br />
          Deutschland
        </p>
        <br />
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
          Kontakt
        </h2>
        <p className="leading-7 [&:not(:first-child)]:mt-6">
          Telefon: +49 171 1642054
          <br />
          E-Mail: contact@brokoly.de
        </p>
      </div>
    );
}