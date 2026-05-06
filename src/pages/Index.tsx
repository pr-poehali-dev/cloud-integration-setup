import { useEffect, useState } from "react"
import Typewriter from "typewriter-effect"
import { FeatureCards } from "@/components/FeatureCards"
import FlickeringGrid from "@/components/FlickeringGrid"

export default function Index() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory">
      <main className="min-h-screen w-full bg-black text-white relative">
        <section className="h-screen flex items-center justify-center relative overflow-hidden snap-start">
          <FlickeringGrid
            className="absolute inset-0 z-0"
            color="rgb(255, 255, 255)"
            maxOpacity={0.1}
            squareSize={3}
            gridGap={5}
            flickerChance={0.2}
          />
          <div className="max-w-6xl mx-auto text-center relative z-10">
            <div className="relative">
              <div className="inline-block">
                <h1 className="relative text-5xl md:text-7xl font-medium mb-8 tracking-tight text-white text-glow">
                  {mounted && (
                    <Typewriter
                      options={{
                        strings: ["Neon Pulse AI"],
                        autoStart: true,
                        loop: false,
                        cursor: "",
                        wrapperClassName: "text-white",
                        deleteSpeed: 9999999,
                        delay: 50,
                      }}
                    />
                  )}
                </h1>
                <p className="mt-6 text-lg md:text-xl text-gray-400 max-w-3xl mx-auto font-light">
                  Интеллектуальная автоматизация для бизнеса будущего.
                </p>
              </div>
            </div>
          </div>
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce z-10">
            <button
              onClick={() => {
                document.querySelector(".snap-y")?.scrollTo({
                  top: window.innerHeight,
                  behavior: "smooth",
                })
              }}
              aria-label="Перейти к возможностям"
              className="bg-gray-800 hover:bg-gray-700 transition-all duration-300 rounded-lg p-2"
            >
              <svg
                className="w-6 h-6 text-gray-400"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
              </svg>
            </button>
          </div>
        </section>

        <section className="min-h-screen py-20 px-4 md:px-6 snap-start bg-black">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12 text-center">
              <h2 className="text-2xl md:text-3xl text-white font-mono">Наши решения</h2>
              <div className="mt-2 w-20 h-px mx-auto bg-gradient-to-r from-transparent via-gray-800 to-transparent" />
            </div>
            <FeatureCards />
          </div>
        </section>
      </main>
    </div>
  )
}
