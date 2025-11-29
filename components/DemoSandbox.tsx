import React, { useEffect, useRef, useState } from 'react';
import MyReact from '../lib/MyReactImpl';

/**
 * DEMO EXPLANATION:
 * The code below is a fully functional "Todo List" application.
 * It is NOT using React.createElement. It is using MyReact.createElement.
 * 
 * It demonstrates:
 * 1. useState (Adding items, toggling completion, filtering)
 * 2. useEffect (Updating the document title based on incomplete count)
 * 3. Conditional Rendering
 * 4. List Rendering (Mapping arrays)
 * 5. Style Objects & Event Handling
 */

const DemoSandbox: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    // --- MyReact Application Components ---

    function TodoItem({ todo, toggleTodo, removeTodo }: any) {
      return MyReact.createElement(
        "div",
        { 
          className: "flex items-center justify-between p-3 mb-2 bg-slate-800 rounded border border-slate-700 hover:border-indigo-500/50 transition-colors group" 
        },
        MyReact.createElement(
          "div",
          { className: "flex items-center gap-3" },
          MyReact.createElement("input", {
            type: "checkbox",
            checked: todo.completed,
            onclick: () => toggleTodo(todo.id),
            className: "w-5 h-5 rounded border-slate-600 cursor-pointer accent-indigo-500"
          }),
          MyReact.createElement(
            "span",
            { 
              style: { 
                textDecoration: todo.completed ? "line-through" : "none",
                color: todo.completed ? "#64748b" : "#e2e8f0",
                cursor: "pointer"
              },
              onClick: () => toggleTodo(todo.id)
            },
            todo.text
          )
        ),
        MyReact.createElement(
          "button",
          {
            onclick: () => removeTodo(todo.id),
            className: "text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity px-2"
          },
          "×"
        )
      );
    }

    function TodoApp() {
      // 1. Hook: useState
      const [todos, setTodos] = MyReact.useState([
        { id: 1, text: "Learn React Fiber", completed: true },
        { id: 2, text: "Build MyReact", completed: false },
        { id: 3, text: "Understand Hooks", completed: false },
      ]);
      const [filter, setFilter] = MyReact.useState("all"); // all | active | completed
      const [inputValue, setInputValue] = MyReact.useState("");

      // 2. Hook: useEffect
      // Updates the document title whenever todos change
      MyReact.useEffect(() => {
        const remaining = todos.filter((t: any) => !t.completed).length;
        console.log(`[MyReact Effect] Remaining todos: ${remaining}`);
        // We won't actually change document.title to avoid confusing the user in the main app,
        // but we'll simulate a side effect here.
        
        return () => {
            console.log("[MyReact Cleanup] Effect cleaned up");
        };
      }, [todos]);

      const addTodo = () => {
        if (!inputValue) return;
        const newTodo = {
          id: Date.now(),
          text: inputValue,
          completed: false,
        };
        setTodos((prev: any[]) => [...prev, newTodo]);
        setInputValue("");
      };

      const toggleTodo = (id: number) => {
        setTodos((prev: any[]) =>
          prev.map((t: any) =>
            t.id === id ? { ...t, completed: !t.completed } : t
          )
        );
      };

      const removeTodo = (id: number) => {
        setTodos((prev: any[]) => prev.filter((t: any) => t.id !== id));
      };

      const handleInput = (e: any) => {
        setInputValue(e.target.value);
      };

      const filteredTodos = todos.filter((t: any) => {
        if (filter === "active") return !t.completed;
        if (filter === "completed") return t.completed;
        return true;
      });

      return MyReact.createElement(
        "div",
        { className: "w-full max-w-md mx-auto font-sans" },
        
        // Header
        MyReact.createElement(
            "div",
            { className: "mb-6 text-center" },
            MyReact.createElement("h1", { className: "text-3xl font-bold text-white mb-2" }, "MyReact Todo"),
            MyReact.createElement("p", { className: "text-indigo-400 text-sm" }, "Powered by Custom Fiber Engine")
        ),

        // Input
        MyReact.createElement(
          "div",
          { className: "flex gap-2 mb-6" },
          MyReact.createElement("input", {
            value: inputValue,
            oninput: handleInput,
            placeholder: "What needs to be done?",
            className: "flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded text-white focus:outline-none focus:border-indigo-500 transition-colors"
          }),
          MyReact.createElement(
            "button",
            {
              onclick: addTodo,
              className: "px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded transition-colors"
            },
            "Add"
          )
        ),

        // Filters
        MyReact.createElement(
            "div",
            { className: "flex gap-2 mb-4 justify-center text-xs font-medium" },
            ["all", "active", "completed"].map((f) => 
                MyReact.createElement(
                    "button",
                    {
                        onclick: () => setFilter(f),
                        className: `px-3 py-1 rounded capitalize ${
                            filter === f 
                            ? "bg-slate-700 text-white" 
                            : "text-slate-500 hover:text-slate-300"
                        }`
                    },
                    f
                )
            )
        ),

        // List
        MyReact.createElement(
          "div",
          {},
          filteredTodos.length === 0
            ? MyReact.createElement("div", { className: "text-center text-slate-600 py-8" }, "No todos found")
            : filteredTodos.map((todo: any) =>
                MyReact.createElement(TodoItem, {
                  key: todo.id,
                  todo,
                  toggleTodo,
                  removeTodo
                })
              )
        ),

        // Footer
        MyReact.createElement(
            "div",
            { className: "mt-8 pt-4 border-t border-slate-800 text-center" },
            MyReact.createElement("span", { className: "text-slate-500 text-xs" }, `${todos.filter((t: any) => !t.completed).length} items left`)
        )
      );
    }

    // --- Mounting ---
    containerRef.current.innerHTML = "";
    MyReact.render(MyReact.createElement(TodoApp, {}), containerRef.current);

  }, [key]);

  return (
    <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                MyReact Output
            </h2>
            <button 
                onClick={() => setKey(k => k + 1)}
                className="text-xs px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
            >
                Remount
            </button>
        </div>
        
        <div className="flex-1 bg-black/40 rounded-xl border border-slate-800 p-8 relative overflow-y-auto">
             {/* The Mounting Point for MyReact */}
            <div ref={containerRef} id="my-react-root"></div>
        </div>
    </div>
  );
};

export default DemoSandbox;