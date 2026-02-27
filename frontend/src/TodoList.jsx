import { useEffect, useState } from "react";
import TodoItem from "./TodoItem";
import { useAuth } from "./context/AuthContext";

function TodoList({ apiUrl }) {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const { accessToken } = useAuth();

  // โหลด todos จาก backend
  const fetchTodos = async () => {
    try {
      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch todos");

      const data = await response.json();
      setTodos(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchTodos();
    }
  }, [accessToken]);

  // ✅ เพิ่ม todo (POST)
  const addTodo = async () => {
    if (!newTodo.trim()) return;

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          title: newTodo,
          done: false,
        }),
      });

      if (!response.ok) throw new Error("Failed to add todo");

      const createdTodo = await response.json();
      setTodos((prev) => [...prev, createdTodo]);
      setNewTodo("");
    } catch (error) {
      console.error(error);
    }
  };

  // ✅ Toggle done (PATCH)
  const toggleDone = async (id) => {
    try {
      const response = await fetch(`${apiUrl}${id}/toggle/`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) throw new Error("Failed to toggle");

      const updatedTodo = await response.json();

      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === id ? updatedTodo : todo
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  // ✅ Delete todo (DELETE)
  const deleteTodo = async (id) => {
    try {
      const response = await fetch(`${apiUrl}${id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete");

      setTodos((prev) =>
        prev.filter((todo) => todo.id !== id)
      );
    } catch (error) {
      console.error(error);
    }
  };

  // ✅ เพิ่ม comment (POST)
  const addNewComment = async (todoId, message) => {
    if (!message.trim()) return;

    try {
      const response = await fetch(
        `${apiUrl}${todoId}/comments/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ message }),
        }
      );

      if (!response.ok) throw new Error("Failed to add comment");

      const newComment = await response.json();

      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === todoId
            ? {
                ...todo,
                comments: [...(todo.comments || []), newComment],
              }
            : todo
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "12px" }}>
        <input
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add new todo"
        />
        <button onClick={addTodo}>Add</button>
      </div>

      <ul>
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            toggleDone={toggleDone}
            deleteTodo={deleteTodo}
            addNewComment={addNewComment}
          />
        ))}
      </ul>
    </div>
  );
}

export default TodoList;