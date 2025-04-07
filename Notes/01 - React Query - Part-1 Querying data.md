# Fetching and Updating Data with React Query (3h)

## Part 1: Querying data

- Fetch data
- Handle errors
- Implement pagination
- Implement infinite queries
- Debug queries with React Query DevTools

## keywords

- React query
- caching
- QueryClient / QueryClientProvider
- Automatics retries, auto refetch, caching
- TError / Error
- ReactQueryDevtoos
- defaultOptions and queries
- useInfiniteQuery
- getNextPageParam

# What is React Query

**`React Query`**: is a powerful library for managing data fetching and caching in React applications.

but why using it? let's see...

This is how we typically fetch data from the back-end in a React application. There are a number of problems in this implementation!

```tsx
useEffect(() => {
  axios
    .get("https://jsonplaceholder.typicode.com/users")
    .then((res) => {
      setUsers(res.data);
    })
    .catch((err) => {
      setError(err.message);
    });
}, []);
```

## usual Problems:

    - No Request Cancellation.
    - No Separation of Concerns.
    - No Retries.
    - No Automatic Refresh.
    - No Caching.

## In more details:

The first problem is that we are not cancelling the request if our component is unmounted. in the function that we pass to the effect hook, we should return a cleanup function for undoing what we did before. In case of HTTP requests, we should cancel them.
This is especially important in React 18 Because by default, the strict mode is enabled. Which causes each component will be rendered twice. So if you don't cancel the request will end up fetching the data twice.

The next problem is no separation of concerns. The querying logic is leaked into the component. If somewhere else we need the same piece of data we have to duplicate the querying logic. So there is no opportunity for reuse here there is no modularity in our code. To address this, we need to extract the querying logic and encapsulate it inside a hook.

We are not retrying failed requests. So if a request fails, we show the user an error and move on not the best user experience.

Another limitation is that there is no automatic refresh. So if the data changes while the user is on this page, they don't see the changes unless they refresh.

    There is no caching? but What is caching? Caching: is the process of storing data in a place where it can be accessed more quickly and efficiently in the future.

For example, in our React applications, we can store frequently used data on the client's browser, meaning inside the user's browser, so we don't have to fetch it from the server every time it's needed, this can greatly improve the performance of our applications.

Now, we can address all these limitations by writing more and more code but there's a lot of extra code that we have to maintain. This is where **`react query`** comes into play.

    React Quarry: is a powerful library for managing data fetching and caching in React applications.

Now, a lot of people use **Redux** for caching, it's a popular state management library for JavaScript applications. It allows us to store the state or the data of an application in a single global store. In practical terms, the store is just a JavaScript object in the user's browser.

Now, the problem with Redux is that it can be very complex and difficult to learn, especially for new developers. Plus, it requires a lot of boilerplate code and makes your applications more difficult to debug and maintain.

React Query on the other hand, is a lot simpler and more lightweight. So Redux is no longer needed, in a lot of cases, at least for caching.

If you have to maintain an older project that uses Redux first, see if you can replace it with React Query.

# Setting Up React Query

```cmd
npm i @tanstack/react-query@4.28
```

Now we need to go to main.tsx and import **`QueryClient`** and **`QueryClientProvider`** from **@tanstack/react-query**, that query client is the core object we use for managing and caching remote data in react Query.

First, we should create a new instance of **`QueryClient`**. then we need to pass this to our component tree using the QueryClientProvider. So we wrap our app component with a QueryClientProvider.

And here we set the client prop to the QueryClient that we just created. That's all we had to do to set up react query.

```tsx
// main.tsx
// ...
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
```

# Fetching Data

To fetch data with react Query we use Query hook that is defined in "tanstack/react-query". we give a configuration object with 2 properties, **`queryKey`** and **`queryFn`**

- **queryKey**: Unique identifier for the query, it is used internally for caching, anytime we retrieve a piece of data from the backend, the data is stored in the cache, and it will be accessible via this key, we set it to an array of one or more values, 1st one is usualy a string that identifies the type of data we wanna store here(todos in this case). we can have additional values(for exp: "completed" for storing completed todos, we can also have an object with completed set to true, depends on what you need).

- **`queryFn`**: This is the function that we use to fetch the data from the backend, this function should return a promise that resolve to data or throw an error.

        PS: you can use any HTTP library. React query only concerns with managing and caching data.

```tsx
const fetchTodos = () => {
  // we add <Todos[]> to be specific of the returned type of this func
  // since any is not a desired type in Ts, we need to be more specific
  // so we can take advantage of tS, generic type arg will do the job.
  axios
    .get<Todos[]>("https://jsonplaceholder.typicode.com/todos")
    // returns a response object, we don't wanna store that
    .then((res) => res.data); // we wanna store the actual data
};

const query = useQuery({
  queryKey: ["todos"],
  queryFn: fetchTodos,
});
```

