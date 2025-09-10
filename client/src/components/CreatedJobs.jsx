import useFetch from "@/hooks/useFetch";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import JobCard from "./JobCard";
import { BarLoader } from "react-spinners";
import { getMyJobs } from "@/api/apiJobs";

const CreatedJobs = () => {
  const { isLoaded } = useAuth();
  const {
    loading: loadingCreatedJobs,
    fn: fnCreatedJobs,
    data: createdJobs,
  } = useFetch(getMyJobs);

  useEffect(() => {
    if (isLoaded) {
      fnCreatedJobs();
    }
  }, [isLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      {loadingCreatedJobs ? (
        <BarLoader className="mt-4" width={"100%"} color="#36d7b7" />
      ) : (
        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {createdJobs?.length ? (
            createdJobs.map((job) => {
              return <JobCard key={job._id} job={job} onJobAction={fnCreatedJobs} isMyJob />;
            })
          ) : (
            <div>No Jobs Found 😢</div>
          )}
        </div>
      )}
    </div>
  );
};

export default CreatedJobs;
