import useSWR from "swr";
import type { ClientResponse, Fetch, InferRequestType, InferResponseType } from "hono/client";

type HonoEndpoint = (args: any, options: any | undefined) => Promise<ClientResponse<unknown>>;

async function fetcher<TEndpoint extends HonoEndpoint>({
	endpoint,
	input,
}: {
	endpoint: TEndpoint;
	input: InferRequestType<TEndpoint>;
}): Promise<InferResponseType<TEndpoint>> {
	const res = await endpoint(input, undefined);
	return (await res.json()) as InferResponseType<TEndpoint>;
}

export function useHono<TEndpoint extends HonoEndpoint>({
	endpoint,
	input,
}: {
	endpoint: TEndpoint;
	input: InferRequestType<TEndpoint>;
}) {
	return useSWR({ endpoint, input }, fetcher<TEndpoint>, { suspense: true });
}
