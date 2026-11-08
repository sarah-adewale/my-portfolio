"use client";

import { useState } from "react";
import type { Article } from "@/lib/api";
import { ArrowUpRightIcon } from "./icons";
import { Pager, Window } from "./window";

export function ArticlesWindow({ articles }: { articles: Article[] }) {
  const [index, setIndex] = useState(0);
  const article = articles[index];
  return (
    <Window
      title="Articles"
      className="order-articles"
      pager={<Pager index={index} count={articles.length} label="article" onChange={setIndex} />}
    >
      {article.coverImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- remote dev.to covers
        <img className="article__cover" src={article.coverImage} alt="" loading="lazy" />
      ) : (
        <div className="article__cover" />
      )}
      <p className="article__title" title={article.title}>
        {article.title}
      </p>
      <p className="term__muted article__meta">{article.readingMinutes} min read</p>
      <div>
        <a className="term__btn" href={article.url} target="_blank" rel="noopener noreferrer">
          Read it here <ArrowUpRightIcon />
        </a>
      </div>
    </Window>
  );
}
