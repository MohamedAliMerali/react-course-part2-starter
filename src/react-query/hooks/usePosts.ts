import axios from "axios";
import { useInfiniteQuery } from "@tanstack/react-query";

export interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

interface PostQuery {
  pageSize: number;
}

const usePosts = (query: PostQuery) => {
  // as a best practise we initialize that to one so we get the data to our first page
  const fetchPosts = ({ pageParam = 1 }) => {
    return axios
      .get<Post[]>("https://jsonplaceholder.typicode.com/posts", {
        params: {
          _start: (pageParam - 1) * query.pageSize,
          _limit: query.pageSize,
        },
      })
      .then((res) => res.data);
  };

  return useInfiniteQuery<Post[], Error>({
    // anytime query changes, rq will fetch the data from the backend
    queryKey: ["posts", query],
    queryFn: fetchPosts,
    staleTime: 1 * 60 * 1000, // 1m
    keepPreviousData: true,
    getNextPageParam: (lastPage, allPages) => {
      // 1 -> 2
      return lastPage.length > 0 ? allPages.length + 1 : undefined;
      // PS: with JSON placeholder, if we ask data for a page that doesn't exist, we get an empty array.
      // undefined: will indicate that you reached the end of the list
    },
  });
};

export default usePosts;
