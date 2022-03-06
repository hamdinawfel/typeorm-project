import "reflect-metadata";
import express, { Request, Response } from "express";
import { validate } from "class-validator";

import { createConnection } from "typeorm";
import { User } from "./entity/User";
import { Post } from "./entity/Post";
import { Profile } from "./entity/Profile";

const app = express();
app.use(express.json());
/* users route */
// CREATE
app.post("/users", async (req: Request, res: Response) => {
  const { name, email, role } = req.body;

  try {
    const user = User.create({ name, email, role });

    const errors = await validate(user);
    if (errors.length > 0) throw errors;

    await user.save();

    return res.status(201).json(user);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});
// READ
app.get("/users", async (_: Request, res: Response) => {
  try {
    const users = await User.find({ relations: ["posts"] });

    return res.json(users);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
});
// Create a Post
app.post("/posts", async (req: Request, res: Response) => {
  const { userUuid, title, body } = req.body;

  try {
    const user = await User.findOneOrFail({ uuid: userUuid });

    const post = new Post({ title, body, user });

    await post.save();

    return res.json(post);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
});
// Create a profile
app.post("/profiles", async (req: Request, res: Response) => {
  const { userUuid, gender, photo } = req.body;

  try {
    const user = await User.findOneOrFail({ uuid: userUuid });

    const profile = new Profile();
    profile.gender = gender;
    profile.photo = photo;
    profile.user = user;
    await profile.save();

    return res.json(profile);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
});
// READ profiles
app.get("/profiles", async (_: Request, res: Response) => {
  try {
    const profiles = await Profile.find({ relations: ["user"] });

    return res.json(profiles);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
});
createConnection()
  .then(async () => {
    app.listen(5000, () => console.log("Server up at http://localhost:5000"));
  })
  .catch((error) => console.log(error));
