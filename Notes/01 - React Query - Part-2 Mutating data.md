# Fetching and Updating Data with React Query (3h)

## Part 2: Mutating data

- Handle CRUD operations
- Implement optimistic updates
- Create custom hooks
- Create reusable services

# Keywords

- Mutation hook / mutationFn
- onSuccess / onError / onSetteled
- context

# Mutating data

Time to mutate some data, this component here is a form component that use ref hook to get access to the value of that input fields.

In order to mutate data, we need to use the **`Mutation hook`** in react query, we call that hook and give it an object that have a mutation function that gets the job done.

After making a mutation object with the mutation hook, we call the mutation method from that object and we pass the new todo object, when we call it, react query will send our data to the backend using the mutate function **`mutationFn`**.

    PS: every mutation object has a mutation method to mutate the data.

in the object that we passed to the mutation hook, we can add one or more callbacks, such as **onSuccess**, **onError** and **onSetteled** which called whether the request is successeful or not. we should handle **onSuccess** and set it to a function with 2 parameters as described below.

Here we arrive to mutation data, and there is two approaches:

- **Invalidating cache**: we tell react query that what we have in the cache is invalid, so it will refetch all the data from the backend.
- **Updating the data in the cache**: we update the existing data in the cache directly. we pass two arguments, the queryKey and an updater function.

```tsx
import {
  QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
// ...

const TodoForm = () => {
  // queryClient: the query clinet that we created at the beginning of the section, we used it here to mutate data
  const queryClient = useQueryClient();
  // addTodo is a mutation object
  const addTodo = useMutation({
    mutationFn: (todo: Todo) =>
      // sending a post request to the server
      axios
        .post<Todo>("https://jsonplaceholder.typicode.com/todos", todo) // the url + the object that we recieved
        .then((res) => res.data),
    // 1st par: data, the obj we get from the backend
    // 2nd par: variables: the input, the obj we send to the server
    // ps: type of 1st parameter is any, add a generic type to the post method in order to specify the type of the response
    onSuccess: (savedTodo, newTodo) => {
      // APPROACH: Invalidating cache
      // queryClient.invalidateQueries({
      //   queryKey: ["todos"],
      // });
      // this will invalidate all queries that starts with the provided query key

      // APPROACH 2: Updating the data in the cache
      // ps: we used generic type argument so react query will know the type of data we're gonna update
      queryClient.setQueryData<Todo[]>(["todos"], (todos) => [
        savedTodo,
        ...(todos || []),
      ]);
    },
  });
  const ref = useRef<HTMLInputElement>(null);

  return (
    <form
      className="row mb-3"
      // handle submession
      onSubmit={(event) => {
        event.preventDefault();
        // prevent submiting the form to the server
        // ref.current may be undefined which isn't assignable to type string, that's why we need this test
        if (ref.current && ref.current.value)
          addTodo.mutate({
            id: 0, // generated on the server
            title: ref.current?.value, // optional chaining since it can be null
            userId: 1, // just an example
            completed: false,
          });
      }}
    >
      <div className="col">
        <input ref={ref} type="text" className="form-control" />
      </div>
      <div className="col">
        <button className="btn btn-primary">Add</button>
      </div>
    </form>
  );
};
```

# Handling Mutation Erros

The mutation object has a property to track errors, if that property is truthy, we render an error message.

```tsx
{
  addTodo.error && (
    <div className="alert alert-danger">{addTodo.error.message}</div>
  );
}
```

The type of that property is unknown, react query doesn't know the type of our query, we need to provide a generic type argument when creating a mutation, and the parameters are:

- TData: which is the data that we get from the backend.
- TError: an error object
- TVariables: the data that we get from the backend.

Now when error accure when sending data, an error message will show up.

```tsx
const TodoForm = () => {
  const addTodo = useMutation<Todo, Error, Todo>({...
  //...
}
```

# Showing Mutation Progress

The mutation object has a property called isLoading exactly like our query object, we can use that to render the label of the button dynamically.

