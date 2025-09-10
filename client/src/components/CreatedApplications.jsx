import { getApplications } from "@/api/apiApplications";
import useFetch from "@/hooks/useFetch";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import ApplicationCard from "./ApplicationCard";
import { BarLoader } from "react-spinners";

const CreatedApplications = () => {
  const { isLoaded } = useAuth();

  const {
    loading: loadingApplications,
    fn: fnApplications,
    data: applications,
  } = useFetch(getApplications);

  useEffect(() => {
    if (isLoaded) {
      fnApplications();
    }
  }, [isLoaded]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!isLoaded || loadingApplications) {
    return <BarLoader className="mb-4" width={"100%"} color="#36d7b7" />;
  }
  return (
    <div className="flex flex-col gap-2">
      {applications?.map((application) => {
        return <ApplicationCard key={application._id} application={application} isCandidate />;
      })}
    </div>
  );
};

export default CreatedApplications;
