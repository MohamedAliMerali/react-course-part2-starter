import { useQuery } from "@tanstack/react-query";
import todoService, { Todo } from "../services/todoService";
import { CACHE_KEY_TODOS } from "../constants";

const useTodos = () => {
  return useQuery<Todo[], Error>({
    // anytime query changes, rq will fetch the data from the backend
    queryKey: CACHE_KEY_TODOS,
    queryFn: todoService.getAll,
    staleTime: 100 * 1000,
    keepPreviousData: true,
  });
};

export default useTodos;