That **query** object has bunch of properties like: Data, errors, isLoading and so on, since we're interested only in the data property we can destructure the object.

with this implementation we no longer need the state hook to declare state variables for our data and errors, we don't need the effect hook too.

```tsx
const { data: todos, error } = useQuery<Todos[], Error>({
  queryKey: ["todos"],
  queryFn: fetchTodos,
});

return (
  <ul classname="list-group">
    {/* todos can be undefined, optional chaining will solve the err */}
    {todos?.map((todo) => (
      <li key={todo.id} className="list-group-item">
        {todo.title}
      </li>
    ))}
  </ul>
);
```

PS: With this implementation we get some benefits such as **`Automatics retries`**, **`Auto refetch`** and **`caching`**, we can configure all of those.

# Handling Errors

Speaking about errors now, the query object that we got from Query hook has a property called error to track errors that could appear while fetching data.

React doesn't know how to render the error object because the type of that object is unknown, because the type error that could happen is unknown to react query since it depend on how we fetch the data, in Axios, all errors are instances of the **Error** interface that is available in all browsers, so when calling the query hook we should specify the type of errors that may happen when fetching data.

first generic type is the type of data we expect from the backend, the 2nd parameter is **TError** which is initialize to unknown. we should set this to **`Error`**

```tsx
// ...

const { data: todos, error } = useQuery<Todos[], Error>({
  queryKey: ["todos"],
  queryFn: fetchTodos,
});

// error in an instance of error or null
if (error) return <p>{error.message}</p>;
// ...
// ...
// ...
```

# Showing a loading indicator

This query object has another useful property called **isLoading**

```tsx
// ...

const {
  data: todos,
  error,
  isLoading,
} = useQuery<Todos[], Error>({
  queryKey: ["todos"],
  queryFn: fetchTodos,
});

if (isLoading) return <p>Loading...</p>;

if (error) return <p>{error.message}</p>;

return (
    // ...
)
```

# Creating a Custom Query Hook

To have a better code that applies the separation of concerns, we'll make some custom hooks.

First, Todos hook that return the query object:

```tsx
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { Todos } from "../../services/todos-services";

const useTodos = () => {
  const fetchTodos = () =>
    // we add <Todos[]> to be specific of the returned type of this func
    // since any is not desired type in Ts, we need to be more specific
    // so we can take advantage of tS. generic type arg will do the job.
    axios
      .get<Todos[]>("https://jsonplaceholder.typicode.com/todos")
      // returns a response object, we don't wanna store that
      .then((res) => res.data); // we wanna store the actual data

  // query object
  return useQuery<Todos[], Error>({
    queryKey: ["todos"],
    queryFn: fetchTodos,
  });
};

export default useTodos;
```

Now we remove unused import statements:

```tsx
import useTodos from "../hooks/useTodos";

const TodosList = () => {
  const { data: todos, error, isLoading } = useTodos();

  if (isLoading) return <p>Loading...</p>;

  if (error) return <p>{error.message}</p>;

  return (
    <ul className="list-group">
      {/* todos can be undefined, 
      optional chaining will solve the err */}
      {todos?.map((todo) => (
        <li key={todo.id} className="list-group-item">
          {todo.title}
        </li>
      ))}
    </ul>
  );
};

export default TodosList;
```

# Using react Query DevTools

Similar to many front end libraries react query comes with its own dev tool. And here's how to install it:

```cmd
npm i @tanstack/react-query-devtools@4.28
```

Now, let's go to **main.tsx** and import a component called **`ReactQueryDevtoos`** from **`@stack/react-query-devtools`**.

Now we should add this to our component tree after the app component.

```tsx
<App />
<ReactQueryDevtools />
```

    PS: So this only goes in our development build. So later when we build for production, Dev Tools is not going to be included.

Now back in the browser. So we get this icon on the corner for toggling the dev tools. So here's the content of our cache. Currently, we have a single item with his key. We can click on his key to see more details.

    PS: number of observers refers to the number of components that are using this query.

So currently, we have a single component using this query. Now if this component is unmounted, meaning if it's removed from the screen, the observers will be zero, and the query will be inactive. Inactive queries will eventually get garbage collected and remove from the cache.

We have a bunch of other useful actions here. We can refetch a query, we can invalidate it and more...

    PS: all our queries have a default cache time of 300,000 milliseconds, which is five minutes. So if our query has no observers it will be inactive and will be garbage collected after five minutes. Of course, this is something that we can configure.

# Customizing Query Settings

