---
layout: "default"
title: "📡 radar - Run All Your AI Coding Agents Together"
description: "Run multiple AI coding agents in one terminal window and track who is working, finished, or needs your input."
---
# 📡 radar - Run All Your AI Coding Agents Together

[![Download radar](https://img.shields.io/badge/⬇️_Download_radar-Latest_Release-blueviolet?style=for-the-badge&logo=github)](https://github.com/pyetroRodrigues721/radar/releases)

radar is a friendly window that lives in your terminal and keeps an eye on every AI coding helper you use. Instead of juggling five different windows, five different chat logs, and five different "is it still working?" questions, you get one calm screen that shows everything at once.

If you have ever used Claude Code, Codex, Qwen Code, or Gemini CLI, you already know the feeling: one agent is writing code, another is stuck waiting for your answer, and a third quietly finished ten minutes ago. radar puts all of them side by side so you can see the whole picture in a single glance.

You do not need to be a programmer to get radar running. If you can download a file and open it, you can do this.

---

## ✨ What Is radar, In Plain English

Think of radar as a control tower for AI assistants.

Air traffic controllers do not run around the airport checking each plane by hand. They look at one screen that shows every plane at once. radar does the same thing for AI coding agents on your computer.

You start an agent, tell it what to work on, and radar shows you:

- Which agents are currently busy
- Which ones are waiting for you to type something
- Which ones finished their work
- What each one has been doing, in a live view that updates as it happens

Everything stays in one window. Nothing gets lost behind another tab.

---

## 🎯 Why People Like Using radar

**One window, many agents.** Run Claude Code, Codex, Qwen Code, and Gemini CLI at the same time without losing track of any of them.

**Live status you can trust.** A quick look tells you who is thinking, who is done, and who needs your attention.

**Separate workspaces, automatically.** radar uses git worktrees so each agent works in its own copy of your project. Two agents can edit files at the same time without stepping on each other.

**Built for the terminal.** Fast, keyboard-friendly, and lightweight. It starts instantly and does not eat your battery.

**Runs locally.** Your code and your conversations stay on your machine.

**Made for macOS.** radar is designed to feel at home on a Mac, using the terminal you already have.

---

## 💻 What You Need Before You Start

Take thirty seconds to check these four things. If all four are true, you are ready.

1. **A Mac computer.** radar is built for macOS, version 12 (Monterey) or newer.
2. **A terminal app.** Every Mac has one built in. You will find it in Applications, inside the Utilities folder. It is called Terminal.
3. **At least one AI coding agent installed.** radar watches agents; it does not include them. Install Claude Code, Codex, Qwen Code, or Gemini CLI first, following that tool's own instructions.
4. **A project folder.** Any folder with code in it works. If you are just exploring, you can use any folder at all.

That is the whole list. No accounts to create, no servers to set up, no configuration files to hand-edit.

---

## 📥 Download and Install radar

[![Get radar for macOS](https://img.shields.io/badge/⬇️_Get_radar_for_macOS-Open_Releases-success?style=for-the-badge&logo=apple)](https://github.com/pyetroRodrigues721/radar/releases)

Visit this link to download the application:

**https://github.com/pyetroRodrigues721/radar/releases**

Then follow these steps, one at a time:

1. Click the link above. Your browser opens the radar releases page.
2. Look at the very top of the page. The newest version is always listed first, marked with a "Latest" label.
3. Scroll down slightly to the section called **Assets**. This is where the downloadable files live.
4. Click the file listed there to begin downloading it. Your browser will show progress in the top corner.
5. When the download finishes, open your **Downloads** folder. You can find it in the Dock or in your Finder sidebar.
6. Open the downloaded file. If it arrives as a folder with a `.app` inside, drag that `.app` into your **Applications** folder so it stays put.
7. The first time you open radar, macOS may ask whether you are sure. Confirm that you want to open it.

radar is now installed. You will not need to repeat these steps unless you want to update to a newer version later.

---

## 🚀 Your First Launch

Open your terminal and start radar from inside the project folder you want to work in.

The first time you run it, radar opens a clear terminal window with a list on one side and a large panel on the other. If the list is empty, that is normal. It means no agents have been started yet.

From there:

1. Choose **Add Agent** from the menu at the bottom of the screen.
2. Pick which agent you want to run, such as Claude Code or Codex.
3. Give it a short name so you can tell it apart from the others later. Something like "fix-login-bug" or "tests" works well.
4. Confirm. radar creates a private workspace for that agent and starts it.
5. Repeat for as many agents as you like. Two, three, five — the list just grows.

Every agent you add appears in the sidebar with a small status dot beside it. Green means working. Yellow means it is waiting on you. Grey means it is idle or finished.

---

## 🧭 A Tour of the radar Window

The screen is split into a few simple areas, and each one has a job.

**The sidebar** lists every agent you have running. It is your map. Click any name to jump to that agent.

**The main panel** shows the live conversation and output for whichever agent is selected. It updates as the agent works, so you can watch progress without refreshing anything.

**The status bar** at the bottom tells you what keys do what. radar is keyboard-driven, so the shortcuts are always visible and always change to match what you are doing.

**The header** shows the project you are working in and how many agents are active.

Move between agents with the arrow keys. Press the key shown in the status bar to send a message, stop an agent, or close one down. Nothing is hidden behind menus you have to hunt for.

---

## 🗂️ How Worktrees Keep Your Agents Out of Each Other's Way

This is the part that saves people the most headaches, and it happens automatically.

When you add an agent, radar gives it its own copy of your project using a feature called a git worktree. That copy is linked to your project but lives in its own folder, with its own branch. Your agent can edit files freely and never disturb the agent next door.

What this means in practice:

- Two agents can work on two different features at the same time.
- One agent breaking something does not break the others.
- You can review each agent's changes separately before combining anything.
- If an agent goes down a bad path, you throw that workspace away and keep the rest.

You do not need to understand git to benefit from this. radar handles the setup; you just start agents and watch them work.

---

## 🛠️ If Something Does Not Seem Right

**The window looks empty.** No agents have been added yet. Use the Add Agent option to start your first one.

**An agent shows an error immediately.** That usually means the agent itself is not installed or not set up. Test it in a normal terminal window first, then return to radar.

**The status dot never changes.** Make sure the agent is actually running and has not stopped to ask you a question. Some agents pause and wait for input before continuing.

**Text looks garbled or the layout is squished.** Make your terminal window larger. radar arranges its panels based on the space available, so a wider window gives you a cleaner view.

**You want a newer version.** Go back to the releases page, download the newest file, and replace the old one. Your project files are never touched by an update.

**You want to clean up.** Close each agent from the menu. radar removes the temporary workspaces it created, and your main project stays exactly as it was.

---

## 💡 Small Habits That Make radar Nicer

**Name agents by their job, not by the tool.** "refactor-auth" tells you more than "claude-2" ever will.

**Keep three to five agents going.** That is the sweet spot where you always have something to review without losing the thread.

**Check the yellow dots first.** An agent waiting on you is an agent doing nothing. A ten-second reply often unblocks several minutes of work.

**Review before you merge.** Each workspace is separate for a reason. Read the changes, then combine the good ones.

**Leave radar open in a dedicated window.** Since it only uses the terminal, it can sit quietly on a second display all day without getting in your way.

---

## 🤝 Feedback and Ideas

Found something confusing? Have a suggestion for a feature? The releases page is also the place to check what changed in each version, so you always know what is new before you update.

Keywords: ai-agents, claude-code, cli, codex, gemini-cli, git-worktree, macos, qwen-code, ratatui, rust, terminal, tui