```tsx
<button disabled={addTodo.isLoading} className="btn btn-primary">
  {addTodo.isLoading ? "Adding..." : "Add"}
</button>
```

PS: we can remove the value from the input field after submitting it, we can us the ref to clear the value of the input field.

```tsx
onSuccess: (savedTodo, newTodo) => {
  queryClient.setQueryData<Todo[]>(["todos"], (todos) => [
    savedTodo,
    ...(todos || []),
  ]);
  // PS: it can be null, check if it's truthy
  if (ref.current) ref.current.value = "";
},
```

# Optimistic updates

let's see how we can improve the user experience by creating an optimistic updates. to implement that:

First we should the **onMutate** callback, in this function we update the **query cache** so the UI get updated right away, at the end we return a **context** object that includes the previous data which will be used in case the request failed.

PS: in React query a variables refers to the input, the data that we send to the backend.

Next we implement **onError**, we used the prvs todos of context to update the query cache.

if the request is **successful**, we replace the newTodo with the savedTodo that we get from the backend.

- Here's the code for that:

```tsx
import {
  QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useRef } from "react";
import { Todo } from "../hooks/useTodos";
import axios from "axios";

interface AddTodoContext {
  prvsTodos: Todo[];
}

const TodoForm = () => {
  const queryClient = useQueryClient();

  // ps: here will get a missleading error on the mutation function
  // the real reason for this error is 'onMutate' function.
  const addTodo = useMutation<Todo, Error, Todo, AddTodoContext>({
    // PS: AddTodoContext is for the context down below in 'onMutate' func
    mutationFn: (todo: Todo) =>
      axios
        .post<Todo>("https://jsonplaceholder.typicode.com/todos", todo)
        .then((res) => res.data),
    onMutate: (newTodo: Todo) => {
      // This func take a parameter called Variables,
      // in react query it refers to the input.
      //
      const prvsTodos = queryClient.getQueryData<Todo[]>(["todos"]) || [];
      // we returned empty array in the case of the funct return undefined
      // because the type of 'prvsTodos' can be undefined
      // and this object should be an array of todos since we specified it
      // in the interface above ('AddTodoContext')

      // Here we should update the query cache right away
      // instead of waiting for a response and clear the input
      queryClient.setQueryData<Todo[]>(["todos"], (todos) => [
        newTodo,
        ...(todos || []),
      ]);
      if (ref.current) ref.current.value = "";

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
      // to fix this, where we return the prvsData, if it's undefined we
      // should return an empty Array
    },
    // moreover, we have to handle the success and the errors scenario
    // if the request is successful, we replace the newTodo with
    // the one we get from the backend (it doesn't have an id)
    onSuccess: (savedTodo, newTodo) => {
      queryClient.setQueryData<Todo[]>(["todos"], (todos) =>
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

      queryClient.setQueryData(["todos"], context.prvsTodos);
    },
  });
  const ref = useRef<HTMLInputElement>(null);

  return (
    <>
      {addTodo.error && (
        <div className="alert alert-danger">{addTodo.error.message}</div>
      )}
      <form
        className="row mb-3"
        onSubmit={(event) => {
          event.preventDefault();

          if (ref.current && ref.current.value)
            addTodo.mutate({
              id: 0, // generated on the server
              title: ref.current?.value,
              userId: 1, // just an example
              completed: false,
            });
        }}
      >
        <div className="col">
          <input ref={ref} type="text" className="form-control" />
        </div>
        <div className="col">
          <button className="btn btn-primary">
            {addTodo.isLoading ? "Adding..." : "Add"}
          </button>
        </div>
      </form>
    </>
  );
};

export default TodoForm;
```

# Creating a Custom Mutation Hook

Our component has all the logic for querying and all the logic for implmenting the optimistic updates, so it doesn't have a single responsibility, to improve this code we should extract all those extra stuff and move it into a custom reusable hook, this will help remove the complexity of our component, make it more modular and easier to understand and maintain.

