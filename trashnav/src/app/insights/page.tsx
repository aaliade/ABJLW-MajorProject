import { options } from "../api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth/next";
import UserCard from "../components/UserCard";
import ChartComp from "../components/ChartComp";
import PieGar from "../components/Pie";
import { redirect } from "next/navigation";
import { Footer2 } from "@/components/ui/Footer2";

export default async function Insights() {
  const session = await getServerSession(options);

  if (!session) {
    redirect("/api/auth/signin?callbackUrl=/report");
  }

  return (
    <div className="flex flex-col min-h-screen">
      
      <ChartComp />
      <PieGar />
      <Footer2 />
    </div>
  );
}
