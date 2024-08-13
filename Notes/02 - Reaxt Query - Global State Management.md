# Global State Management

## Content

- Consolidating State Logic with a Reducer

## Keywords

- State/actions
- Context / Prop drilling
- React.createContext / TasksContext.provider
-

# Consolidating State Logic with a Reducer

A reducer is a function that allows us to centralize state updates in a component.

The name may be a little bit confusing but the underline concept is actually very simple, here's a counter component to see reducers in actions.

A reducer function should have 2 parameters, a state and an action, an action is an object that describe what the user is trying to do, so the reducer take the current state of an action an return the new state.

```tsx
// inside folder reducers: file: counterReducer.tsx
// properties needs to be annotated, the state var type is the same as
// our original state, and the type of action has no specific type
// but with convention we use an object with a type property that describes the action

interface Action {
  type: string;
}
// PS: annotate the function to detect
// potential errors when returning a value
const counterReducer = (state: number, action: Action): number => {
  if (action.type === "INCREMENT") return state + 1;
  if (action.type === "RESET") return 0;
  return state;
};

export default counterReducer;
```

PS: when the action is a different type, there is 2 solutions, some people argue that we should return the same state, others argue that we should throw an error saying "Action not supported". With type script we can prevent invalid actions so throwing an error is not really necessary

Back to our counter component, we use the reducer hook taht is defined in react, we call it and we give it 2 arguments:

- 1st arg: a reducer function.
- 2nd arg: the initial state.

similair to the state hook, this hook return an arry with 2 elements:

- 1st elem: current state.
- 2nd elem: a function for triggering changes, called dispatch.

By dispatching an action, you're telling react that the user is trying to increament/reset the counter, at that momment react will call the reducer and pass the current state as well as the action that we just dispatch, within the reducer we check the action and return the next state back to our component.

```tsx
import { useReducer, useState } from "react";
import counterReducer from "./reducers/counterReducer";

const Counter = () => {
  // const [value, setValue] = useState(0);
  const [value, dispatch] = useReducer(counterReducer, 0);

  return (
    <div>
      Counter ({value})
      <button
        onClick={() => dispatch({ type: "INCREMENT" })}
        className="btn btn-primary mx-1"
      >
        Increment
      </button>
      <button
        onClick={() => dispatch({ type: "RESET" })}
        className="btn btn-primary mx-1"
      >
        Reset
      </button>
    </div>
  );
};

export default Counter;
```

Now we have an issue, if we have a typo our code won't work correctly, but in ts it's very easy to fix, back to our reducer module, we can change the type of the action from string to a union of literal value, we can say the type can only be "INCREMENT or "RESET". if we set the type to any other values, the ts compiler will yell at us, that' why we said that with TS we don't need to throw an error.

```tsx
interface Action {
  type: "INCREMENT" | "RESET";
}
```

Now all of the state management logic is encapsulated inside this reducer function, our component is purely responsible for the markup, we have a good separation of concerns and we can potentially reuse this reducer with another component that works with the counter.

Here's the final code for our reducer:

```tsx
interface Action {
  type: "INCREMENT" | "RESET";
}

const counterReducer = (state: number, action: Action): number => {
  if (action.type === "INCREMENT") return state + 1;
  if (action.type === "RESET") return 0;
  return state;
};

export default counterReducer;
```

# Creating Complex Actions

Let's see a more complex example of an action that require extra data or payload, check the TaskList component inside the Global state management folder, we can centrelized and consalidate our state managment logic inside a reducer.

First we make a new reducer called **tasksReducer** inside our reducers folder. inside it we'll make an Action interface.

The problem here is we can't make a property of type Task because it only makes sense when adding a task, when deleting a task we don't need a task property but a task id. The Solution is to define different types of actions for various scenarios.

```tsx
// we defined two interfaces to cover both type of actions
// like that each interface has a different type of payload
interface AddTask {
  type: "ADD";
  task: Task;
}
interface DeleteTask {
  type: "DELETE";
  taskId: number;
}

// we define a type called Action which is a union of the two interfaces.
// so the action can be either AddTask or DeleteTask
type Action = AddTask | DeleteTask;
```

PS: we should annotate our reducer with its return type, so if you made a mistake, the TS compiler will complain.

