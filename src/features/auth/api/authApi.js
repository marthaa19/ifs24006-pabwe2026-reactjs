import apiHelper from "../../../helpers/apiHelper";

const authApi = {
  postLogin: (email, password) =>
    apiHelper.post("/auth/login", { email, password }),

  postRegister: (name, email, password) =>
    apiHelper.post("/auth/register", { name, email, password }),
};

export default authApi;