export const getToken = () =>
    localStorage.getItem("artarena_token");
  
  export const setToken = (token) =>
    localStorage.setItem("artarena_token", token);
  
  export const clearToken = () =>
    localStorage.removeItem("artarena_token");
  