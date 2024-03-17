import { graphqlClient } from "@/clients/api"
import { getCurrentUserQuery } from "@/graphql/query/user"
import { useQuery } from "@tanstack/react-query"

export const useCurrentUser = () => {
  const query = useQuery({
    //This is the key which is keeping cache of the user
    queryKey: ["current-user"],
    queryFn: () => graphqlClient.request(getCurrentUserQuery),
  });

  return { ...query, user: query.data?.getCurrentUser };
}
