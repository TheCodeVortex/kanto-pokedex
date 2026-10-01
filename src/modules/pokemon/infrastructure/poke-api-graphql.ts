const GRAPHQL_URL = "https://beta.pokeapi.co/graphql/v1beta";
const ONE_DAY_IN_SECONDS = 60 * 60 * 24;

export const ENGLISH_LANGUAGE_ID = 9;

interface GraphQLResponse<TData> {
  data?: TData;
  errors?: { message: string }[];
}

/**
 * Runs a PokéAPI GraphQL query. The API is rate-limited, so responses are
 * cached for a day and queries should fetch whole regions at once.
 */
export async function queryPokeApi<TData>(
  query: string,
  variables: Record<string, unknown>,
): Promise<TData> {
  const response = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    cache: "force-cache",
    next: { revalidate: ONE_DAY_IN_SECONDS },
  });
  if (!response.ok) {
    throw new Error(`PokeAPI GraphQL responded ${response.status}`);
  }

  const body = (await response.json()) as GraphQLResponse<TData>;
  if (!body.data) {
    throw new Error(
      `PokeAPI GraphQL error: ${body.errors?.map((e) => e.message).join("; ")}`,
    );
  }
  return body.data;
}
