import { GraphQLClient } from "graphql-request";

const isClient=typeof window!== 'undefined'
export const graphqlClient = new GraphQLClient('https://d1d5j69xd736th.cloudfront.net/graphql', {
  headers: () => ({
    Authorization: 
    isClient?`Bearer ${window.localStorage.getItem("__Twitter__token")}`:'undefined'
  }) 
});
