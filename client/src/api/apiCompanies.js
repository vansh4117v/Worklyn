import api from "./axios";

export async function getCompanies() {
	const response = await api.get("/companies");
	return response.data;
}

export async function addNewCompany(_, companyData) {
	const formData = new FormData();
	formData.append("name", companyData.name);
	formData.append("logo", companyData.logo);
	const response = await api.post("/companies", formData );
	return response.data;

}
