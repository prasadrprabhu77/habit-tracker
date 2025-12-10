// src/pages/TodayJournal.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthProvider";
import { useTheme } from "../context/ThemeProvider";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { Check, X, Calendar, BarChart2 } from "lucide-react";

/**
 * TodayJournal (A3 - dashboard style cards)
 *
 * Data:
 * - Habits: users/{uid}/habits/{habitId}
 * - Daily:   users/{uid}/dailyHabits/{YYYY-MM-DD}
 *
 * dailyDoc shape:
 * {
 *   date: "2025-12-04",
 *   completed: { "<habitId>": true, "<habitId2>": false },
 *   createdAt: Timestamp,
 *   lastUpdate: Timestamp
 * }
 */

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { theme } = useTheme();

  const [habits, setHabits] = useState([]); // list of habit docs {id, ...data}
  const [daily, setDaily] = useState(null); // today's document data
  const [loading, setLoading] = useState(true);

  // helper: today's id (YYYY-MM-DD)
  const todayId = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }, []);

  // subscribe to user's habits in real-time
  useEffect(() => {
    if (!currentUser) return;
    const habitsRef = collection(db, "users", currentUser.uid, "habits");
    const q = query(habitsRef, orderBy("createdAt", "desc"));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setHabits(list);
        setLoading(false);
      },
      (err) => {
        console.error("habits onSnapshot error:", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [currentUser]);

  // subscribe to today's daily doc in real-time; create if missing
  useEffect(() => {
    if (!currentUser) return;

    const dailyRef = doc(db, "users", currentUser.uid, "dailyHabits", todayId);

    const ensureAndSubscribe = async () => {
      try {
        const snapshot = await getDoc(dailyRef);
        if (!snapshot.exists()) {
          // create initial doc with empty completed map
          await setDoc(dailyRef, {
            date: todayId,
            completed: {},
            createdAt: serverTimestamp(),
            lastUpdate: serverTimestamp(),
          });
        }
      } catch (err) {
        console.error("error creating daily doc:", err);
      }

      const unsub = onSnapshot(
        dailyRef,
        (snap) => {
          setDaily(snap.exists() ? snap.data() : { date: todayId, completed: {} });
        },
        (err) => console.error("daily onSnapshot error:", err)
      );

      return unsub;
    };

    const cleanupPromise = ensureAndSubscribe();

    // we return nothing synchronous; the onSnapshot unsubscribe will be returned by inner promise
    return () => {
      // ensure unsub if promise returned an unsubscribe
      cleanupPromise.then((maybeUnsub) => {
        if (typeof maybeUnsub === "function") maybeUnsub();
      });
    };
  }, [currentUser, todayId]);

  // toggle completion for a habit (true/false) -> update Firestore
  const toggleCompletion = async (habitId, value) => {
    if (!currentUser) {
      alert("Please log in to mark completion.");
      return;
    }
    const dailyRef = doc(db, "users", currentUser.uid, "dailyHabits", todayId);
    try {
      await updateDoc(dailyRef, {
        [`completed.${habitId}`]: value,
        lastUpdate: serverTimestamp(),
      });
    } catch (err) {
      // if update fails (e.g. doc doesn't exist), set it
      console.error("update daily failed, trying setDoc fallback:", err);
      try {
        await setDoc(
          dailyRef,
          {
            date: todayId,
            completed: { [habitId]: value },
            createdAt: serverTimestamp(),
            lastUpdate: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (err2) {
        console.error("fallback setDoc failed:", err2);
        alert("Failed to update completion status.");
      }
    }
  };

  // Progress calculations
  const totalHabits = habits.length;
  const completedCount = (() => {
    if (!daily || !daily.completed) return 0;
    return habits.reduce((acc, h) => (daily.completed[h.id] ? acc + 1 : acc), 0);
  })();
  const progressPct = totalHabits === 0 ? 0 : Math.round((completedCount / totalHabits) * 100);

  // priority -> color left border
  const priorityBorder = (priority) => {
    switch ((priority || "").toLowerCase()) {
      case "high":
        return "border-l-4 border-red-500";
      case "moderate":
      case "medium":
        return "border-l-4 border-yellow-500";
      case "low":
      default:
        return "border-l-4 border-green-500";
    }
  };

  if (!currentUser) {
    return (
      <div className="p-6">
        <p>Please log in to see today's habits.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2
            className={`text-2xl font-bold ${
              theme === "dark" ? "text-white" : "text-gray-900"
            } flex items-center gap-2`}
          >
            <Calendar size={20} /> Today — {todayId}
          </h2>
          <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
            Your habits for today. Mark them complete to build your streaks.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              {completedCount} / {totalHabits}
            </div>
            <div className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
              completed
            </div>
          </div>

          <div className="w-48">
            <div className="w-full h-3 rounded-full bg-gray-200 overflow-hidden">
              <div
                className={`h-3 rounded-full ${
                  theme === "dark" ? "bg-green-400" : "bg-green-600"
                }`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className={`text-xs mt-1 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
              {progressPct}% complete
            </div>
          </div>
        </div>
      </div>

      {/* Cards grid */}
      <div
        className={`grid gap-4 ${
          totalHabits === 0 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        }`}
      >
        {loading ? (
          <div className={`${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>Loading...</div>
        ) : totalHabits === 0 ? (
          <div
            className={`p-6 rounded-lg shadow-md ${theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}
          >
            <div className="flex items-center gap-3">
              <BarChart2 />
              <div>
                <div className="font-bold">No habits yet</div>
                <div className="text-sm text-gray-500">Add habits in Manage Habits to see them here.</div>
              </div>
            </div>
          </div>
        ) : (
          habits.map((h) => {
            const isDone = daily?.completed && !!daily.completed[h.id];
            return (
              <div
                key={h.id}
                className={`rounded-lg p-4 shadow-md ${priorityBorder(h.priority)} ${
                  theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">{h.name}</h3>
                      <div className="text-sm px-2 py-0.5 rounded-full bg-opacity-10" >
                        <span className={`${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>{h.frequency}</span>
                      </div>
                    </div>

                    <p className={`mt-2 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                      {h.description || "No description"}
                    </p>

                    <div className="mt-3 flex items-center gap-3">
                      <div className="text-xs">
                        <div className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                          Priority: <span className="font-medium">{h.priority}</span>
                        </div>
                        <div className={`${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                          Category: <span className="font-medium">{h.category}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action / Status */}
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isDone ? (theme === "dark" ? "bg-green-600" : "bg-green-500") : (theme === "dark" ? "bg-gray-700" : "bg-gray-100")
                      }`}
                    >
                      {isDone ? <Check size={20} /> : <X size={20} />}
                    </div>

                    <button
                      onClick={() => toggleCompletion(h.id, !isDone)}
                      className={`px-3 py-1 rounded-md font-medium ${
                        isDone
                          ? "bg-red-500 text-white hover:bg-red-600"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {isDone ? "Undo" : "Mark Complete"}
                    </button>
                  </div>
                </div>

                {/* small footer */}
                <div className="mt-4 text-xs flex items-center justify-between">
                  <div className={`${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                    Reminder: {h.reminderTime || "—"}
                  </div>
                  <div className={`${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                    Start: {h.startDate || "—"}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Dashboard;
