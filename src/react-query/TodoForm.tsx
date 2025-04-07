import { useRef } from "react";
import useAddTodo from "./hooks/useAddTodo";
import { Todo } from "./services/todoService";

interface AddTodoContext {
  prvsTodos: Todo[];
}

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

          console.log("adding todo");
          if (ref.current && ref.current.value)
            addTodo.mutate({
              id: 0, // generated on the server
              title: ref.current?.value,
              userId: 1, // just an example
              completed: false,
            });
          else console.log("empty todo");
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

export default TodoForm;
