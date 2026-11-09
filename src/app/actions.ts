"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createPoll, voteOnce } from "@/lib/db";
import { publish } from "@/lib/events";

export async function createPollAction(formData: FormData) {
  const question = String(formData.get("question") ?? "").trim();
  const options = String(formData.get("options") ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  if (question.length < 3) throw new Error("Question must be at least 3 characters");
  if (options.length < 2) throw new Error("Need at least two options");

  const id = createPoll(question, options);
  redirect(`/polls/${id}`);
}

export async function voteAction(pollId: number, optionId: number) {
  if (!voteOnce(optionId)) throw new Error("Vote failed");
  publish(`poll:${pollId}`, { type: "vote" });
  revalidatePath(`/polls/${pollId}`);
}