queries have a few default settings that work in most situations, but we can always customise them per query or globally. to do so, we must go to main.tsx. and change this line where we create a new query client:

```tsx
const queryClinet = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3, // default is 3
      cacheTime: 300_000, // default is 5m
      staleTime: 10 * 1000, // default is 10s
      refetchOnWindowFocus: false, // default value: true
      refetchOnReconnect: false, // default value: true
      refetchOnMount: false, // default value: true
      keepPreviousData: true, // default value: false
    },
  },
});
```

- **retry**: if a query fails, react query will retry three more times.
- **cacheTime**: if a query has no observer, meaning no component is using that query, that query is considered inactive. Now the result of inactive queries is removed from the cache after five minutes. This is called garbage collection.
- **staleTime**: specifies how long the data is considered fresh. Now, this has a default value of zero.

One of the beautiful things about React query is that it automatically refreshes stale data under three situations when the network is reconnected or when a component is mounted, or when the window is refocused:

- **refetchOnWindowFocus**: when the clinet select the tab.
- **refetchOnReconnect**: if the client goes offline, and then comes back online, react query will refresh our queries.
- **refetchOnMount**: means our queries should be fetch when a component mounts for the first time.
- **keepPreviousData**: keep the previous data until the new data arrives.

Most of the time, we don't really need to change these settings, the default values work well for most cases, the only setting that we often need to customize is the stale time and this is dependent on our case, some pieces of data get updated less frequently.

For this we can configure stale time per query:

```tsx
// query object
return useQuery<Todos[], Error>({
  queryKey: ["todos"],
  queryFn: fetchTodos,
  staleTime: 10 * 1000, // 10Sec
});
```

# Parameterized Queries

To show how to parameterize queries, we'll make some chnages, will add a select element with a userId state variable to track changes, When the selected user changes we should filter post by that user and pass the ID to our query.

```tsx
const [userId, setUserId] = useState<number>();
const { data: posts, error, isLoading } = usePosts(userId);
// ...
// ...

<select
  className="form-select mb-3"
  value={userId}
  onChange={(event) =>
    // to avoid parsing the empty string into a number
    setUserId(
      isNaN(parseInt(event.target.value))
        ? undefined
        : parseInt(event.target.value)
    )
  }
>
  <option value=""></option>
  <option value="1">User 1</option>
  <option value="2">User 2</option>
  <option value="3">User 3</option>
</select>;
```

```tsx
const usePosts = (userId: number | undefined) => {
  // userId: is a number or undefined because initially no user is selected
  const fetchPosts = () => {
    return axios
      .get<Post[]>("https://jsonplaceholder.typicode.com/posts", {
        params: {
          userId,
          // if we did avoid parsing the empty string into a number,
          // we won't need this line down here:
          // userId: userId ? userId : undefined,
        },
      })
      .then((res) => res.data);
  };

  return useQuery<Post[], Error>({
    // queryKey: ["users", userId, "posts"]
    // if no user is selected, it would be nicer to have an array with
    // a single value that is posts, otherwise a null value in the middle
    // will be ugly, that's easy to fix:
    queryKey: userId ? ["users", userId, "posts"] : ["posts"],
    queryFn: fetchPosts,
  });
};
```

So far, we have had simple keys with a single value. But now that we are dealing with hierarchical data, we should structure our key a little bit differently. So we should follow a hierarchical structure that represent the relationship between our objects.

We start with the top level object which is **users** then we add **userId** followed by **posts**. This is the same pattern to follow when designing URLs for our API.

    Example: if you want to build an API for fetching the posts by user, you would add an endpoint like this slash users slash one, which is the user ID followed by posts, We're following the same pattern here.

So as we go from left to right, for data get more specific. Here's the thing. The user ID is a parameter for this query. Every time the value of user ID changes, react query will fetch the posts for that user from the backend. So this is very similar to the dependency array of the effect hook. Anytime any of the dependencies changes, the effect gets re executed.

Now the final part is passing the user ID to the backend. Here we set params to an object. And in this object, we add all the query string parameters, in this case, user ID.

As simple as that. Let's test our implementation. So back in the browser, initially, no users select that so we see all the posts. But if we select the user, we only see the posts by that user. Now let's look at our cache and dev tools. So currently, we have two entries here posts by user two, and posts by all users. Now the first query is fresh and active with one observer. But the second query is inactive, because here we have no observers. However, if we change the user to the first option, the second query becomes active again. Okay.

One More thing, if we select User one we will see our loading indicator. However, from now on that page gets updated instantly, we won't see the loading indicator since the data of user one is already in the cache, This is one of the benefits of using react query.

# Paginated Queries

