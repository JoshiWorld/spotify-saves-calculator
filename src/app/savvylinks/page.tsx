import { Footer } from "../_components/landing/footer";
import { Navbar } from "../_components/landing/navbar";
import { MusicLinkConverter } from "../_components/MusicLinkConverter";

export default function SongLinkPage() {
    // const songLink =
    //   "https://open.spotify.com/intl-de/track/7BYKUw2kzza36vI1QOsC4a?si=1f984812f12746ca";
    // const { data } = api.music.getUniversalLinks.useQuery({ songLink });

    // console.log(data);

    return (
      <>
        <Navbar />
        <main className="dark:bg-neutral-950 bg-white h-screen py-20">
          <MusicLinkConverter />
        </main>
        <Footer />
      </>
    );
}