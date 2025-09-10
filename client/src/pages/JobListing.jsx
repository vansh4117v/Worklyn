import { getCompanies } from "@/api/apiCompanies";
import { getJobs } from "@/api/apiJobs";
import JobCard from "@/components/JobCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useFetch from "@/hooks/useFetch";
import { useAuth } from "@/hooks/useAuth";
import { State } from "country-state-city";
import React, { useEffect, useState } from "react";
import { BarLoader } from "react-spinners";

const JobListing = () => {
  const { isLoaded } = useAuth();
  const [location, setLocation] = useState("");
  const [company_id, setCompanyId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const {
    fn: fnJobs,
    data: jobs,
    fullResponse: jobsResponse,
    loading: loadingJobs,
  } = useFetch(getJobs, { location, company_id, searchQuery, page, limit: 20 });

  const pagination = jobsResponse?.pagination || {};

  const { fn: fnCompanies, data: companies } = useFetch(getCompanies);
  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const query = formData.get("search-query");
    setSearchQuery(query);
  };

  const clearFilters = () => {
    setLocation("");
    setCompanyId("");
    setSearchQuery("");
  };

  useEffect(() => {
    if (isLoaded) fnJobs();
  }, [isLoaded, location, company_id, searchQuery, page]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset to page 1 when filters change
  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
  }, [location, company_id, searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isLoaded) fnCompanies();
  }, [isLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isLoaded) {
    return <BarLoader className="mb-4" width={"100%"} color="#36d7b7" />;
  }

  return (
    <div>
      <h1 className="gradient-title font-extrabold text-5xl sm:font-6xl text-center pb-8">
        Latest Jobs
      </h1>

      <form onSubmit={handleSearch} className="h14 flex w-full gap-2 items-center mb-3">
        <Input
          type="text"
          placeholder="Search Jobs by Title.."
          name="search-query"
          className="h-full flex-1 py-3 px-4 text-md"
        />
        <Button type="submit" className="h-full sm:w-28" variant="blue">
          Search
        </Button>
      </form>

      <div className="flex flex-col sm:flex-row gap-2">
        <Select value={location} onValueChange={(value) => setLocation(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {State.getStatesOfCountry("IN").map(({ name }) => (
                <SelectItem value={name} key={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select value={company_id} onValueChange={(value) => setCompanyId(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a Company" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {companies?.map(({ name, _id }) => (
                <SelectItem value={_id} key={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Button variant="destructive" className="sm:w-1/2" onClick={clearFilters}>
          Clear Filters
        </Button>
      </div>

      {loadingJobs && (
        <div className="flex flex-col items-center gap-2 mb-4">
          <BarLoader width={"100%"} color="#36d7b7" />
          <span className="text-sm text-gray-500">
            Loading jobs{page > 1 ? ` (Page ${page})` : ''}...
          </span>
        </div>
      )}

      {loadingJobs === false && (
        <div className="mt-4 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs?.length ? (
            jobs.map((job) => {
              // Check if job is saved by current user
              return <JobCard key={job._id} job={job} savedInit={job?.saved?.length > 0} />;
            })
          ) : (
            <div>No Jobs Found</div>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setPage(page - 1)}
            disabled={!pagination.hasPrev || loadingJobs}
          >
            Previous
          </Button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <span className="text-sm text-gray-500">
              ({pagination.totalJobs} jobs total)
            </span>
          </div>

          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={!pagination.hasNext || loadingJobs}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default JobListing;