In this lesson we're gonna focus only on pagination, so instead of userId we'll define a **PostQuery** object that contain a page number and pageSize.

**PostQuery** is used here because in the future we may have other ways to filter the posts. it's better to encapsulate all these values inside query object.

```tsx
interface PostQuery {
  page: number;
  pageSize: number;
}

const usePosts = (query: PostQuery) => {
  const fetchPosts = () => {
    return axios
      .get<Post[]>("https://jsonplaceholder.typicode.com/posts", {
        params: {
          _start: (query.page - 1) * query.pageSize,
          _limit: query.pageSize,
        },
      })
      .then((res) => res.data);
  };

  return useQuery<Post[], Error>({
    // anytime query changes, rq will fetch the data from the backend
    queryKey: ["posts", query],
    queryFn: fetchPosts,
    staleTime: 100 * 1000,
    keepPreviousData: true, // until new data arrives
  });
};
```

PS: This **query object** has nothing to do with react query, it's a common design pattern, it's an object that contain all the values for querying a set of objects

```tsx
const PostList = () => {
  const pageSize = 10;
  const [page, setPage] = useState(1);
  const { data: posts, error, isLoading } = usePosts({ page, pageSize });

  if (error) return <p>{error.message}</p>;
  if (isLoading) return <p>Loading...</p>;

  return (
    <>
      <ul className="list-group">
        {posts?.map((post) => (
          <li key={post.id} className="list-group-item">
            {post.userId} {"- "}
            {post.title}
          </li>
        ))}
      </ul>
      <button
        className="btn btn-primary my-3"
        onClick={() => setPage(page - 1)}
        disabled={page === 1}
      >
        Previous
      </button>
      <button
        className="btn btn-primary my-3 ms-1"
        onClick={() => setPage(page + 1)}
        // we don't know Nbr of pages, we won't implement disabled option
      >
        Next
      </button>
    </>
  );
};
```

PS: in order to avoid the loading state, and the jump of the screen up and down, we will keep the data on the current page until the new data is loaded, will do that using a Query Settings called **``keepPreviousData`**.

# Infinite Queries

Will start with loading data using a "load more" button, we'll look later for ways to load data as the user scroll.

first, we will replace `useQuery` with `useInfiniteQuery`, and with that one we can't use state variable to keep track of page numbers because infinite queries handle pagination automatically, so we'll remove it from our code.

infinite queries has a function to calculate the page number, we should implement the fucntion called `getNextPageParam`, we set this to a function with two paramaters, _lastPage_ which is an array of Post and _allPages_ which is a 2D array of posts, this paramatere will contain the data for all pages.

In this function we should get the next page number, to implement that we can return the length of `allPages` paramater plus one.

PS: one thing you should be careful about is knowing when to stop, you don't wanna increament the page number forever, the implemention of this may vary from a backend to the other, an ideal API will return the total number of records ahead of time.

when we hit the _load more_ button, react query will cause this `getNextPageParam` to get the next page number, then it will pass the next number to the query function so we should add a parameter to `queryFn` and destructure it, keep in mind that you need to initialize it too

```tsx
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
```

Back to our component to fix some errors, first we remove the page state, then we make a button for loading more data, we set the `onClick` function to `fetchNextPage()` from the infinite query that is return from our hook. React query will call `getNextParam` to calculate the next page number, and then pass it to our `queyFn`.

Now while laoding more data we should disable that button, we do that by grapping a boolean property called `isFetchingNextPage` then we set the `disabled` attribute to that paramaeter.

The final step is to rewrite the map logic. we need to iterate over the pages property of that data object, and to avoid adding div element in a list, we will use React Fragements, and inside thoe fragments we'll render the list items.

```tsx
const PostList = () => {
  const pageSize = 10;
  // const [page, setPage] = useState(1); no need for this now
  // the infinit query that is return here has a func `fetchNextPage`
  const { data, error, isLoading, fetchNextPage, isFetchingNextPage } =
    usePosts({ pageSize });

  if (error) return <p>{error.message}</p>;
  if (isLoading) return <p>Loading...</p>;

  return (
    <ul className="list-group">
      {data.pages.map((page, index) => (
        // PS: don't forget the key attribute
        <Fragment key={index}>
          {page.map((post) => (
            <li key={post.id} className="list-group-item">
              {post.userId} {"- "}
              {post.title}
            </li>
          ))}
        </Fragment>
      ))}
    </ul>
    <button
      className="btn btn-primary my-3 ms-1"
      disabled={isFetchingNextPage}
      onClick={() => fetchNextPage()}
    >
      {/* to make the button dynamic */}
      {isFetchingNextPage ? "Loading..." : "Load More"}
    </button>
  );
};
```
