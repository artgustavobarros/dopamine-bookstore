import { createServer } from "node:http";

const workIdPattern = /key:\/works\/(OL\d+W)/;
const habitsPattern = /habitos|hábitos|atomic/i;
const noMatchPattern = /nada/i;

const works = [
  [
    "OL100W",
    "OL100M",
    "Machado de Assis",
    "Dom Casmurro",
    "Dom Casmurro",
    208,
    "Classics",
    1899,
  ],
  [
    "OL200W",
    "OL200M",
    "James Clear",
    "Hábitos Atômicos",
    "Atomic Habits",
    320,
    "Habit",
    2018,
  ],
  [
    "OL300W",
    "OL300M",
    "Frank Herbert",
    "Duna",
    "Dune",
    600,
    "Science fiction",
    1965,
  ],
];

createServer((request, response) => {
  const url = new URL(request.url ?? "/", "http://127.0.0.1:4174");
  response.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:4173");
  if (url.pathname === "/health") {
    response.writeHead(200).end("ok");
    return;
  }
  if (url.pathname !== "/search.json") {
    response.writeHead(404).end();
    return;
  }
  const query = url.searchParams.get("q") ?? "";
  const english = query.includes("language:eng");
  const id = query.match(workIdPattern)?.[1];
  let matches = works.filter(([workId]) => !id || workId === id);
  if (english) {
    matches = matches.filter(([workId]) => workId !== "OL100W");
  }
  if (habitsPattern.test(query)) {
    matches = matches.filter(([workId]) => workId === "OL200W");
  }
  if (noMatchPattern.test(query)) {
    matches = [];
  }
  const docs = matches.map(
    ([workId, editionId, author, ptTitle, enTitle, pages, subject, year]) => ({
      author_name: [author],
      editions: {
        docs: [
          {
            key: `/books/${editionId}`,
            language: [english ? "eng" : "por"],
            title: english ? enTitle : ptTitle,
          },
        ],
      },
      first_publish_year: year,
      key: `/works/${workId}`,
      number_of_pages_median: pages,
      subject: [subject],
      title: enTitle,
    })
  );
  response
    .writeHead(200, { "Content-Type": "application/json" })
    .end(JSON.stringify({ docs }));
}).listen(4174, "127.0.0.1");
