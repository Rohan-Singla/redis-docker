import express from "express";
import Redis from "ioredis";

const app = express();
app.use(express.json());

const redis = new Redis(
  process.env.REDIS_URL || "redis://localhost:6379"
);

const leaderboard_key = "leaderboard";

app.post("/post/:id/view", async (req, res) => {
  try {
    const postId = req.params.id;

    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        error: "userId required",
      });
    }

    const multi = redis.multi();

    // increment post views
    multi.incr(`post:${postId}:views`);

    // reward user with 1 point
    multi.zincrby(leaderboard_key, 1, userId);

    const result = await multi.exec();

    return res.json({
      success: true,
      result,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "internal server error",
    });
  }
});

app.post("/leaderboard/score", async (req, res) => {
  try {
    const { userId, points } = req.body;

    if (!userId || typeof points !== "number") {
      return res.status(400).json({
        error: "userId and points required",
      });
    }

    const newScore = await redis.zincrby(
      leaderboard_key,
      points,
      userId
    );

    return res.json({
      success: true,
      userId,
      score: Number(newScore),
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "internal server error",
    });
  }
});

app.get("/leaderboard", async (_req, res) => {
  try {
    const data = await redis.zrevrange(
      leaderboard_key,
      0,
      9,
      "WITHSCORES"
    );

    const leaderboard = [];

    for (let i = 0; i < data.length; i += 2) {
      leaderboard.push({
        rank: i / 2 + 1,
        userId: data[i],
        score: Number(data[i + 1]),
      });
    }

    return res.json({
      leaderboard,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "internal server error",
    });
  }
});

app.get("/leaderboard/:userId/rank", async (req, res) => {
  try {
    const { userId } = req.params;

    const rank = await redis.zrevrank(
      leaderboard_key,
      userId
    );

    if (rank === null) {
      return res.status(404).json({
        error: "user not found",
      });
    }

    const score = await redis.zscore(
      leaderboard_key,
      userId
    );

    return res.json({
      userId,
      rank: rank + 1,
      score: Number(score),
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "internal server error",
    });
  }
});


app.listen(3000, () => {
  console.log("Server running on port 3000");
});