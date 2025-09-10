import { getSavedJobs } from "@/api/apiJobs";
import JobCard from "@/components/JobCard";
import useFetch from "@/hooks/useFetch";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { BarLoader } from "react-spinners";

const SavedJobs = () => {
  const { isLoaded } = useAuth();
  const { loading: loadingSavedJobs, fn: fnSavedJobs, data: savedJobs } = useFetch(getSavedJobs);

  useEffect(() => {
    if (isLoaded) {
      fnSavedJobs();
    }
  }, [isLoaded]);

  if (!isLoaded) {
    return <BarLoader className="mb-4" width={"100%"} color="#36d7b7" />;
  }

  return (
    <div>
      <h1 className="gradient-title font-extrabold text-5xl sm:text-6xl text-center pb-8">
        Saved Jobs
      </h1>
      {loadingSavedJobs === false && (
        <div className="mt-4 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedJobs?.length ? (
            savedJobs.map((saved) => {
              return (
                <JobCard key={saved._id} job={saved.job} savedInit={true} onJobSaved={fnSavedJobs} />
              );
            })
          ) : (
            <div>No Saved Jobs Found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SavedJobs;
