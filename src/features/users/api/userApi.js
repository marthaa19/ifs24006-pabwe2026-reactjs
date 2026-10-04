import apiHelper from "../../../helpers/apiHelper";

const userApi = {
  getUsers: () => apiHelper.get("/users"),

  getUserById: (id) => apiHelper.get(`/users/${id}`),

  getProfile: () => apiHelper.get("/users/me"),

  putProfile: (name, email) => apiHelper.put("/users/me", { name, email }),

  postProfilePhoto: (file) => {
    const formData = new FormData();
    formData.append("photo", file); 
    return apiHelper.post("/users/me/photo", formData);
  },

    putProfilePassword: (password, newPassword) =>
    apiHelper.put("/users/password", {
      password,
      new_password: newPassword,
      new_password_confirmation: newPassword,
    }),
};

export default userApi;