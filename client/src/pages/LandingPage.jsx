import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";
import { Link } from "react-router-dom";
import faqs from "../data/faqs.json";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
import { useAuth } from "@/hooks/useAuth";

const LandingPage = () => {
  const { user } = useAuth();
  return (
    <div className="flex flex-col gap-10 sm:gap-20 py-10 sm:py-20">
      <section className="text-center">
        <h1 className="flex flex-col items-center justify-center gradient-title text-4xl font-extrabold sm:text-6xl lg:text-8xl tracking-tighter py-4">
          Find your Dream Job
          <span className="flex items-center gap-2 sm:gap-6">and get Hired</span>
        </h1>
        <p className="text-gray-300 sm:mt-4 text-xs sm:text-xl">
          Explore thousands of job listings or find the perfect candidate
        </p>
      </section>
      <div className="flex gap-6 justify-center">
        <Link to="/jobs">
          <Button variant="blue" size={window.innerWidth >= 768 ? "xl" : "sxl"}>
            Find Jobs
          </Button>
        </Link>
        {(user?.role === "recruiter" || !user) && (
          <Link to="/post-job">
            <Button variant="destructive" size={window.innerWidth >= 768 ? "xl" : "sxl"}>
              Post a Job
            </Button>
          </Link>
        )}
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="font-bold">For Job Seekers</CardTitle>
          </CardHeader>
          <CardContent>Search and apply for jobs, track applications, and more.</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-bold">For Employers</CardTitle>
          </CardHeader>
          <CardContent>Post jobs, manage applications, and find the best candidates.</CardContent>
        </Card>
      </section>

      <Accordion type="multiple" className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index + 1}`}>
            <AccordionTrigger>{faq.question}</AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default LandingPage;
