import apiHelper from "../../../helpers/apiHelper";

const lostFoundApi = {
  getLostFounds: (params) => apiHelper.get("/lost-founds", params),

  getLostFoundById: (id) => apiHelper.get(`/lost-founds/${id}`),

  postLostFound: (title, description, status) =>
    apiHelper.post("/lost-founds", { title, description, status }),

  putLostFound: (id, title, description, status, isCompleted) =>
    apiHelper.put(`/lost-founds/${id}`, {
      title,
      description,
      status,
      is_completed: isCompleted ? 1 : 0,
    }),

  postLostFoundCover: (id, file) => {
    const formData = new FormData();
    formData.append("cover", file);
    return apiHelper.post(`/lost-founds/${id}/cover`, formData);
  },

  deleteLostFound: (id) => apiHelper.delete(`/lost-founds/${id}`),

  getStatsDaily: (params) =>
    apiHelper.get("/lost-founds/stats/daily", params),

  getStatsMonthly: (params) =>
    apiHelper.get("/lost-founds/stats/monthly", params),
};

export default lostFoundApi;