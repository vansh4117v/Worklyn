import CreatedApplications from '@/components/CreatedApplications';
import CreatedJobs from '@/components/CreatedJobs';
import { useAuth } from '@/hooks/useAuth';
import { BarLoader } from 'react-spinners';

const MyJobs = () => {
  const { isLoaded, user } = useAuth();

  if (!isLoaded) {
    return <BarLoader className="mb-4" width={"100%"} color="#36d7b7" />;
  }

  return (
    <div>
      <h1 className="gradient-title font-extrabold text-5xl md:text-7xl text-center pb-8">
        {user?.role==="candidate" ? "My Applications" : "My Jobs"}
      </h1>

      {user?.role==="candidate" ? <CreatedApplications /> : <CreatedJobs />}
    </div>
  )
}

export default MyJobs