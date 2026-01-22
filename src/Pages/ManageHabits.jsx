import React, { useState, useEffect } from "react";
import AddHabit from "../components/AddHabit";
import { useTheme } from "../context/ThemeProvider";
import { useAuth } from "../context/AuthProvider";
import { Edit, Trash2 } from "lucide-react";
import { db } from "../firebase";
import { collection, getDocs, query, orderBy, doc, deleteDoc } from "firebase/firestore";

const ManageHabits = () => {
  const { theme } = useTheme();
  const { currentUser } = useAuth(); // ✅ get logged-in user
  const [habits, setHabits] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);

  // Fetch habits when component mounts or user changes
  useEffect(() => {
    if (!currentUser) return;

    const fetchHabits = async () => {
      try {
        const habitsRef = collection(db, "users", currentUser.uid, "habits");
        const q = query(habitsRef, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const fetchedHabits = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setHabits(fetchedHabits);
      } catch (error) {
        console.error("Error fetching habits:", error);
      }
    };

    fetchHabits();
  }, [currentUser]);

  const handleAddHabit = (habit) => {
    if (editingHabit) {
      setHabits((prev) => prev.map((h) => (h.id === habit.id ? habit : h)));
      setEditingHabit(null);
    } else {
      setHabits((prev) => [habit, ...prev]); // add to top
    }
  };

  const handleDelete = async (id) => {
    if (!currentUser) return;

    try {

      const habitRef = doc(db, "users", currentUser.uid, "habits", id);
      await deleteDoc(habitRef);

      setHabits((prev) => prev.filter((habit) => habit.id !== id));
    } catch (error) {
      console.error("Error deleting habit:", error);
      alert("Failed to delete habit.");
    }
  };

  const handleEdit = (habit) => {
    setEditingHabit(habit);
    setShowForm(true);
  };

  const formatDate = (ts) => {
    if (!ts) return "--";
    if (typeof ts === "string") return ts;
    if (ts.toDate) return ts.toDate().toLocaleDateString();
    if (ts instanceof Date) return ts.toLocaleDateString();
    return String(ts);
  };

return (
  <div className="p-3 sm:p-4 md:p-6">
    {/* Header */}
    <h1 className="text-lg sm:text-xl md:text-2xl font-bold mb-4">
      Manage Habits
    </h1>

    {/* Add button */}
    <button
      onClick={() => setShowForm(true)}
      className="px-4 py-2 bg-green-600 text-white rounded mb-4 text-sm sm:text-base"
    >
      + Add Habit
    </button>

    {showForm && (
      <AddHabit
        onClose={() => {
          setShowForm(false);
          setEditingHabit(null);
        }}
        onSave={handleAddHabit}
        initialData={editingHabit}
      />
    )}

    {habits.length > 0 ? (
      <div className="overflow-x-auto rounded-xl">
        <table
          className={`min-w-[1000px] w-full border-collapse shadow-xl rounded-xl overflow-hidden
            ${
              theme === "dark"
                ? "bg-gray-900 text-gray-200"
                : "bg-white text-gray-900"
            }`}
        >
          <thead>
            <tr
              className={`${
                theme === "dark"
                  ? "bg-gray-800 text-gray-300 border-b border-gray-700"
                  : "bg-gray-200 text-gray-800 border-b border-gray-300"
              }`}
            >
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left hidden md:table-cell">
                Description
              </th>
              <th className="p-3 text-left">Priority</th>
              <th className="p-3 text-left hidden sm:table-cell">
                Frequency
              </th>
              <th className="p-3 text-left hidden lg:table-cell">
                Start Date
              </th>
              <th className="p-3 text-left hidden lg:table-cell">
                End Date
              </th>
              <th className="p-3 text-left hidden md:table-cell">
                Category
              </th>
              <th className="p-3 text-left hidden xl:table-cell">
                Reminder
              </th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {habits.map((habit, idx) => (
              <tr
                key={habit.id}
                className={`transition-all
                  ${
                    theme === "dark"
                      ? idx % 2 === 0
                        ? "bg-gray-900"
                        : "bg-gray-800"
                      : idx % 2 === 0
                      ? "bg-white"
                      : "bg-gray-50"
                  }
                  ${
                    theme === "dark"
                      ? "hover:bg-gray-700"
                      : "hover:bg-blue-100"
                  }`}
              >
                <td className="p-3 text-sm font-medium">
                  {habit.name}
                </td>

                <td className="p-3 text-sm hidden md:table-cell">
                  {habit.description}
                </td>

                <td className="p-3 text-sm">{habit.priority}</td>

                <td className="p-3 text-sm hidden sm:table-cell">
                  {habit.frequency}
                </td>

                <td className="p-3 text-sm hidden lg:table-cell">
                  {formatDate(habit.startDate)}
                </td>

                <td className="p-3 text-sm hidden lg:table-cell">
                  {formatDate(habit.endDate) || "N/A"}
                </td>

                <td className="p-3 text-sm hidden md:table-cell">
                  {habit.category}
                </td>

                <td className="p-3 text-sm hidden xl:table-cell">
                  {habit.reminderTime || "None"}
                </td>

                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => handleEdit(habit)}
                    className="w-8 h-8 sm:w-9 sm:h-9 bg-yellow-500 hover:bg-yellow-600 rounded-full shadow text-white transition flex items-center justify-center"
                  >
                    <Edit size={16} />
                  </button>

                  <button
                    onClick={() => handleDelete(habit.id)}
                    className="w-8 h-8 sm:w-9 sm:h-9 bg-red-600 hover:bg-red-700 rounded-full shadow text-white transition flex items-center justify-center"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <p className="text-sm text-gray-500">No habits yet. Add some!</p>
    )}
  </div>
);

};

export default ManageHabits;
