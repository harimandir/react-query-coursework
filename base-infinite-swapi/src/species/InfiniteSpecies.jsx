import { useInfiniteQuery } from "react-query";
import InfiniteScroll from "react-infinite-scroller";
import { Species } from "./Species";

const initialUrl = "https://swapi.dev/api/species/";
const fetchUrl = async (url) => {
  const response = await fetch(url);
  return response.json();
};

export function InfiniteSpecies() {
  const { data, fetchNextPage, hasNextPage, isLoading, isFetching, isError, error } = useInfiniteQuery(
    "sw-species",
    ({ pageParam = initialUrl}) => fetchUrl(pageParam),
    {
      getNextPageParam: (lastPage) => lastPage.next || undefined
    }
  );

  if (isLoading) {
    return <div className="loading">Loading...</div>
  }

  if (isError) {
    return <div className="error">Error: { error.toString() }</div>
  }

  return <>
    <InfiniteScroll loadMore={fetchNextPage} hasMore={hasNextPage}>
      { data.pages.map(({ results }) => results.map(({ name, language, average_lifespan }) =>
        <Species key={name} name={name} language={language} averageLifespan={average_lifespan} />
      )) }
    </InfiniteScroll>
    { isFetching && <div className="loading">Loading...</div> }
  </>;
}
