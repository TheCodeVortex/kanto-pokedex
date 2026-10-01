import { stubFetchResponse } from "@tests/support/poke-api-fixtures";
import { describe, expect, it } from "vitest";
import { queryPokeApi } from "./poke-api-graphql";

describe("queryPokeApi", () => {
  it("posts the query and variables, cached for a day", async () => {
    const fetchMock = stubFetchResponse({ data: { ok: true } });

    const data = await queryPokeApi<{ ok: boolean }>("query Q { ok }", { id: 1 });

    expect(data).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://beta.pokeapi.co/graphql/v1beta",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ query: "query Q { ok }", variables: { id: 1 } }),
        cache: "force-cache",
        next: { revalidate: 86400 },
      }),
    );
  });

  it("fails on an HTTP error", async () => {
    stubFetchResponse({}, 503);
    await expect(queryPokeApi("query Q { ok }", {})).rejects.toThrow(
      "PokeAPI GraphQL responded 503",
    );
  });

  it("fails with the GraphQL errors when there is no data", async () => {
    stubFetchResponse({ errors: [{ message: "field not found" }, { message: "bad query" }] });
    await expect(queryPokeApi("query Q { ok }", {})).rejects.toThrow(
      "PokeAPI GraphQL error: field not found; bad query",
    );
  });

  it("fails even when the error list is missing", async () => {
    stubFetchResponse({});
    await expect(queryPokeApi("query Q { ok }", {})).rejects.toThrow("PokeAPI GraphQL error: ");
  });
});
