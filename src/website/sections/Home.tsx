// Home page: its sections, top to bottom.
import type { View } from "../Site";
import Hero from "./home/Hero";
import Services from "./home/Services";
import DayInVillage from "./home/DayInVillage";
import Steps from "./home/Steps";
import Audiences from "./home/Audiences";
import Download from "./home/Download";

export default function Home({ v }: { v: View }) {
  return (
    <>
      <Hero v={v} />
      <Services v={v} />
      <DayInVillage v={v} />
      <Steps v={v} />
      <Audiences v={v} />
      <Download v={v} />
    </>
  );
}
