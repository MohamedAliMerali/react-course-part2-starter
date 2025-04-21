# Global State Management

## Content

## Keywords

-

# Managing Application State with Zustand

```jsx
// Counter component
import { useReducer } from "react";
import counterReducer from "./counterReducer";

const Counter = () => {
  // const [value, dispatch] = useReducer(counterReducer, 0);
  // no need for the reducer anymore, because all the logic for
  // managing the state of our counter, is implemened in our store

  // const counterStore = useCounterStore();
  const { counter, increament, reset } = useCounterStore();

  return (
    // we our value and funcs
    <div>
      Counter ({counter})
      <button onClick={() => increament()} className="btn btn-primary mx-1">
        Increment
      </button>
      <button onClick={() => reset()} className="btn btn-primary mx-1">
        Reset
      </button>
    </div>
  );
};

export default Counter;
```

I briefly talked about Zustand. Now, "Zustand" is a German word, and apparently, the correct pronunciation is "zoostand" or "zoosh-tahnd." I'm not entirely sure—my German friends can correct me on this. But that aside, let me show you how we can use it to easily manage the state of our application.

First, we install Zustand, version 4.3.7.

```cmd
npm i zustand@4.3.7
```

Now, we're going to manage the state of our counter using Zustand. In the `counter` folder, we create a new file called `store.ts`. This file will handle managing the state of our counter.

First, we define an interface to specify the shape of the store. We'll call this `CounterStore`. In the store, we need a property called `counter` of type `number` and two functions for updating it. The first one is `increment`, which is a function with no parameters that returns `void`. Similarly, we have the `reset` function, which is also a function with no parameters that returns `void`.

Once we have this, we call the `create` function and pass the shape of the store, which is `CounterStore`. We call this function and provide it with an arrow function. This arrow function should have a parameter called `set`, which is a function for updating the state of the store. We’ll see how that works in a second.

```tsx
// PS: 'set' is a function for updating the state of the store
const useCounterStore = create<CounterStore>((set) => ({}));
// We use parentheses here because if we use only curly braces
// it would look like we’re defining a block of code
```

In this object, we implement our store. We set the `counter` property with an initial value of `0` and implement the two functions. The `increment` function, with no parameters and returning `void`, uses the `set` function to update the state of the store. We call `set` and give it an arrow function that takes the current state and returns the next state, similar to how we use reducers.

So, this arrow function takes the current state of the store, and we return the next state by setting `counter` to `store.counter + 1`. We update the state in an immutable way, just like we’ve been doing so far, except here, we don't need to use the spread operator to copy other properties. The `set` function will merge the property inside into our next state object.

Next, we implement the `reset` function, which also has no parameters and returns `void`. Here, we call `set` to update the state of the store, providing an arrow function that takes the current state and returns the next state, setting `counter` back to `0`. Since we don’t use the `store` parameter in this function, we can replace it with empty parentheses.

With this setup, calling `create` returns a **`custom hook`** that we can use anywhere in our application, We can name it **`useCounterStore`** and export it.

```ts
// store.ts
interface CounterStore {
  counter: number;
  increament: () => void;
  resetr: () => void;
}

// Create function of zustand
// this will return a custom hook that
// we can use anywhere in our application
const useCounterStore = create<CounterStore>((set) => ({
  counter: 0,
  // in the body of this func we use the 'set' func
  // to update the state of the store
  increament: () => set((store) => ({ counter: store.counter + 1 })),
  reset: () => set(() => ({ counter: 0 })),
}));

export default useCounterStore;
```

Now, let's go to our `Counter` component and use our new store. In this component, we no longer need to use the reducer, so we can delete it from our project. All the logic for managing the state of our counter is now implemented in our store. This serves as a replacement for our reducer so we can delete taht reducer.

```tsx
// const [value, setValue] = useState(0);
// const [value, dispatch] = useReducer(counterReducer, 0);
const store = useCounterStore();
```

Back in our `Counter` component, we don't need the reducer anymore. Instead, we use the hook to access our store `useCounterStore`. Storing the hook in a separate constant and exporting it at the end is beneficial because it makes it easier to look up and import it in other code.

Now, we can import the store, which returns a store object with the properties and methods we expect. So here, we have `counter`, `increment`, and `reset`. We can destructure this in our code, replacing the `value` with `counter`.

