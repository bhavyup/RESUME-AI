"use client"
import { useRef, useState, useEffect } from "react"
import { Play, Maximize2 } from "lucide-react"

export function VideoShowcase() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (!document.fullscreenElement) {
        videoRef.current.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`)
        })
      } else {
        document.exitFullscreen()
      }
    }
  }

  useEffect(() => {
    const handleVideoEnd = () => {
      setIsPlaying(false)
    }
    
    const video = videoRef.current
    if (video) {
      video.addEventListener('ended', handleVideoEnd)
    }
    
    return () => {
      if (video) {
        video.removeEventListener('ended', handleVideoEnd)
      }
    }
  }, [])

  return (
    <section className="py-16 md:py-24 px-4 relative overflow-hidden bg-slate-950" id="how-it-works">

      <div className="absolute -top-0 left-52 w-96 h-96 rounded-full bg-gradient-to-br from-teal-500/20 to-cyan-500/20 blur-3xl"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 blur-3xl"></div>
      <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-gradient-to-r from-cyan-500/15 to-emerald-500/15 blur-3xl"></div>
      
      <div className="container mx-auto max-w-6xl">

        
        {/* Section header - Dark */}
        <div className="text-center mb-12 relative z-10">
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-emerald-500/15 to-teal-500/15 blur-3xl -z-10"></div>
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-gradient-to-br from-cyan-500/20 to-teal-500/20 blur-3xl -z-10"></div>
        <div className="absolute -bottom-[500px] -left-36 w-72 h-72 rounded-full bg-gradient-to-tr from-teal-500/20 to-emerald-500/20 blur-3xl -z-10"></div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            See ResumeAI in Action
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Experience how our intelligent platform transforms your resume instantly
          </p>
        </div>
        
        {/* Video container - Dark glassmorphism */}
        <div className="relative mx-auto group">
          <div className="relative rounded-2xl bg-slate-900/50 border border-slate-700/50 backdrop-blur-xl shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-emerald-500/10 z-10">
            <div 
              className="relative aspect-video w-full cursor-pointer" 
              onClick={togglePlay}
            >
              <video 
                ref={videoRef}
                className="w-full h-full object-cover rounded-2xl"
                src="/ResumeLM.mp4"
                poster="/thumbnail.png"
                onEnded={() => setIsPlaying(false)}
              />
              
              {!isPlaying && (
                <div className="absolute inset-0 bg-black/30 pointer-events-none"></div>
              )}
              
              {!isPlaying && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay();
                  }}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-emerald-500/50 z-20"
                  aria-label="Play video"
                >
                  <Play className="w-8 h-8 ml-1" />
                </button>
              )}
              
              <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                <div className="text-sm bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30 backdrop-blur-sm">
                  ResumeAI Demo
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFullscreen();
                  }}
                  className="text-white bg-black/40 p-2 rounded-full border border-white/10 transition-all duration-300 hover:bg-black/60 backdrop-blur-sm"
                  aria-label="Toggle fullscreen"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Feature badges - Dark */}
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-sm border border-emerald-500/20 text-emerald-400 backdrop-blur-sm">
              Interactive Demo
            </span>
            <span className="px-3 py-1 rounded-full bg-teal-500/10 text-sm border border-teal-500/20 text-teal-400 backdrop-blur-sm">
              User-friendly Interface
            </span>
            <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-sm border border-cyan-500/20 text-cyan-400 backdrop-blur-sm">
              Real-time AI Assistance
            </span>
          </div>
        </div>
      </div>
    </section>
  )
} 