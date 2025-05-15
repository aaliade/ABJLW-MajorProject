import { options } from "../api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth/next";
import UserCard from "../components/UserCard";
import { redirect } from "next/navigation";
import Camera from "@/app/components/camera";
import { Footer2 } from "@/components/ui/Footer2";

export default async function ReportPage() {
  const session = await getServerSession(options);

  if (!session) {
    redirect("/api/auth/signin?callbackUrl=/report");
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Main Content */}
      <section className="flex flex-col lg:flex-row gap-6 mt-10 w-full px-0 flex-grow]">
        {/* UserCard Section */}
        <div className="lg:w-2/6 lg:pr-114 flex flex-col justify-center items-center">
          <UserCard user={session?.user} pagetype={"Server"} /> 
          <p className="text-base text-muted-foreground md:text-lg lg:text-xl mt-8 text-center">
            Let’s clean up your space! Snap a quick photo of your garbage to help us plan the best pickup route.
          </p>
        </div>

        {/* Camera Section */}
        <div className="lg:w-4/6 lg:pl-4">
          <Camera />
        </div>
      </section>

      {/* Footer Section */}
      <Footer2 />
    </div>
  );
}
