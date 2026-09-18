"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Task = {
  id: string;
  title: string;
  done: boolean;
};

type TaskItemProps = {
  task: Task;
  groupId: string;
  isOwner: boolean;
};

export default function TaskItem({
  task,
  groupId,
  isOwner,
}: TaskItemProps) {
  const router = useRouter();

  const [error, setError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleToggle() {
    setError("");
    setIsUpdating(true);

    try {
      const response = await fetch(
        `/api/groups/${groupId}/tasks/${task.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            done: !task.done,
          }),
        }
      );

      const text = await response.text();

      let data: any = {};

      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          // Ignore non-JSON response
        }
      }

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to update task"
        );
      }

      router.refresh();
    } catch (err) {
      console.error("UPDATE TASK ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update task"
      );
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) return;

    setError("");
    setIsDeleting(true);

    try {
      const response = await fetch(
        `/api/groups/${groupId}/tasks/${task.id}`,
        {
          method: "DELETE",
        }
      );

      const text = await response.text();

      let data: any = {};

      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          // Ignore non-JSON response
        }
      }

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to delete task"
        );
      }

      router.refresh();
    } catch (err) {
      console.error("DELETE TASK ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete task"
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <li className="flex items-center justify-between rounded-md border px-4 py-3">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={task.done}
          onChange={handleToggle}
          disabled={isUpdating || isDeleting}
          className="h-5 w-5"
        />

        <span
          className={
            task.done
              ? "text-gray-400 line-through"
              : ""
          }
        >
          {task.title}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {isOwner && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting || isUpdating}
            className="rounded-md bg-gray-200 px-4 py-2 hover:bg-gray-300 disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        )}

        {error && (
          <span className="text-sm text-red-600">
            {error}
          </span>
        )}
      </div>
    </li>
  );
}