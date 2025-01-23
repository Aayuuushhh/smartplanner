"use client"
import { CustomButton } from '@/components/button';
import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import { link } from 'fs';

import { Calendar, Clock, Users } from 'lucide-react'
import Image from "next/image"
import Link from "next/link"
import { useRouter } from 'next/navigation';

const AbstractBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <svg
      className="absolute w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <path
        d="M0,0 L100,0 L100,100 L0,100 Z"
        fill="none"
        stroke="rgba(99, 102, 241, 0.1)"
        strokeWidth="0.5"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M0,50 Q25,0 50,50 T100,50"
        fill="none"
        stroke="rgba(99, 102, 241, 0.05)"
        strokeWidth="0.5"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M0,30 Q35,90 70,30 T100,30"
        fill="none"
        stroke="rgba(99, 102, 241, 0.05)"
        strokeWidth="0.5"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M0,70 Q35,10 70,70 T100,70"
        fill="none"
        stroke="rgba(99, 102, 241, 0.05)"
        strokeWidth="0.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  </div>
)

export default function LandingPage() {
  const router = useRouter() 
  return (
    <div className="flex flex-col min-h-screen relative">
      <AbstractBackground />
      <header className="px-4 lg:px-6 h-14 flex items-center relative z-10">
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
            Features
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
            Pricing
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
            About
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
            Contact
          </Link>
          <CustomButton variant="link" className='border-black rounded-md text-sm bg-black text-white' onClick={ () => router.push("/login")}>Login</CustomButton>  
        </nav>
      </header>
      <main className="flex-1 relative z-10">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Smart Planner: Your Life, Organized
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Effortlessly manage your schedule, boost productivity, and achieve your goals with our smart calendar app.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/dashboard" className="inline-flex items-center justify-center border-black- rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4">
                  <CustomButton variant="outline">Go to Dashboard</CustomButton>
                </Link>
                <Link href="#" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4">
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 relative">
          <AbstractBackground />
          <div className="container px-4 md:px-6 mx-auto relative z-10">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">Key Features</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
              {[
                { icon: Calendar, title: "Smart Scheduling", description: "Scheduling that adapts to your preferences" },
                { icon: Clock, title: "Time Tracking", description: "Effortlessly track time spent on tasks" },
                { icon: Users, title: "Collaboration", description: "Seamlessly share and coordinate schedules with your team" },
              ].map((feature, index) => (
                <div key={index} className="flex flex-col items-center space-y-2 border-gray-800 p-4 rounded-lg bg-white shadow-md">
                  <feature.icon className="h-12 w-12 mb-4 text-primary" />
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 relative">
          <AbstractBackground />
          <div className="container px-4 md:px-6 mx-auto relative z-10">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">What Our Users Say</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
              {[
                { name: "Alex Johnson", role: "Entrepreneur", quote: "Smart Planner has revolutionized how I manage my time. It's like having a personal assistant!" },
                { name: "Sarah Lee", role: "Project Manager", quote: "The collaboration features are a game-changer for my team. We're more synchronized than ever." },
                { name: "Michael Chen", role: "Freelancer", quote: "As a freelancer, the productivity insights have helped me optimize my work hours and increase my earnings." },
              ].map((testimonial, index) => (
                <div key={index} className="flex flex-col items-center space-y-2 border-gray-800 p-6 rounded-lg bg-white shadow-md">
                  <Image
                    src={`/placeholder.svg?height=64&width=64`}
                    alt={testimonial.name}
                    width={64}
                    height={64}
                    className="rounded-full"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">&quot;{testimonial.quote}&quot;</p>
                  <p className="text-sm font-bold">{testimonial.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t relative z-10">
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2024 Smart Planner. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}