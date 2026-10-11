import { describe, it, expect } from "bun:test";
import { APP_VERSION } from "../src/version.ts";
import { Footnote } from "../src/components/Footnote.tsx";
import { TaskCard } from "../src/components/TaskCard.tsx";
import {
  addCategory,
  addTask,
  categories,
  clearCompletedTasks,
  completedCount,
  currentThemeMode,
  deleteTask,
  filteredTasks,
  loadTasksFromStorage,
  persistTasks,
  progressPercent,
  STORAGE_KEY,
  taskCategory,
  taskFilter,
  taskInput,
  tasks,
  toggleTask,
  toggleThemeMode,
} from "../src/store.ts";
import { stat, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";

describe("Application Version & Footnote", () => {
  it("exports APP_VERSION as string from src/version.ts", () => {
    expect(typeof APP_VERSION).toBe("string");
  });

  it("renders Footnote component function properly", () => {
    const vnode = Footnote();
    expect(vnode).not.toBeNull();
    expect(vnode.type).toBe("footer");
  });
});

describe("Task Management & Persistence Signals", () => {
  it("renders TaskCard component function properly", () => {
    const vnode = TaskCard();
    expect(vnode).not.toBeNull();
    expect(vnode.type).toBe("article");
  });

  it("adds, toggles, filters and deletes tasks properly", () => {
    const initialLen = tasks.value.length;

    taskInput.value = "Test new task";
    taskCategory.value = "Preact";
    addTask();

    expect(tasks.value.length).toBe(initialLen + 1);
    const addedTask = tasks.value[tasks.value.length - 1];
    expect(addedTask).toBeDefined();
    expect(addedTask?.title).toBe("Test new task");
    expect(addedTask?.completed).toBe(false);
    expect(taskInput.value).toBe("");

    if (addedTask) {
      toggleTask(addedTask.id);
      const updated = tasks.value.find((t) => t.id === addedTask.id);
      expect(updated?.completed).toBe(true);

      taskFilter.value = "concluidas";
      expect(filteredTasks.value.every((t) => t.completed)).toBe(true);

      taskFilter.value = "pendentes";
      expect(filteredTasks.value.every((t) => !t.completed)).toBe(true);

      taskFilter.value = "todas";
      expect(filteredTasks.value.length).toBe(tasks.value.length);

      deleteTask(addedTask.id);
      expect(tasks.value.length).toBe(initialLen);
    }
  });

  it("calculates completed count and progress percentage", () => {
    tasks.value = [
      { id: 101, title: "T1", category: "Bun", completed: true },
      { id: 102, title: "T2", category: "PWA", completed: false },
    ];

    expect(completedCount.value).toBe(1);
    expect(progressPercent.value).toBe(50);

    tasks.value = [
      { id: 101, title: "T1", category: "Bun", completed: true },
      { id: 102, title: "T2", category: "PWA", completed: true },
    ];
    expect(progressPercent.value).toBe(100);
  });

  it("clears completed tasks properly", () => {
    tasks.value = [
      { id: 201, title: "Active 1", category: "Bun", completed: false },
      { id: 202, title: "Done 1", category: "PWA", completed: true },
      { id: 203, title: "Done 2", category: "Preact", completed: true },
    ];

    clearCompletedTasks();
    expect(tasks.value.length).toBe(1);
    expect(tasks.value[0]?.title).toBe("Active 1");
  });

  it("adds new dynamic categories properly", () => {
    const initialCatsCount = categories.value.length;
    addCategory("DevOps");
    expect(categories.value.includes("DevOps")).toBe(true);
    expect(taskCategory.value).toBe("DevOps");
    expect(categories.value.length).toBe(initialCatsCount + 1);
  });

  it("handles storage operations gracefully in environment", async () => {
    expect(STORAGE_KEY).toBe("aistudio_tasks");
    await persistTasks();
    await loadTasksFromStorage();
    expect(tasks.value.length).toBeGreaterThan(0);
  });
});

describe("Theme Toggle", () => {
  it("cycles theme through light, dark, and auto", () => {
    currentThemeMode.value = "light";
    toggleThemeMode();
    expect(currentThemeMode.value as string).toBe("dark");
    toggleThemeMode();
    expect(currentThemeMode.value as string).toBe("auto");
    toggleThemeMode();
    expect(currentThemeMode.value as string).toBe("light");
  });
});

describe("Build Artifacts Verification", () => {
  it("checks generated distribution files if dist exists", async () => {
    const distPath = "packages/server/build/dist";
    if (existsSync(distPath)) {
      const distStat = await stat(distPath);
      if (distStat.isDirectory()) {
        const indexHtml = await readFile(`${distPath}/index.html`, "utf-8");
        expect(indexHtml.includes("<!DOCTYPE html>")).toBe(true);
        expect(indexHtml.includes("manifest.json")).toBe(true);

        const swStat = await stat(`${distPath}/sw.js`);
        expect(swStat.isFile()).toBe(true);

        const mainStat = await stat(`${distPath}/main.js`);
        expect(mainStat.isFile()).toBe(true);
      }
    }
  });
});
