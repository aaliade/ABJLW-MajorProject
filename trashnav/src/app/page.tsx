import { options } from "./api/auth/[...nextauth]/options"
import { getServerSession } from "next-auth/next"
import UserCard from "./components/UserCard"
import ImageSlider from "./components/ImageSlider"
import { Button } from "@/components/ui/button"
import { Hero47 } from "@/components/ui/Hero47"
import { Banner } from "@/components/ui/FeatureHighlights";
import { Footer2 } from "@/components/ui/Footer2"

export default async function Home() {
  const session = await getServerSession(options)

  return (
    <main className="container mx-auto px-4 pt-8 pb-8 flex flex-col gap-8">
      <Hero47/>
      <Banner /> {/* Add the Banner component here */}
      <Footer2 />
        
     
    </main>
  )
}