```tsx
//
// tasksReducer
//
// we moved this interface from the component to our reducer
interface Task {
  id: number;
  title: string;
}

// we defined two interfaces to cover both type of actions
// like that each interface has a different type of payload
interface AddTask {
  type: "ADD";
  task: Task;
}
interface DeleteTask {
  type: "DELETE";
  taskId: number;
}
type Action = AddTask | DeleteTask;

// we renamed "state" to "tasks" for clarity
const taskReducer = (tasks: Task[], action: Action): Task[] => {
  // we used a switch statement instead o bunch of if statements
  switch (action.type) {
    case "ADD":
      return [action.task, ...tasks];
    case "DELETE":
      return tasks.filter((task) => action.taskId !== task.id);
    // when you use the dot operator to look at the properties of action
    // we only see taskId and type, and not the task property, bcs in
    // this context, the TS compiler knows that we're dealing with
    // a DeleteTask interface
    // same thing for the above case, TS compiler will know that we're
    // dealing with a AddTask interface

    default:
      return tasks;
  }
};

export default taskReducer;
```

```tsx
//
// taskList component
//
import { useReducer } from "react";
import taskReducer from "./reducers/tasksReducer";

const TaskList = () => {
  const [tasks, dispatch] = useReducer(taskReducer, []);

  return (
    <>
      <button
        onClick={() =>
          dispatch({
            type: "ADD",
            task: { id: Date.now(), title: "Task " + Date.now() },
          })
        }
        className="btn btn-primary my-3"
      >
        Add Task
      </button>
      <ul className="list-group">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <span className="flex-grow-1">{task.title}</span>
            <button
              className="btn btn-outline-danger"
              onClick={() =>
                dispatch({
                  type: "DELETE",
                  taskId: task.id,
                })
              }
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </>
  );
};

export default TaskList;
```

# Exercice: working with Reducers

```tsx
// logInReducer
interface LogIn {
  type: "LOGIN";
  user: string;
}

interface LogOut {
  type: "LOGOUT";
}

type LogAction = LogIn | LogOut;

const AuthReducer = (state: string, action: LogAction): string => {
  if (action.type === "LOGIN") return action.user;
  if (action.type === "LOGOUT") return "";
  return "";
};

export default AuthReducer;
```

```tsx
import { useReducer } from "react";
import AuthReducer from "./reducers/logInReducer";

const LoginStatus = () => {
  // const [user, setUser] = useState("");
  const [user, dispatch] = useReducer(AuthReducer, "");

  if (user)
    return (
      <>
        <div>
          <span className="mx-2">{user}</span>
          <a onClick={() => dispatch({ type: "LOGOUT" })} href="#">
            Logout
          </a>
        </div>
      </>
    );
  return (
    <div>
      <a
        onClick={() => dispatch({ type: "LOGIN", user: "mosh.hamedani" })}
        href="#"
      >
        Login
      </a>
    </div>
  );
};

export default LoginStatus;
```

# Sharing State using Context

In order to share a state between componenets, we need to lift the state up to the closest parent and pass it down as props to child components.

There is an issue with this, as our components tree grow bigger and more complex, we have to pass data through many components in the middle, this is called **`Prop drilling`** it's like we're drilling holes through a bunch of components just to pass data to the children, this is where we can use **`react context`**, with context we can share data without having to pass it down through many components in the middle, so our code will be cleaner and more maintaainable.

Let's see it in action. Both the state and reducer hooks are ways to maintain a state in a component. In the TaskList, if we want to share this state we have to lift it up to the app component and then share it with the components using a context.

`React Context:` it's like a truck for transporting a box, inside that box we can have some states. but first you're gonna define the shape of that box.

First we add this line to the app component, then we create a folder called **context**, and add a file called **tasksContext.ts**.

```tsx
const [tasks, dispatch] = useReducer(taskReducer, []);
```

Now let's define the shape of our context, we're gonna provide both of **tasks** and **dispatch** objects so we can manipulate tasks in our TaskList component.

```tsx
import { Dispatch } from "react";
import { Task } from "../reducer/taskReducer";

interface TaskContextType {
  tasks: Task[];
  dispatch: Dispatch<TaskAction>;
  // that's the object taht we're going to transport using react context
}
```

PS: Dispatch is a type that is defined in react that represent a function that takes an argument of type `A` (which is a generic type parameter) an returns void.

After defining the interface, we call **`React.createContext`** and provide the type of objects that we wanna share (in this case TaskContextType). we give it a default value, most of the time it's not needed so we have 2 options:

- we can pass null but we have to make the type _TaskContextType_ or null which doesn't make sense since here we wanna define the type of objects we wanna share, it doesn't make sense to share null.

