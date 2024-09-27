import { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore"; // Use setDoc instead of addDoc
import { useNavigate } from "react-router-dom";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState(null); // To display errors
  const [loading, setLoading] = useState(false); // For loading state
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors
    setLoading(true); // Set loading to true
    try {
      // Create the user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save the user data to Firestore using the user's uid as the document ID
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        username: username,
        role: "user", // default role
        createdAt: new Date(), // Store creation time
      });

      // Navigate to the dashboard after successful signup
      navigate("/dashboard");
    } catch (error) {
      console.error("Error signing up:", error);

      // Specific error messages for better UX
      if (error.code === "auth/email-already-in-use") {
        setError("Email is already in use. Please try another one.");
      } else if (error.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else if (error.code === "auth/invalid-email") {
        setError("Invalid email format.");
      } else {
        setError("Failed to create an account. Please try again.");
      }
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <form onSubmit={handleSignup} className="max-w-md p-6 mx-auto mt-10 bg-white rounded shadow-md">
      <h2 className="mb-6 text-3xl font-bold text-center">Sign Up</h2>

      {error && <p className="mb-4 text-red-500">{error}</p>} {/* Display error if present */}

      <input
        type="text"
        className="w-full p-3 mb-4 border rounded"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        aria-label="Username"
      />
      <input
        type="email"
        className="w-full p-3 mb-4 border rounded"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        aria-label="Email"
      />
      <input
        type="password"
        className="w-full p-3 mb-4 border rounded"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        aria-label="Password"
      />
      
      <button
        type="submit"
        className={`w-full px-4 py-2 text-white bg-green-600 rounded ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        disabled={loading}
      >
        {loading ? "Signing up..." : "Sign Up"}
      </button>
    </form>
  );
}

export default Signup;
