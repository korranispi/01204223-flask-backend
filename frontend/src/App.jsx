import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./LoginForm";
import TodoList from "./TodoList";

function AppContent() {
  const { accessToken, logout } = useAuth();

  if (!accessToken) {
    return (
      <Login loginUrl="http://localhost:5000/api/login/" />
    );
  }

  return (
    <div>
      <button onClick={logout}>Logout</button>
      <TodoList apiUrl="http://localhost:5000/api/todos/" />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;