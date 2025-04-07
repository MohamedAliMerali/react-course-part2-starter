// PS: no need for that when working with zustand

// properties needs to be annotated, the state var type is the same as
// our original state, and the type of action has no specific type
// but with convention we use an object with a type property that describes the action

interface Action {
  type: "INCREMENT" | "RESET";
}
// PS: annotate the function to detect
// potential errors when returning a value
const counterReducer = (state: number, action: Action): number => {
  if (action.type === "INCREMENT") return state + 1;
  if (action.type === "RESET") return 0;
  return state;
};

export default counterReducer;
