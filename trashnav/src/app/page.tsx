import { options } from "./api/auth/[...nextauth]/options"
import { getServerSession } from "next-auth/next"
import UserCard from "./components/UserCard"
import ImageSlider from "./components/ImageSlider"

export default async function Home() {
  const session = await getServerSession(options)

  return (
    <main className="container mx-auto px-4 pt-8 pb-8">
      <ImageSlider />
      
      {session && (
        <div className="mt-8">
          <UserCard user={session?.user} pagetype={"Home"} />
        </div>
      )}
    </main>
  )
}
