import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { State } from "country-state-city";
import { Textarea } from "@/components/ui/textarea";
import useFetch from "@/hooks/useFetch";
import { getCompanies } from "@/api/apiCompanies";
import { useAuth } from "@/hooks/useAuth";
import { BarLoader } from "react-spinners";
import { Navigate, useNavigate } from "react-router-dom";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import { addNewJob } from "@/api/apiJobs";
import AddCompanyDrawer from "@/components/AddCompanyDrawer";

const schema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  location: z.string().min(1, { message: "Select a location" }),
  company_id: z.string().min(1, { message: "Select or Add a new Company" }),
  requirements: z.string().min(1, { message: "Requirements is required" }),
});

const PostJobs = () => {
  const { isLoaded, user } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      location: "",
      company_id: "",
      requirements: "",
    },
    resolver: zodResolver(schema),
  });

  const {
    loading: loadingCreateJob,
    fn: fnCreateJob,
    error: errorCreateJob,
    data: dataCreateJob,
  } = useFetch(addNewJob);

  const onSubmit = (data) => {
    fnCreateJob({
      ...data,
      recruiter_id: user._id,
      isOpen: true,
    });
  };

  const { fn: fnCompanies, data: companies, loading: loadingCompanies } = useFetch(getCompanies);
  useEffect(() => {
    if (isLoaded) fnCompanies();
  }, [isLoaded]);

  useEffect(() => {
    // Job creation result
    if (dataCreateJob && !loadingCreateJob) {
      navigate("/jobs");
    }
  }, [loadingCreateJob, dataCreateJob, navigate]);

  if (!isLoaded || loadingCompanies) {
    return <BarLoader className="mb-4" width={"100%"} color="#36d7b7" />;
  }

  if (user?.role !== "recruiter") {
    return <Navigate to="/jobs" />;
  }

  return (
    <div>
      <h1 className="gradient-title font-extrabold text-5xl sm:text-7xl text-center pb-8">
        Post a Job
      </h1>

      <form className="flex flex-col gap-4 p-4 pb-0" onSubmit={handleSubmit(onSubmit)}>
        <Input placeholder="Job Title" {...register("title")} />
        {errors.title && <p className="text-red-500">{errors.title.message}</p>}

        <Textarea placeholder="Job Description" {...register("description")} />
        {errors.description && <p className="text-red-500">{errors.description.message}</p>}

        <div className="flex gap-4 items-center">
          <Controller
            name="location"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="!w-full">
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
            )}
          />

          <Controller
            name="company_id"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="!w-full">
                  <SelectValue placeholder="Select a Company">
                    {field.value ? companies?.find((c) => c._id === field.value)?.name : "Company"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {companies?.map(({ name, _id }) => (
                      <SelectItem value={_id} key={_id}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
          <AddCompanyDrawer fetchCompanies={fnCompanies} />
        </div>
        {errors.location && <p className="text-red-500">{errors.location.message}</p>}
        {errors.company_id && <p className="text-red-500">{errors.company_id.message}</p>}
        <Controller
          name="requirements"
          control={control}
          render={({ field }) => <MDEditor value={field.value} onChange={field.onChange} />}
        />
        {errors.requirements && <p className="text-red-500">{errors.requirements.message}</p>}
        {errorCreateJob?.message && <p className="text-red-500">{errorCreateJob?.message}</p>}
        {loadingCreateJob && <BarLoader width={"100%"} color="#36d7b7" />}
        <Button type="submit" variant="blue" size="lg" className="mt-2">
          Submit
        </Button>
      </form>
    </div>
  );
};

export default PostJobs;
