const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Sequelize = require("sequelize");
const { STRING } = Sequelize;
const config = {
  logging: false,
};

if (process.env.LOGGING) {
  delete config.logging;
}
const conn = new Sequelize(
  process.env.DATABASE_URL || "postgres://localhost/acme_db",
  config
);

const Note = conn.define("note", {
  message: {
    type: Sequelize.STRING,
  },
});

const User = conn.define("user", {
  username: STRING,
  password: STRING,
});

User.addHook("beforeSave", async (user) => {
  if (user.changed("password")) {
    const hashed = await bcrypt.hash(user.password, 3);
    user.password = hashed;
  }
});

User.byToken = async (token) => {
  try {
    const payload = await jwt.verify(token, process.env.JWT);
    const user = await User.findByPk(payload.id, {
      attributes: {
        exclude: ["password"],
      },
    });
    if (user) {
      return user;
    }
    const error = Error("bad credentials");
    error.status = 401;
    throw error;
  } catch (ex) {
    const error = Error("bad credentials");
    error.status = 401;
    throw error;
  }
};

User.authenticate = async ({ username, password }) => {
  const user = await User.findOne({
    where: {
      username,
    },
  });
  if (user && (await bcrypt.compare(password, user.password))) {
    return jwt.sign({ id: user.id }, process.env.JWT);
  }
  const error = Error("bad credentials!!!!!!");
  error.status = 401;
  throw error;
};

Note.belongsTo(User);
User.hasMany(Note);

const syncAndSeed = async () => {
  await conn.sync({ force: true });
  const credentials = [
    { username: "lucy", password: "lucy_pw" },
    { username: "moe", password: "moe_pw" },
    { username: "larry", password: "larry_pw" },
  ];
  const [lucy, moe, larry] = await Promise.all(
    credentials.map((credential) => User.create(credential))
  );

  await Note.create({
    message: "You make the world a better",
    userId: lucy.id,
  });
  await Note.create({ message: "Today is already extra good", userId: moe.id });
  await Note.create({
    message: "The world is still beautiful",
    userId: lucy.id,
  });
  await Note.create({ message: "You raise our vibrations", userId: larry.id });
  await Note.create({ message: "It will get better", userId: moe.id });
  await Note.create({
    message: "Keep going you are doing great",
    userId: larry.id,
  });
  await Note.create({ message: "You are enough", userId: moe.id });

  return {
    users: {
      lucy,
      moe,
      larry,
    },
  };
};

module.exports = {
  syncAndSeed,
  models: {
    User,
    Note,
  },
};
