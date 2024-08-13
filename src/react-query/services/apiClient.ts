import axios from "axios";

// this will return an axios instance
const axiosInstance = axios.create({
  baseURL: "https://jsonplaceholder.typicode.com",
});

class APIClient<T> {
  endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  // using arrow function so we won't lose the *this* context
  // when referencing to this function in our hooks
  getAll = () => {
    debugger; // to debug when it gets to here
    return axiosInstance;
  };

  // post is a generic method that take objects  of type T
  post = (data: T) => {
    return axiosInstance.post<T>(this.endpoint, data).then((res) => res.data);
  };
}

export default APIClient;