in the hooks folder we create new file called **useAddTodo.ts**, we define a function called **useAddTodo** and export it. now we grab everything related to querying and data management from our component. you'll get a bunch of errors that can be fixed one by one. for the **AddTodoContext** interface you just need to bring the interface.

Now, we will have an issue with a piece of code that involves updating th UI, we should avoid that because it makes our hook less reusable, the whole purpose of this hook is encapsulating the logic for sending a new todo to the backend and updating the cache, it's about data management and should focus on that aspect only, we should leave the UI related logic to the consumer of this hook, the **todoForm** component in this case. That way, we can allow the consumer to decide what to do once the data is updated.

we'll do that using a callback function, so our component is gonna pass a function, our hook is gonna call that function back to move control to our component.

```tsx
// our Hook
const useAddTodo = (onAdd: () => void) => {
  // ..
  // ...
  // after getting the data
  // if (ref.current) ref.current.value = "";
  onAdd();

  return { prvsTodos };
  // ..
  // ...
};
```

Back to our component, we call **useAddTodo** and give it a callback function, this is where we use our ref to clear the input field.

```tsx
// our component
const TodoForm = () => {
  const ref = useRef<HTMLInputElement>(null);
  // this hook return a mutation object
  const addTodo = useAddTodo(() => {
    if (ref.current) ref.current.value = "";
  });
  // ..
  // ...
```

Now will get a bunch of error because our hook is not returning anything, we should return the mutation object we created straight away. all issues will be gone now.

```tsx

const useAddTodo = (onAdd: () => void) => {
  const queryClient = useQueryClient();

  // ps: here will get a missleading error on the mutation function
  // the real reason for this error is 'onMutate' function.
  return useMutation<Todo, Error, Todo, AddTodoContext>({
    mutationFn
    // .
    // ..
   }
}
```

and now there is some small issues to fix, like key for exp, we used it several times which may increase the chance of typos, also if we decided to change this key, there is multiple spaces to change that, here's how to fix it.

in our Query folder we add a file called **constants.ts**, there we can export a const as below:

```tsx
export const CACHE_KEY_TODOS = ["todos"];
```

we replace the key in our code with **CACHE_KEY_TODOS**.

Another issue is how we spread the array in case the _todos_ was undefined, we can initialize it with an empty array for a better code:

```tsx
// old code
queryClient.setQueryData<Todo[]>(["todos"], (todos) => [
  newTodo,
  ...(todos || []),
]);
// we can initialize the todos with an empty array to make the code cleaner, here's how
queryClient.setQueryData<Todo[]>(["todos"], (todos = []) => [
  newTodo,
  ...todos,
]);
```

Here's the final code of our mutation hook

```tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Todo } from "./useTodos";
import { CACHE_KEY_TODOS } from "../constants";

interface AddTodoContext {
  prvsTodos: Todo[];
}

const useAddTodo = (onAdd: () => void) => {
  const queryClient = useQueryClient();

  return useMutation<Todo, Error, Todo, AddTodoContext>({
    mutationFn: (todo: Todo) =>
      axios
        .post<Todo>("https://jsonplaceholder.typicode.com/todos", todo)
        .then((res) => res.data),

    onMutate: (newTodo: Todo) => {
      const prvsTodos = queryClient.getQueryData<Todo[]>(CACHE_KEY_TODOS) || [];
      queryClient.setQueryData<Todo[]>(CACHE_KEY_TODOS, (todos) => [
        newTodo,
        ...(todos || []),
      ]);

      onAdd();

      return { prvsTodos };
    },

    onSuccess: (savedTodo, newTodo) => {
      queryClient.setQueryData<Todo[]>(CACHE_KEY_TODOS, (todos) =>
        todos?.map((todo) => (todo === newTodo ? savedTodo : todo))
      );
    },
    onError: (error, newTodo, context) => {
      if (!context) return;
      queryClient.setQueryData(CACHE_KEY_TODOS, context.prvsTodos);
    },
  });
};

export default useAddTodo;
```

