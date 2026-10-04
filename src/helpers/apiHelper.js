const ACCESS_TOKEN_KEY = "accessToken";

function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

function putAccessToken(token) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

function removeAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

function buildUrl(path, params = {}) {
  const url = new URL(`${DELCOM_BASEURL}${path}`);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.append(key, value);
    }
  });

  return url.toString();
}

async function request(path, { method = "GET", params, body } = {}) {
  const headers = { Accept: "application/json" };
  const token = getAccessToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let requestBody;

  if (body instanceof FormData) {
    requestBody = body;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    requestBody = JSON.stringify(body);
  }

  const response = await fetch(buildUrl(path, params), {
    method,
    headers,
    body: requestBody,
  });

  const responseJson = await response.json();

  if (responseJson.status !== "success") {
    throw new Error(responseJson.message);
  }

  return responseJson;
}

const apiHelper = {
  getAccessToken,
  putAccessToken,
  removeAccessToken,
  request,
  get: (path, params) => request(path, { method: "GET", params }),
  post: (path, body) => request(path, { method: "POST", body }),
  put: (path, body) => request(path, { method: "PUT", body }),
  delete: (path) => request(path, { method: "DELETE" }),
};

export default apiHelper;