- the other option is to pass an empty object and use **as** keyword to tell TS compiler to treat that object as an instance of TaskContextType.

```tsx
// using this line we create a context which is a type
// so we defined a constant called _taskContext_
const TaskContext = React.createContext<TaskContextType>({} as TaskContextType);

// don't forget to export it
export default TaskContext;
```

back to our app component where we have our local state (tasks, dispatch), after adding the Navigation bar and Home Page component, we use our context to share the **tasks** and **dispatch** function in our component tree.

we wrap our 2 components with a **`TasksContext.provider`** and we supply it with a value, that value will replace the default value that we supplied in the **tasksContext.ts** file where we created the context, that's why most of the time we don't need a value there.

Now we should pass an object, in that object we should add an array of tasks and the dispatch function. Now this **context** is like the truck transporting this box, we can access this box (the { tasks, dispatch } object) anywhere in our component tree using the context hook.

```tsx
import "./App.css";
import HomePage from "./routing/HomePage";
import NavBar from "./routing/NavBar";

function App() {
  const [tasks, dispatch] = useReducer(taskReducer, []);

  return (
    // no need for fragment since we're using a context
    <TasksContext.provider value={{ tasks, dispatch }}>
      <NavBar />
      <HomePage />
    </TasksContext.provider>
  );
}

export default App;
```

To see that in action, let's go back to our TaskList component, here we need the dispatch function, and the tasks array, so we use the **`Context hook`** that is defined in react and provide the type of context which **TasksContext** here.

That returns a **context** object that has 2 properties (dispatch and tasks) so that is the box that u'r accessing in that component, now we can destructure it to grab these 2 properties, now the rest of the code is exactly like before. But we shared our tasks and dispatch object without props drilling.

```tsx
import TaskContext from "./contexts/TasksContext";

// context object contains both dispatch and tasks objects
// const context = useContext(TaskContext);

const { tasks, dispatch } = useContext(TaskContext);
// ...
// ..
// .
```

using the same technique we can go to the navigaton bar and access our tasks array. here's the full code for our components:

```tsx
// TasksContext.ts file
import { createContext } from "react";
import { Task, TaskAction } from "../reducers/tasksReducer";

interface TasksContextType {
  tasks: Task[];
  dispatch: React.Dispatch<TaskAction>;
}

const TasksContext = createContext({} as TasksContextType);

export default TasksContext;
```

```tsx
// App component
import { useReducer } from "react";
import "./App.css";
import TaskContext from "./state-management/contexts/TasksContext";
import taskReducer from "./state-management/reducers/tasksReducer";
import HomePage from "./state-management/HomePage";
import NavBar from "./state-management/NavBar";

function App() {
  const [tasks, dispatch] = useReducer(taskReducer, []);

  return (
    <TaskContext.Provider value={{ tasks, dispatch }}>
      <NavBar />
      <HomePage />
    </TaskContext.Provider>
  );
}

export default App;
```

```tsx
// TaskList component
import { useContext } from "react";
import TaskContext from "./contexts/TasksContext";

const TaskList = () => {
  // const [tasks, dispatch] = useReducer(taskReducer, []);
  const { tasks, dispatch } = useContext(TaskContext);

// the rest is the same
// ...
// ..
// .
```

# 44 - Exercice: Working with Context.mp4

```tsx
import { useReducer } from "react";
import "./App.css";
import TaskContext from "./state-management/contexts/TasksContext";
import HomePage from "./state-management/HomePage";
import NavBar from "./state-management/NavBar";
import taskReducer from "./state-management/reducers/tasksReducer";
import AuthReducer from "./state-management/reducers/logInReducer";
import AuthContext from "./state-management/contexts/userContext";

function App() {
  const [tasks, tasksDispatch] = useReducer(taskReducer, []);
  const [user, authDispatch] = useReducer(AuthReducer, "");

  return (
    <TaskContext.Provider value={{ tasks, dispatch: tasksDispatch }}>
      <AuthContext.Provider value={{ user, dispatch: authDispatch }}>
        <NavBar />
        <HomePage />
      </AuthContext.Provider>
    </TaskContext.Provider>
  );
}

export default App;
```