And here's the component

```tsx
const TodoForm = () => {
  const ref = useRef<HTMLInputElement>(null);
  const addTodo = useAddTodo(() => {
    if (ref.current) ref.current.value = "";
  });

  return (
    <>
      {addTodo.error && (
        <div className="alert alert-danger">{addTodo.error.message}</div>
      )}
      <form
        className="row mb-3"
        onSubmit={(event) => {
          event.preventDefault();

          if (ref.current && ref.current.value)
            addTodo.mutate({
              id: 0, // generated on the server
              title: ref.current?.value,
              userId: 1, // just an example
              completed: false,
            });
        }}
      >
        <div className="col">
          <input ref={ref} type="text" className="form-control" />
        </div>
        <div className="col">
          <button disabled={addTodo.isLoading} className="btn btn-primary">
            {addTodo.isLoading ? "Adding..." : "Add"}
          </button>
        </div>
      </form>
    </>
  );
};
```

# Creating a Reusable API Client

Our querying logic has leaked into our hook, we're also duplicating our endpoint in seperate files, we can make it a constant but that won't solve the big issue, we also gonna repeat that concept when we need another piece of data from another endpoint. it can a lot of duplication and maintanance headache.

Now, create a file called "apiClient.ts" and import axios, since we're fetching data only from JSONplaceholder we should create a default axios instance to avoid using the url every time we fetch data.

```tsx
import axios from "axios";

// this will return an axios instance
const axiosInstance = axios.create({
  baseURL: "https://jsonplaceholder.typicode.com",
});
```

Next we define a class called **APIClient**, we'll use that apiClient to send various HTTP request to various endpoints, we should give it an endpoint property of type string and initialize it.

we need various methods for getting data or posting data and so on...
we'll implement the function that get all the data which is the logic we duplicated in a couple of places so now we're implementing this logic once for all in this APIClient. don't forget to export the class at the end.

```tsx
// like that we can use T anywhere in our class
class APIClient<T> {
  endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  // getAll<T>() {
  getAll() {
    return axiosInstance.get<T[]>(this.endpoint).then((res) => res.data);
  }

  // post is a generic method that take objects  of type T
  post(data: T) {
    axiosInstance.post<T>(this.endpoint, data).then((res) => res.data);
  }
}
```

    Note: Now if you look at the signiture of that method, it return a Promise of type any, we want to work with typed objects. we can provide a generic type request, but not specify it directly there, we want this method to be generic, we add <T> and add it as a type parameter to the function.

    since we repetead our generic type in more than one place we can move it to our class instead of adding it in every function.

Now we can use this in one of our hooks, back to ours useTodos hook, we import it and create a constant of that class without forgeting to provide the endpoint and our generic type argument.

In that hook we can get rid of **fetchTodos** function because we already implemented that logic in our API client, we remove it and reference to **apiClient.getAll** in **queryFn**, we're not calling it we're only referencing it.

```tsx
import APIClient from "../services/apiClient";
// ...

const apiClient = new APIClient<Todo>("/todos");
// ...

const useTodos = () => {
  // we deleted the fetchTodos function from here

  return useQuery<Todo[], Error>({
    queryKey: CACHE_KEY_TODOS,
    queryFn: apiClient.getAll, // referencing
    staleTime: 100 * 1000,
    keepPreviousData: true,
  });
};
```

**Important!**: you will get an error when running the code, instead of getting the data from the endpoint, you'll get the html code. after debugging you find that the **this.endpoint** inside the **apiClient.getAll** is undefined, this is happening because when referencing the getAll method there, the **this** keyword loses its context and become undefined, this will be like a stand alone function, not a function that is a part of an object, to solve this we write it inside an arrow function. or we can bind it to containing object.

```tsx
// first solution: binding
// we're saying that this function belongs to that object
// when the function is called *this* will reference the apiClient object
queryFn: apiClient.getAll.bind(apiClient),

```

