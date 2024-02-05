# Eloquent (2023-2024)

A tool for the indecisive. Made with Vue, Vite and TypeScript as a learning
exercise.

This app lets you enter a list of ideas, and compare them two at a time.
It uses an [Elo rating system](https://en.m.wikipedia.org/wiki/Elo_rating_system)
similar to the one once used in chess to rank ideas over time.

[Live Demo](https://ptrgags.dev/eloquent)

## Background

I've always found it difficult to look at a long list of items and pick
favorites, or prioritize a long list of my creative ideas. A long list of
options is overwhelming, but comparing two at a time is much easier.

Certainly I could make a tree-like tournament of ideas, but that has some
limitations:

* There's no way to express "no preference"
* With a tournament, each decision is final. But in reality, sometimes I
  vascillate between options for a while before reaching a conclusion. There's
  no way to encode this in a tournament of comparisons
* Since a tournament works like a partial ordering, there's not a clear way
  to get even an approximate ranking until the very end.

Recently, I learned about the Elo rating system from chess from the following
videos:

* [The Elo Rating System for Chess and Beyond](https://youtu.be/AsYfbmp0To0?si=vJgwHyT07kxTUrwd) by James Grimes (aka `singingbanana`)
* [Are Elo Systems Overrated? Everything you wanted to know about Rating Systems](https://www.youtube.com/watch?v=BT1mmikRils&ab_channel=dreamingsuntide) by `dreamingsuntide`

And that gave me the idea that Elo ratings might be helpful for comparing ideas.
Let's look at this by analogy with a chess tournament:

| Chess | Eloquent |
| ----- | -------- |
| A player | An idea, task, or whatever item I want to rank by preference or priority |
| The tournament roster | The full list of ideas |
| A game of chess between player A and player B | The question "Do I prefer Idea A or Idea B?" |
| Player A wins a game | I prefer Idea A over Idea B |
| Player A loses a game | I don't prefer Idea A over Idea B |
| A draw between Player A and Player B | I have no preference between Idea A or Idea B |
| The Elo rating is a measure of a player's skill level (after many games) | The Elo rating is a measure of how much I prefer/prioritize an idea (after many comparisons) |

I decided to give it a shot and made this project as a fun decision-making
tool.

## Usage

Usage instructions are included on the page itself, but the basic workflow is:

1. Add ideas to the list in the `Ideas` panel
2. Use the `Compare` panel to compare ideas. This will continuously prompt you
   to compare a pair of ideas.
3. The table in the `Ideas` panel shows the ranking and is updated after every
   comparison. Ideas are listed by Elo rating (descending). The color of each
   row gets brighter the more comparisons. This helps you get a feel for how
   accurate the ranking is (as more comparisons = more accurate)

### How I use Eloquent

In practice, I usually don't care about the overall ranking, I just want to 
decide what ideas I should focus on, and what ones to ignore (at least for now).
I find Eloquent helps me discern which ideas are a definite yes, a
definite no, and which ones I'm still undecided and require more contemplation.

Suppose I'm brainstorming some creative ideas. My workflow might look like this:

1. I create my list of creative ideas
2. I do a bunch of comparisons until that gets tiresome.
3. I check the bottom of the list. If there are any that were clear losers,
   I remove them from the list, ruling them out.
4. Similarly, if there's an obvious winner, I'll work on that creative idea
   and remove it from the list (since ranking it further is just wasting time)
5. On another day, I can return to the list and continue comparing the
   middling ideas, repeating steps 2-5 as needed.

I want to emphasize the **on another day** part. My mind can be pretty fickle
when it comes to what interests me on a given day. Putting it on the shelf
and returning to it can help. And over time, the Elo system should average out
the fickleness to see what I care about in the long-term.

Finally, remember that this is an **approximate ranking**. Don't take it too
seriously! Sometimes the idea I end up working on is not at the top of the
list, but rather somewhere medium-high in the ranking. In such cases, I view
this as my mind gravitating towards what I value in the moment. The process
of comparing ideas helped me get there.

## Pros and Cons

This is an experiment, not a tried-and-true decision making tool. Here are
some observations so far:

Pros:

* This system works nicely for contemplating decisions at your own pace.
* You can remove/add items to the list at any time and it still works.
* The Elo system allows for draws, so this allows a "no preference" option.
* The Elo rating provides an approximate ranking even when not everything has
  been compared.

Cons:

* It takes a large amount of patience to make an accurate ranking. You need to
  make many comparisons across several days to create an accurate ranking.
* Pairs of ideas are chosen randomly, so the ranking in the short-term is
  sensitive to which pairs were presented to the user.

## Development Setup

The following are instructions for how to build and run this Vue project, mainly
for my future reference.

### Install Dependencies

```sh
npm install
```

### Run Dev Server

```sh
npm run dev
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

### Compile for Production

```sh
npm run build
```

### Release

When ready to release an update to the site, do the following:

```sh
# Build the static site into the dist/ folder
npm run build

# Check in changes
git add dist/
git commit

# This pushes the dist/ folder to origin/gh-pages as a git subtree.
npm run deploy
```