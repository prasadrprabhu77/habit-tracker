import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthProvider";
import { useTheme } from "../context/ThemeProvider";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  doc,
} from "firebase/firestore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#4F46E5", "#22C55E", "#F97316", "#EC4899", "#06B6D4", "#EAB308"];

// helper: parse "YYYY-MM-DD" -> Date
const parseDate = (str) => {
  if (!str) return null;
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
};

// helper: format Date -> "YYYY-MM-DD"
const formatDateId = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// get array of last N days (Date objects), from oldest -> newest
const getLastNDays = (n) => {
  const days = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d);
  }
  return days;
};

// get all days of current month as Date[]
const getCurrentMonthDays = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const first = new Date(year, month, 1);
  const days = [];
  let d = new Date(first);
  while (d.getMonth() === month) {
    days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
};

const CheckProgress = () => {
  const { currentUser } = useAuth();
  const { theme } = useTheme();

  const [habits, setHabits] = useState([]);           // [{id, name, category, priority, startDate, endDate, ...}]
  const [dailyDocs, setDailyDocs] = useState([]);     // [{date: "YYYY-MM-DD", completed: { habitId: bool }}]
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const fetchData = async () => {
      try {
        // 1. Fetch habits
        const habitsRef = collection(db, "users", currentUser.uid, "habits");
        const habitsSnap = await getDocs(habitsRef);
        const habitsList = habitsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // 2. Fetch dailyHabits
        const dailyRef = collection(db, "users", currentUser.uid, "dailyHabits");
        const dailySnap = await getDocs(dailyRef);
        const dailyList = dailySnap.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            date: data.date || docSnap.id, // fallback to doc id
            completed: data.completed || {},
          };
        });

        setHabits(habitsList);
        setDailyDocs(dailyList);
      } catch (err) {
        console.error("Error fetching progress data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  // Map for quick habit lookup by id
  const habitMap = useMemo(() => {
    const map = {};
    habits.forEach((h) => {
      map[h.id] = h;
    });
    return map;
  }, [habits]);

  // ========= 1. Weekly Bar Chart (last 7 days) =========
  const weeklyData = useMemo(() => {
    const last7 = getLastNDays(7); // Date[]
    return last7.map((d) => {
      const id = formatDateId(d);
      const doc = dailyDocs.find((x) => x.date === id);
      let completedCount = 0;
      if (doc && doc.completed) {
        Object.entries(doc.completed).forEach(([habitId, val]) => {
          if (val) completedCount += 1;
        });
      }
      return {
        date: id.slice(5), // MM-DD
        completed: completedCount,
      };
    });
  }, [dailyDocs]);

  // ========= 2. Monthly Heatmap (current month) =========
  const monthDays = useMemo(() => getCurrentMonthDays(), []);
  const monthHeatmap = useMemo(() => {
    return monthDays.map((d) => {
      const id = formatDateId(d);
      const doc = dailyDocs.find((x) => x.date === id);
      let completedCount = 0;
      let total = 0;

      if (doc && doc.completed) {
        total = Object.keys(doc.completed).length;
        Object.values(doc.completed).forEach((val) => {
          if (val) completedCount += 1;
        });
      }

      return {
        dateId: id,
        day: d.getDate(),
        total,
        completed: completedCount,
      };
    });
  }, [dailyDocs, monthDays]);

  // ========= 3. Category Pie Chart =========
  const categoryData = useMemo(() => {
    if (!habits.length || !dailyDocs.length) return [];

    const categoryCounts = {}; // {category: completedCount}

    dailyDocs.forEach((daily) => {
      if (!daily.completed) return;

      Object.entries(daily.completed).forEach(([habitId, val]) => {
        if (!val) return; // count only completed
        const h = habitMap[habitId];
        if (!h) return;
        const cat = h.category || "Other";
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });
    });

    return Object.entries(categoryCounts).map(([cat, count]) => ({
      name: cat,
      value: count,
    }));
  }, [dailyDocs, habitMap, habits.length]);

  // ========= 4. Detailed Table =========
  const tableData = useMemo(() => {
    if (!habits.length || !dailyDocs.length) return [];

    return habits.map((habit) => {
      const start = habit.startDate ? parseDate(habit.startDate) : null;
      const end = habit.endDate ? parseDate(habit.endDate) : null;
      let totalDays = 0;
      let completedDays = 0;

      // current streak: count backwards from today
      let currentStreak = 0;
      const today = new Date();

      // loop over all dailyDocs to compute totals
      dailyDocs.forEach((daily) => {
        const d = parseDate(daily.date);
        if (!d) return;

        // respect startDate / endDate
        if (start && d < start) return;
        if (end && d > end) return;

        const val = daily.completed?.[habit.id];
        if (val === true || val === false) {
          totalDays += 1;
          if (val) completedDays += 1;
        }
      });

      // compute streak from today backwards
      let streakRunning = true;
      let offset = 0;
      while (streakRunning) {
        const day = new Date(today);
        day.setDate(today.getDate() - offset);
        const id = formatDateId(day);
        const daily = dailyDocs.find((x) => x.date === id);
        const val = daily?.completed?.[habit.id];

        if (val === true) {
          currentStreak += 1;
          offset += 1;
        } else {
          streakRunning = false;
        }

        // stop if we go before habit start
        if (start && day < start) break;
      }

      const missedDays = totalDays - completedDays;
      const completionPct = totalDays === 0 ? 0 : Math.round((completedDays / totalDays) * 100);

      return {
        id: habit.id,
        name: habit.name,
        category: habit.category || "Other",
        priority: habit.priority || "-",
        totalDays,
        completedDays,
        missedDays,
        completionPct,
        currentStreak,
      };
    });
  }, [habits, dailyDocs]);

  if (!currentUser) {
    return (
      <div className="p-6">
        <p>Please log in to view your progress.</p>
      </div>
    );
  }

  const bgClass =
    theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900";
  const cardClass =
    theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900";

return (
  <div className={`p-3 sm:p-4 md:p-6 min-h-screen ${bgClass}`}>
    <h1 className="text-lg sm:text-xl md:text-2xl font-bold mb-4">
      Check Progress
    </h1>

    {loading ? (
      <p>Loading progress...</p>
    ) : (
      <div className="space-y-6">
        {/* Weekly Bar Chart */}
        <div className={`p-3 sm:p-4 rounded-xl shadow-md ${cardClass}`}>
          <h2 className="text-base sm:text-lg font-semibold mb-1">
            Last 7 Days Progress
          </h2>
          <p className="text-xs sm:text-sm mb-3">
            Number of habits completed each day.
          </p>

          <div className="w-full h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar
                  dataKey="completed"
                  fill="#4F46E5"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Heatmap + Pie */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Monthly Heatmap */}
          <div className={`p-3 sm:p-4 rounded-xl shadow-md ${cardClass}`}>
            <h2 className="text-base sm:text-lg font-semibold mb-1">
              Monthly Heatmap
            </h2>
            <p className="text-xs sm:text-sm mb-3">
              Darker = more completed habits
            </p>

            <div className="grid grid-cols-7 gap-1 sm:gap-2 text-[10px] sm:text-xs">
              {monthHeatmap.map((dayObj) => {
                const intensity =
                  dayObj.total === 0
                    ? 0
                    : dayObj.completed / dayObj.total;

                let bg;
                if (intensity === 0)
                  bg = theme === "dark" ? "bg-gray-700" : "bg-gray-200";
                else if (intensity < 0.34) bg = "bg-green-300";
                else if (intensity < 0.67) bg = "bg-green-500";
                else bg = "bg-green-700";

                return (
                  <div
                    key={dayObj.dateId}
                    className={`h-8 sm:h-10 rounded-md flex items-center justify-center ${bg}`}
                    title={`${dayObj.completed}/${dayObj.total}`}
                  >
                    {dayObj.day}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category Pie */}
          <div className={`p-3 sm:p-4 rounded-xl shadow-md ${cardClass}`}>
            <h2 className="text-base sm:text-lg font-semibold mb-1">
              Category-wise Completion
            </h2>
            <p className="text-xs sm:text-sm mb-3">
              Habit completion distribution
            </p>

            {categoryData.length === 0 ? (
              <p className="text-sm">No completion data yet.</p>
            ) : (
              <div className="w-full h-56 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      label
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend
                      layout="horizontal"
                      verticalAlign="bottom"
                      height={36}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Table */}
        <div className={`p-3 sm:p-4 rounded-xl shadow-md ${cardClass}`}>
          <h2 className="text-base sm:text-lg font-semibold mb-1">
            Habit Details
          </h2>
          <p className="text-xs sm:text-sm mb-3">
            Overall habit performance summary
          </p>

          <div className="overflow-x-auto">
            <table className="min-w-[700px] w-full text-xs sm:text-sm border-collapse">
              <thead>
                <tr
                  className={
                    theme === "dark"
                      ? "bg-gray-700 text-gray-200"
                      : "bg-gray-200 text-gray-800"
                  }
                >
                  <th className="p-2">Habit</th>
                  <th className="p-2 hidden sm:table-cell">Category</th>
                  <th className="p-2">Priority</th>
                  <th className="p-2 text-center">Total</th>
                  <th className="p-2 text-center">Done</th>
                  <th className="p-2 text-center hidden md:table-cell">
                    Missed
                  </th>
                  <th className="p-2 text-center">%</th>
                  <th className="p-2 text-center hidden lg:table-cell">
                    Streak
                  </th>
                </tr>
              </thead>

              <tbody>
                {tableData.map((row, idx) => (
                  <tr
                    key={row.id}
                    className={
                      theme === "dark"
                        ? idx % 2 === 0
                          ? "bg-gray-900"
                          : "bg-gray-800"
                        : idx % 2 === 0
                        ? "bg-white"
                        : "bg-gray-50"
                    }
                  >
                    <td className="p-2">{row.name}</td>
                    <td className="p-2 hidden sm:table-cell">
                      {row.category}
                    </td>
                    <td className="p-2">{row.priority}</td>
                    <td className="p-2 text-center">{row.totalDays}</td>
                    <td className="p-2 text-center">
                      {row.completedDays}
                    </td>
                    <td className="p-2 text-center hidden md:table-cell">
                      {row.missedDays}
                    </td>
                    <td className="p-2 text-center">
                      {row.completionPct}%
                    </td>
                    <td className="p-2 text-center hidden lg:table-cell">
                      {row.currentStreak}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )}
  </div>
);
};

export default CheckProgress;