```tsx
// 2nd solution: arrow function
// because arrow methods don't have theire own *this* context so the *this* context inside an arrow function will refer to the apiClient instance
getAll = () => {
  // ..
  // ..
};
```

Now we remove the axios import statement and make the same change in the other hook. and here's the final code:

```tsx
// apiClinet.ts

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
    return axiosInstance.get<T[]>(this.endpoint).then((res) => res.data);
  };

  // post is a generic method that take objects of type T
  post = (data: T) => {
    return axiosInstance.post<T>(this.endpoint, data).then((res) => res.data);
  };
}

export default APIClient;
```

```tsx
// useTodos.ts
import { useQuery } from "@tanstack/react-query";
import APIClient from "../services/apiClient";
import { CACHE_KEY_TODOS } from "../constants";

const apiClient = new APIClient<Todo>("/todos");

export interface Todo {
  id: number;
  title: string;
  userId: number;
  completed: boolean;
}

const useTodos = () => {
  return useQuery<Todo[], Error>({
    queryKey: CACHE_KEY_TODOS,
    queryFn: apiClient.getAll, // we change the queryFn here
    staleTime: 100 * 1000,
    keepPreviousData: true,
  });
};

export default useTodos;
```

```tsx
// useAddTodo.ts
import APIClient from "../services/apiClient";
// ...

const apiClinet = new APIClient<Todo>("/todos");

interface AddTodoContext {
  prvsTodos: Todo[];
}

const useAddTodo = (onAdd: () => void) => {
  const queryClient = useQueryClient();

  // we cahnge the mutation function here
  return useMutation<Todo, Error, Todo, AddTodoContext>({
    mutationFn: apiClinet.post,
    // ...
    // ...
```

# Creating a Reusable HTTP Service

We have duplicated our endpoint in 2 different places, to solve this problem, we should create a sinlg instance of our api client for working with todos.

we add new file in service called **todoService.ts**, that's where we're going to create a single instance of our apiClient using the same code we used erlier and then we export it.

And since we defined the Todo interface and used it in 2 different hooks we'll get the interface into our TodoService file, because the first way is an ugly way to use it.

```tsx
import APIClient from "./apiClient";

export interface Todo {
  id: number;
  title: string;
  userId: number;
  completed: boolean;
}

export default new APIClient<Todo>("/todos");
```

Now we'll do some clean-up, we cahnge the import statements and the functions references.

PS: don't forget to import the Todo interface.

```tsx
// useTodos
// we change the import statement
import todoService, { Todo } from "../services/todoService";

const useTodos = () => {
  return useQuery<Todo[], Error>({
    queryKey: CACHE_KEY_TODOS,
    queryFn: todoService.getAll, // we change it here too
    staleTime: 100 * 1000,
    keepPreviousData: true,
  });
};

export default useTodos;
```

```tsx
// we import the todoService
import todoService, { Todo } from "../services/todoService";

interface AddTodoContext {
  prvsTodos: Todo[];
}

const useAddTodo = (onAdd: () => void) => {
  const queryClient = useQueryClient();

  return useMutation<Todo, Error, Todo, AddTodoContext>({
    mutationFn: todoService.post, // we change the obj name here
```

# Understanding the Application Layers

Let's take a closer look at the pieces in our apllication and how they work together.

![Application Layers](./images/Application%20Layers.png)

**API Clinet:** The botton layer, Handle HTTP request for the backend.

**HTTP Services:** Instances of our API Client dedicating to working with specific type of objects. for exp we have a todo service for working with todos, we can also have a post service for working with posts.

**Custom Hooks:** Above those layers we have this costum hook, which use HTTP Servies to fetch and update Data, in these hooks we have all the logic for managing data in the cache.

**Component:** at the top we have our component whcih use our hooks to fetch and update data.

The beutiful here is that each layerin this application has a single responsibility resulting in a clear and well orginized architecture. by breaking down our application these different layers we can easily manage and maintain our code, reduce duplication and improve scalability.