```tsx
// LoginStatus.tsx file
import { useContext } from "react";
import AuthContext from "./contexts/UserContext";

const LoginStatus = () => {
  // const [user, setUser] = useState("");
  // const [user, dispatch] = useReducer(AuthReducer, "");
  const { user, dispatch } = useContext(AuthContext);

  if (user)
    return (
      <>
        <div>
          <span className="mx-2">{user}</span>
          <a onClick={() => dispatch({ type: "LOGOUT" })} href="#">
            Logout
          </a>
        </div>
      </>
    );
  return (
    <div>
      <a
        onClick={() => dispatch({ type: "LOGIN", user: "mosh.hamedani" })}
        href="#"
      >
        Login
      </a>
    </div>
  );
};

export default LoginStatus;
```

# Debuggin with React dev tools

You can see the state of your context using react dev tool, all you have to do is open the component tab in the chrome dev tools, on the top of the components tree you have three contexts,all of them belongs to reactQuery, this is how reactQuery provide query clients and other objects to our components, bellow that we have our app component, and inside we have two context, you can see its values by clicking on them and look at the props at the right side, you can expand the value to check the dispatch and state objects.

# Creating a Custom Provider

In the app component we're maintaining 2 types of states, the list of tasks and the current user, because of this implementation we had to rename our dispatch functions and give them unique names which is a little bit ugly, here's how we can make it cleaner and more modular.

We're going to move the Auth piece of state into a custom provider component, create a new file called _AuthProvider.tsx_, this is the same pattern that you see in react query and many other libraries, here we create a new component to maintain the current user so we move that piece of state from the app component into our new component, now we should return an **AuthContext.provider** and set it's value with an object with two properties (user and our dispatch function).

In between these tags we should include the rest of our component tree as childs.

```tsx
// AuthProvider.tsx
import { ReactNode, useReducer } from "react";
import AuthReducer from "../reducers/logInReducer";
import AuthContext from "../contexts/UserContext";

interface Props {
  children: ReactNode;
}

const AuthProvider = ({ children }: Props) => {
  // we can rename it into dispatch because it's the only dispatch func
  const [user, dispatch] = useReducer(AuthReducer, "");
  return (
    <AuthContext.Provider value={{ user, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

//
// TaskProvider.tsx
import { ReactNode, useReducer } from "react";
import taskReducer from "../reducers/tasksReducer";
import TasksContext from "../contexts/TasksContext";

interface Props {
  children: ReactNode;
}
function TaskProvider({ children }: Props) {
  const [tasks, dispatch] = useReducer(taskReducer, []);

  return (
    <TasksContext.Provider value={{ tasks, dispatch }}>
      {children}
    </TasksContext.Provider>
  );
}

export default TaskProvider;
```

PS: i did add **TaskProvider** too.

in our app component we replace the old AuthContext with our custom provider.

```tsx
// App.tsx
import "./App.css";
import HomePage from "./state-management/HomePage";
import NavBar from "./state-management/NavBar";
import AuthProvider from "./state-management/providers/AuthProvider";
import TaskProvider from "./state-management/providers/TaskProvider";

function App() {
  return (
    <TaskProvider>
      <AuthProvider>
        <NavBar />
        <HomePage />
      </AuthProvider>
    </TaskProvider>
  );
}

export default App;
```

With this implementation our code is cleaner, more modular and reusable, if we decide to move that Auth provider somewhere else in our components tree or different application, we can simply grab everything here and move it around, so that component has both the state and the context provider

# Creating a Hook to Access Context

Jiust like we can create a custom provider, we can create a custom hook for accessing a given context, we have seen this technique before in react qeury and probably many other libraries, in react query we have custom hook caled QueryClient to access teh shared query client, we can use the same technique here to access the **AuthContext**.

We first add a new folder called **hooks** with a new file called **useAuth.ts**, we define a function whcih in its body we call the Context hook and provide **AuthContext**.

Back to our **LoginStatus** and replace useContext with **useAuth**, with this implementation we don't have to think about a particualr context, we simply use our hook to get the shared objects, with that we can clean up our import statement.

```tsx
// Auth Hook (useAuth.ts)
import { useContext } from "react";
import AuthContext from "../contexts/UserContext";

const useAuth = () => useContext(AuthContext);

export default useAuth;
```

```tsx
// LoginStatus component
import useAuth from "./hooks/useAuth";

const LoginStatus = () => {
  const { user, dispatch } = useAuth();
  // ...
  // ...
```

# Exercice: Creating a Provider

PS: Already did that in the first exercice (Check: Creating a Custom Provider)

# Organizing Code for Scalability and Maintainability
