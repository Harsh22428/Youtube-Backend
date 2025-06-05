import express from "express";

const app = express();
app.use(express.static('dist'));   // this use for dist folder which compiled version of frontend code which helps us to run frontend code in the backend but this bad pratice because when we changes the fronted then it not directly effect frontend but if want changes in frontend code then agian run build and delete previous dist folder and add new build dist folder

app.get("/", (req, res) => {
  res.send("server is running");
});
app.get("/api/jokes", (req, res) => {
  const jokes = [
    {
      id: 1,
      title: "a joke",
      content: "this is first joke",
    },
    {
      id: 2,
      title: "two joke",
      content: "this is second joke",
    },
    {
      id: 3,
      title: "three joke",
      content: "this is third joke",
    },
    {
      id: 4,
      title: "four joke",
      content: "this is fourth joke",
    },
    {
      id: 5,
      title: "five joke",
      content: "this is five joke",
    },
  ];
  res.send(jokes)
});
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`server is running on this ${port} port `);
});
