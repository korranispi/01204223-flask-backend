import { useEffect, useState } from "react";
import TodoItem from "./TodoItem";

function TodoList({ apiUrl }) {
  const [todos, setTodos] = useState([]);

  // โหลดข้อมูลครั้งแรก
  useEffect(() => {
    fetch(apiUrl)
      .then((res) => res.json())
      .then((data) => setTodos(data))
      .catch((err) => console.error(err));
  }, [apiUrl]);

  // ✅ toggle done (อันนี้สำคัญมากสำหรับ test)
  const toggleDone = (id) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id
          ? { ...todo, done: !todo.done }
          : todo
      )
    );
  };

  // ✅ ลบ todo
  const deleteTodo = (id) => {
    setTodos((prevTodos) =>
      prevTodos.filter((todo) => todo.id !== id)
    );
  };

  // ✅ เพิ่ม comment
  const addNewComment = (todoId, message) => {
    if (!message.trim()) return;

    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === todoId
          ? {
              ...todo,
              comments: [
                ...(todo.comments || []),
                {
                  id: Date.now(),
                  message,
                },
              ],
            }
          : todo
      )
    );
  };

  return (
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
  );
}

export default TodoList;