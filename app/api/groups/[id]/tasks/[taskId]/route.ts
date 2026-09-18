import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// UPDATE TASK
export async function PATCH(
  request: Request,
  {
    params,
  }: {
    params: {
      id: string;
      taskId: string;
    };
  }
) {
  try {
    const { id, taskId } = params;

    if (!id || !taskId) {
      return NextResponse.json(
        {
          error: "Group ID and Task ID are required",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        groupId: id,
      },
    });

    if (!task) {
      return NextResponse.json(
        {
          error: "Task not found",
        },
        { status: 404 }
      );
    }

    const updates: {
      title?: string;
      done?: boolean;
    } = {};

    // Update title if provided
    if (body.title !== undefined) {
      if (typeof body.title !== "string") {
        return NextResponse.json(
          {
            error: "Title must be a string",
          },
          { status: 400 }
        );
      }

      updates.title = body.title.trim();
    }

    // Update done if provided
    if (body.done !== undefined) {
      if (typeof body.done !== "boolean") {
        return NextResponse.json(
          {
            error: "Done must be a boolean",
          },
          { status: 400 }
        );
      }

      updates.done = body.done;
    }

    const updatedTask = await prisma.task.update({
      where: {
        id: taskId,
      },
      data: updates,
    });

    return NextResponse.json(updatedTask, {
      status: 200,
    });
  } catch (error) {
    console.error("UPDATE TASK ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update task",
      },
      { status: 500 }
    );
  }
}

// DELETE TASK
export async function DELETE(
  request: Request,
  {
    params,
  }: {
    params: {
      id: string;
      taskId: string;
    };
  }
) {
  try {
    const { id, taskId } = params;

    if (!id || !taskId) {
      return NextResponse.json(
        {
          error: "Group ID and Task ID are required",
        },
        { status: 400 }
      );
    }

    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        groupId: id,
      },
    });

    if (!task) {
      return NextResponse.json(
        {
          error: "Task not found",
        },
        { status: 404 }
      );
    }

    await prisma.task.delete({
      where: {
        id: taskId,
      },
    });

    return NextResponse.json(
      {
        message: "Task deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE TASK ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete task",
      },
      { status: 500 }
    );
  }
}