```tsx
import useCounterStore from "./store";

const Counter = () => {
  // const [value, setValue] = useState(0);
  // const [value, dispatch] = useReducer(counterReducer, 0);
  // destructure it
  const { counter, increament, reset } = useCounterStore();

  return (
    <div>
      Counter ({counter})
      <button
        // onClick={() => dispatch({ type: "INCREMENT" })}
        onClick={() => increament()}
        className="btn btn-primary mx-1"
      >
        Increment
      </button>
      <button
        // onClick={() => dispatch({ type: "RESET" })}
        onClick={() => reset()}
        className="btn btn-primary mx-1"
      >
        Reset
      </button>
    </div>
  );
};

export default Counter;
```

When the button is clicked, instead of dispatching an action, we simply call the `increment` function. Isn't that nicer? We do the same for resetting the counter by calling the `reset` function.

Let's test our implementation by going to our `App` component and adding our `Counter` and `NavigationBar`. Back in the browser, we can see our counter. We can increment it, and we can reset it. Everything works beautifully.

We can also use the same state in other components. Let’s go to our `NavBar` and replace the number of tasks with the value of the counter. Just like before, we call `useCounterStore`. Since in this component, we don't care about the functions for incrementing or resetting the counter, we only grab the `counter` property and add it to our `NavigationBar`. Now, these values are in sync across components, so we can increment or reset the counter and see the changes reflected everywhere.

```tsx
import LoginStatus from "./auth/LoginStatus";
import useCounterStore from "./counter/store";

const NavBar = () => {
  const { counter } = useCounterStore();

  return (
    <nav className="navbar d-flex justify-content-between">
      <span className="badge text-bg-secondary">{counter}</span>
      <LoginStatus />
    </nav>
  );
};

export default NavBar;
```

This is how we can use Zustand to manage the state of our application. First, we use an interface to define the shape of the store, then we implement it in the store. With this implementation, we don't need context, providers, custom hooks, reducers, or any of the related complexity. Our code is far simpler and more concise. That's why I love Zustand.

# Exercice: Working with Zustand

Now, before going further, I want you to manage and share the current user using Zustand. Spend five minutes on this, and then come back to see my solution.

Here, in the `auth` folder, we add a new file called `store.ts`. Next, we use an interface to define the shape of our store. We call it `AuthStore`. This store will have a `user` property of type `string` and two functions for updating it: `login` and `logout`. This way, all the logic for managing the current user is in one place.

The `login` function will take a `user` or `username` (of type `string`) and return `void`. The `logout` function will have no parameters and also return `void`.

```tsx
interface AuthStore {
  user: string;
  login: (username: string) => void;
  logout: () => void;
}
```

Next, we call the `create` function from Zustand and provide it with the shape of our store, `AuthStore`.

Here, we pass an arrow function that takes `set` as a parameter and returns the implementation of our store. So, we return an object where we set the initial value of `user` and implement the `login` and `logout` methods.

For `login`, which takes a `username`, we call `set` and pass an arrow function. This arrow function takes the current state and returns the next state, where `user` is set to `username`. Since we don't need to compute the next state based on the current state, we can replace the `store` parameter with empty parentheses.

Next, we implement `logout`, which also has no parameters. Here, we call `set`, pass the current state, and return the next state with `user` set to an empty string. Again, we don't need the `store` parameter, so we can simplify our code.

We call `create`, which returns a custom hook that we’ll call `useAuthStore`, and then we export it at the bottom.

```tsx
const useAuthStore = create<AuthStore>((set) => ({
  user: "",
  login: (username) => set(() => ({ user: username })),
  logout: () => set(() => ({ user: "" })),
}));

export default useAuthStore;
```

Now, let's go to our `LoginStatus` component. We don't need the custom hook we were using before, so let's delete it. Instead of dispatching an action for logging in, we now simply call the `login` function and pass the username—very simple. Similarly, when the user wants to log out, we just call `logout`.

```tsx
import useAuthStore from "./store";

const LoginStatus = () => {
  // const [user, setUser] = useState("");
  // const [user, dispatch] = useReducer(AuthReducer, "");
  // const { user, dispatch } = useAuth();
  const { user, login, logout } = useAuthStore();

  if (user)
    return (
      <>
        <div>
          <span className="mx-2">{user}</span>
          {/* <a onClick={() => dispatch({ type: "LOGOUT" })} href="#"> */}
          <a onClick={() => logout()} href="#">
            Logout
          </a>
        </div>
      </>
    );
  return (
    <div>
      <a
        // onClick={() => dispatch({ type: "LOGIN", user: "mosh.hamedani" })}
        onClick={() => login("mosh.hamedani")}
        href="#"
      >
        Login
      </a>
    </div>
  );
};

export default LoginStatus;
```

