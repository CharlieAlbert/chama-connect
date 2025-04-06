import type React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BarChart3,
  FileText,
  ShieldCheck,
  CreditCard,
  Gift,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-emerald-100 bg-emerald-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-emerald-600">
                Chama Connect
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/login"
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Member Login
              </Link>
              <Link href="/auth/signup">
                <Button size="sm" className="bg-emerald-500">
                  Register
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-emerald-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
                Welcome to Chama Connect
              </h1>
              <p className="text-xl text-gray-600">
                Our custom platform designed to streamline our group's
                operations, from financial tracking to meeting minutes, loan
                processing, monthly ruffles, and governance.
              </p>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
                <Link href="/auth/login">
                  <Button size="lg" className="w-full sm:w-auto bg-emerald-500">
                    Member Login <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto bg-white text-black border border-emerald-100"
                  >
                    New Member Registration
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative w-full max-w-md h-[400px]">
                <Image
                  src="/chama-landing.jpg?height=400&width=400"
                  alt="Chama Connect group members"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-white" id="features">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Our Group Management Tools
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Designed specifically for Chama Connect members to manage our
              operations efficiently and transparently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<BarChart3 className="h-10 w-10 text-emerald-600" />}
              title="Financial Tracking"
              description="Monitor contributions, track expenses, and view financial reports in real-time. Stay updated on our group's financial health."
            />
            <FeatureCard
              icon={<FileText className="h-10 w-10 text-emerald-600" />}
              title="Meeting Records"
              description="Access all meeting minutes, decisions, and action items in one place. Never miss important information from our gatherings."
            />
            <FeatureCard
              icon={<ShieldCheck className="h-10 w-10 text-emerald-600" />}
              title="Group Governance"
              description="Transparent voting, role management, and decision tracking to ensure our group operates with clear accountability."
            />
            <FeatureCard
              icon={<CreditCard className="h-10 w-10 text-emerald-600" />}
              title="Loan Processing"
              description="Apply for loans, track approval status, and manage repayments all in one place. Simplified lending within our community."
            />
            <FeatureCard
              icon={<Gift className="h-10 w-10 text-emerald-600" />}
              title="Monthly Ruffle System"
              description="Participate in our transparent monthly ruffle for fund distribution. Fair, random selection with automatic notifications."
            />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-emerald-50 py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              About Chama Connect
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700 text-lg space-y-4">
              <p>
                Chama Connect was established in 2022 as a community investment
                group focused on mutual growth and support. Our members come
                together to pool resources, share knowledge, and create
                opportunities for financial advancement.
              </p>
              <p>
                This platform was developed to address our specific needs for
                transparency, accountability, and efficient management of our
                group activities. As we continue to grow, this digital solution
                helps us maintain the strong foundation of trust and
                collaboration that defines our community.
              </p>
              <p>
                Members can use this platform to stay updated on group
                activities, track their contributions, participate in
                decision-making processes, and access important documents and
                records.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Member Access Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-emerald-600 rounded-xl p-8 md:p-12 shadow-xl">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Member Access
              </h2>
              <p className="text-xl text-emerald-100 mb-8">
                This platform is exclusively for Chama Connect members. Log in
                to access your account or register if you're a new member.
              </p>
              <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Link href="/auth/login">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="w-full sm:w-auto bg-white text-black border-emerald-100"
                  >
                    Member Login
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto bg-transparent text-white border-white hover:bg-emerald-700"
                  >
                    New Member Registration
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Upcoming Group Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <EventCard
              date="May 15, 2025"
              title="Quarterly Financial Review"
              description="Review of Q1 performance and investment opportunities discussion."
              location="Main Conference Room"
            />
            <EventCard
              date="June 5, 2025"
              title="Annual General Meeting"
              description="Election of new officials and annual planning session."
              location="Community Center"
            />
            <EventCard
              date="July 10, 2025"
              title="Investment Workshop"
              description="Guest speaker on real estate investment strategies."
              location="Virtual Meeting"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t mt-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-xl font-bold text-emerald-600">
                Chama Connect
              </span>
              <p className="text-gray-600 mt-2">Growing together since 2022</p>
            </div>
            <div className="flex space-x-6">
              <Link href="/about" className="text-gray-600 hover:text-gray-900">
                About Us
              </Link>
              <Link
                href="/bylaws"
                className="text-gray-600 hover:text-gray-900"
              >
                Group Bylaws
              </Link>
              <Link href="/faq" className="text-gray-600 hover:text-gray-900">
                FAQ
              </Link>
              <Link
                href="/contact"
                className="text-gray-600 hover:text-gray-900"
              >
                Contact
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Chama Connect. All rights
            reserved. For members only.
          </div>
        </div>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

interface EventCardProps {
  date: string;
  title: string;
  description: string;
  location: string;
}

function EventCard({ date, title, description, location }: EventCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="text-emerald-600 font-medium mb-2">{date}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <div className="flex items-center text-gray-500 text-sm">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        {location}
      </div>
    </div>
  );
}
