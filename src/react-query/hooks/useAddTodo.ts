import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CACHE_KEY_TODOS } from "../constants";
import todoService, { Todo } from "../services/todoService";

interface AddTodoContext {
  prvsTodos: Todo[];
}

const useAddTodo = (onAdd: () => void) => {
  const queryClient = useQueryClient();

  // ps: here will get a missleading error on the mutation function
  // the real reason for this error is 'onMutate' function.
  return useMutation<Todo, Error, Todo, AddTodoContext>({
    // PS: AddTodoContext is for the context down below in 'onMutate' func
    mutationFn: todoService.post,

    // onMutate callback is used to create optimistic updates
    onMutate: (newTodo: Todo) => {
      // This func take a parameter called Variables,
      // in react query it refers to the input.
      //
      const prvsTodos = queryClient.getQueryData<Todo[]>(CACHE_KEY_TODOS) || [];
      // we returned empty array in the case of the funct return undefined
      // because the type of 'prvsTodos' can be undefined
      // and this object should be an array of todos since we specified it
      // in the interface above ('AddTodoContext')

      // Here we should update the query cache right away
      // instead of waiting for a response and clear the input
      queryClient.setQueryData<Todo[]>(CACHE_KEY_TODOS, (todos) => [
        newTodo,
        ...(todos || []),
      ]);
      //   if (ref.current) ref.current.value = "";
      onAdd();

      // we return this context object here,
      // and will be able to access it in the onError callback
      // PS: react query still doesn't know type of that context object
      // so when creating the mutation we should provide a generic
      // type argument for our context object the same way we provided
      // the types to the mutation hook, we use an interface and pass it
      // to with the other types
      return { prvsTodos };
      // The error caused in 'mutationFn' was actualy caused here
      // the type here is a Todo array or undefined, but the interface
      // used as a generic type in mutation hook said that the property
      // is a todo array and not undefined.
      //
      // to fix this, where we return the prvsData, if ot's undefined we
      // should return an empty Array
    },
    // moreover, we have to handle the success and the errors scenario
    // if the request is successful, we replace the newTodo with
    // the one we get from the backend (it doesn't have an id)
    onSuccess: (savedTodo, newTodo) => {
      queryClient.setQueryData<Todo[]>(CACHE_KEY_TODOS, (todos) =>
        todos?.map((todo) => (todo === newTodo ? savedTodo : todo))
      );
    },
    // in case of an error, we should restore the UI to the prv state
    // PS: context is an object that we create to pass data in between
    // our callbacks, here we need a context object that includes the
    // prvs todos before we updated the cache, we should create
    // the context and return it in the 'onMutate' callback so we can
    // access to it in the 'onError' callback.
    onError: (error, newTodo, context) => {
      // in this function first we check if context is undefined or falsy
      // otherwise, we should set the query data to the prvs todos
      if (!context) return;

      queryClient.setQueryData(CACHE_KEY_TODOS, context.prvsTodos);
    },
  });
};

export default useAddTodo;

// before using the api client
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import axios from "axios";
// import { Todo } from "./useTodos";
// import { CACHE_KEY_TODOS } from "../constants";

// interface AddTodoContext {
//   prvsTodos: Todo[];
// }

// const useAddTodo = (onAdd: () => void) => {
//   const queryClient = useQueryClient();

//   // ps: here will get a missleading error on the mutation function
//   // the real reason for this error is 'onMutate' function.
//   return useMutation<Todo, Error, Todo, AddTodoContext>({
//     mutationFn: (todo: Todo) =>
//       axios
//         .post<Todo>("https://jsonplaceholder.typicode.com/todos", todo)
//         .then((res) => res.data),
//     // onMutate callback is used to create optimistic updates
//     onMutate: (newTodo: Todo) => {
//       // This func take a parameter called Variables,
//       // in react query it refers to the input.
//       //
//       const prvsTodos = queryClient.getQueryData<Todo[]>(CACHE_KEY_TODOS) || [];
//       // we returned empty array in the case of the funct return undefined
//       // because the type of 'prvsTodos' can be undefined
//       // and this object should be an array of todos since we specified it
//       // in the interface above ('AddTodoContext')

//       // Here we should update the query cache right away
//       // instead of waiting for a response and clear the input
//       queryClient.setQueryData<Todo[]>(CACHE_KEY_TODOS, (todos) => [
//         newTodo,
//         ...(todos || []),
//       ]);
//       //   if (ref.current) ref.current.value = "";
//       onAdd();

//       // we return this context object here,
//       // and will be able to access it in the onError callback
//       // PS: react query still doesn't know type of that context object
//       // so when creating the mutation we should provide a generic
//       // type argument for our context object the same way we provided
//       // the types to the mutation hook, we use an interface and pass it
//       // to with the other types
//       return { prvsTodos };
//       // The error caused in 'mutationFn' was actualy caused here
//       // the type here is a Todo array or undefined, but the interface
//       // used as a generic type in mutation hook said that the property
//       // is a todo array and not undefined.
//       //
//       // to fix this, where we return the prvsData, if ot's undefined we
//       // should return an empty Array
//     },
//     // moreover, we have to handle the success and the errors scenario
//     // if the request is successful, we replace the newTodo with
//     // the one we get from the backend (it doesn't have an id)
//     onSuccess: (savedTodo, newTodo) => {
//       queryClient.setQueryData<Todo[]>(CACHE_KEY_TODOS, (todos) =>
//         todos?.map((todo) => (todo === newTodo ? savedTodo : todo))
//       );
//     },
//     // in case of an error, we should restore the UI to the prv state
//     // PS: context is an pbject that we create to pass data in between
//     // our callbacks, here we need a context object that includes the
//     // prvs todos before we updated the cache, we should create
//     // the context and return it in the 'onMutate' callback so we can
//     // access to it in the 'onError' callback.
//     onError: (error, newTodo, context) => {
//       // in this function first we check if context is undefined or falsy
//       // otherwise, we should set the query data to the prvs todos
//       if (!context) return;

//       queryClient.setQueryData(CACHE_KEY_TODOS, context.prvsTodos);
//     },
//   });
// };

// export default useAddTodo;