With this implementation, we don’t need any of the other building blocks like context, providers, or custom hooks. Beautiful! I love it.

Let’s see if this broke anything. We’ll build our project. Okay, we have a couple of errors. One is in `TaskList`, where we’re using the old `auth` hook. Let's replace this with our new store. So, we call `useAuthStore`. Let's build our project one more time.

There’s one more error in `App.tsx` where we’re trying to import `AuthProvider`. Let's go ahead and delete this import statement. With that, we can also simplify our component tree, as we don’t need to wrap it inside a custom provider.

That’s all we have to do. Now let’s test our application. Upon logging in, we can see the current user in the application bar and also in the `TaskList` component.

# Preventing Unnecessary Renders

One of the benefits of state management tools is that they give us more control over state management and allow our components to re-render only when specific pieces of data change. Let’s look at an example.

First, go to the store in the `counter` folder and add a new property called `max` of type `number`. Let's initialize the `max` property with a value of 5. Now, to demonstrate, we’ll modify the `reset` function so that instead of resetting the `counter`, it sets `max` to 10. While this change might not make much sense in a real-world scenario, it's just for demonstration purposes. So now we have two functions: one that updates the `counter` property and another that updates the `max` property.

Next, let's go to our `NavBar` component and add a `console.log` statement that logs `"Render NavBar"`.

Back in the browser, you'll notice that with our current implementation, the `NavBar` re-renders whenever any value in the `counter` store changes. For instance, if we increment the `counter`, the `NavBar` re-renders. Similarly, if we reset it (which updates the `max` property), the `NavBar` re-renders again.

However, what if we only want the `NavBar` to re-render when the `counter` property changes, because that's the value we want to display? We don’t care about changes to the `max` property in this component.

To achieve this, we can use a selector. When calling the hook, we pass an arrow function that selects the specific property we're interested in. Let’s use `s` as the parameter for the arrow function since it’s short and simple. The function would look like this: `s => s.counter`. This way, instead of getting the entire store object, we directly get the `counter` property.

```tsx

```

Now, this component is only dependent on the `counter` property and will re-render only if this property changes.

Back in the browser, if we increment the counter, the `NavBar` re-renders. But if we reset it, which sets the `max` property, nothing happens. The `NavBar` doesn’t re-render, as we intended.

This is how we can use selectors to prevent unnecessary re-renders and optimize our components.

# Inspecting Stores with Zustand DevTools

When building applications, it's often necessary to inspect our store, especially when something isn’t working as expected. Fortunately, there's a library called **`simple-zustand-devtools`** that allows us to do this. This library integrates with React DevTools, making it easy to inspect and debug our Zustand stores. Let me show you how to set it up.

First, we need to install the library. Open your terminal and run the following command:

```bash
npm install simple-zustand-devtools@1.1.0
```

Next, let's integrate it into our store. In the `counter` folder, open your store file. At the top of the file, import the `mountStoreDevtool` function from `simple-zustand-devtools`:

```typescript
import { mountStoreDevtool } from "simple-zustand-devtools";
```

Now, before exporting our custom hook, we need to check if we’re in a development environment. We do this by checking the `process.env.NODE_ENV` variable, which is a property of the Node.js `process` object. However, TypeScript might complain because it doesn’t recognize the `process` object by default. To fix this, we need to install the type declarations for Node.js:

```bash
npm install --save-dev @types/node
```

Now, back in the store file, add the following code before the export statement:

```typescript
if (process.env.NODE_ENV === "development") {
  mountStoreDevtool("Counter Store", useCounterStore);
}
```

Here’s what’s happening:

- We check if `NODE_ENV` is set to `development`. This ensures that DevTools are only activated in development mode.
- If true, we call `mountStoreDevtool` and pass two arguments:
  - The first argument is the name we want to give to our store, which will appear in React DevTools. In this case, we use `"Counter Store"`.
  - The second argument is our custom hook, `useCounterStore`, which represents the store we want to inspect.

Now, let's test it out. Open your browser and go to the React DevTools. Navigate to the **Components** tab, and you should see `"Counter Store"` listed. If you select it, you can inspect the contents of the store, including the `counter` property and the `increment` function.

You can even modify the values directly from DevTools. For example, setting the `counter` to 10 will cause your components to re-render with the new state.

And that’s it! You’ve now successfully integrated Zustand DevTools into your application, making debugging much easier.
