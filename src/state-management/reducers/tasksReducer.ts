// we moved this interface from the component to our reducer
export interface Task {
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
export type TaskAction = AddTask | DeleteTask;

// we renamed "state" to "tasks" for clarity
const taskReducer = (tasks: Task[], action: TaskAction): Task[] => {
  // we used a switch statement instead o bunch of if statements
  switch (action.type) {
    case "ADD":
      return [action.task, ...tasks];
    case "DELETE":
      return tasks.filter((task) => action.taskId !== task.id);

    default:
      return tasks;
  }
};

export default taskReducer;
