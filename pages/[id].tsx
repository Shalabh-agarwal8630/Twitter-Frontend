import FeedCard from "@/components/FeedCard";
import TwitterLayout from "@/components/Layout/TwitterLayout";
import { Tweet, User } from "@/gql/graphql";
import { useCurrentUser } from "@/hooks/user";
import { useRouter } from "next/router";
import type { GetServerSideProps, NextPage } from "next";
import Image from "next/image";
import { BsArrowLeftShort } from "react-icons/bs";
import { graphqlClient } from "@/clients/api";
import { getUserByIdQuery } from "@/graphql/query/user";
import { useCallback, useMemo } from "react";
import { followUserMutation, unfollowUserMutation } from "@/graphql/mutation/user";
import { useQueryClient } from "@tanstack/react-query";

interface ServerProps {
  userInfo?: User;
}

const UserProfilePage: NextPage<ServerProps> = (props) => {
  const router = useRouter();
  const queryClient=useQueryClient();
  
  const { user: currentUser } = useCurrentUser();
  
  const amIFollowing = useMemo(() => {
    if (!props.userInfo ) return false;
    return (
      (currentUser?.following?.findIndex(
        (el) => el?.id === props.userInfo?.id
      ) ?? -1) >= 0
    );
  }, [currentUser?.following, props.userInfo]);

  const handleFollowUser=useCallback(async ()=>{  
    if(!props.userInfo?.id) return ;
    await graphqlClient.request(followUserMutation,{to:props.userInfo?.id})
    await queryClient.invalidateQueries(['current-user'])

  },[props.userInfo?.id,queryClient])

  const handleUnFollowUser=useCallback(async ()=>{  
    if(!props.userInfo?.id) return ;
    await graphqlClient.request(unfollowUserMutation,{to:props.userInfo?.id})
    await queryClient.invalidateQueries(['current-user'])

  },[props.userInfo?.id,queryClient])
  
  console.log(props);
  return (
    <div>
      <TwitterLayout>
        <div>
          <nav className="flex items-center gap-3 py-3 px-3">
            <BsArrowLeftShort className="text-4xl " />
            <div>
              <h1 className="text-2xl font-bold ">
                {props.userInfo?.firstName} {props.userInfo?.lastName}
              </h1>
              <h1 className="text-md font-bold text-slate-500">
                {props.userInfo?.tweets?.length} Tweets
              </h1>
            </div>
          </nav>
          <div className="p-4 border-b border-slate-800">
            {props.userInfo?.profileImageUrl && (
              <Image
                src={props.userInfo?.profileImageUrl}
                alt="User Image"
                className="rounded-full"
                width={100}
                height={100}
              />
            )}
            <h1 className="text-2xl font-bold mt-5  ">
              {props.userInfo?.firstName} {props.userInfo?.lastName}
            </h1>
            <div className="flex justify-between items-center">
              <div className="flex gap-4 mt-2 text-sm text-gray-400">
                <span> {props.userInfo?.followers?.length} followers</span>
                <span> {props.userInfo?.following?.length} following </span>
              </div>
              {currentUser?.id !== props.userInfo?.id && (
                <>
                  {amIFollowing ? (
                    <button onClick={handleUnFollowUser} className="bg-white text-black px-3 py-1 rounded-full text-sm">
                      Unfollow
                    </button>
                  ) : (
                    <button onClick={handleFollowUser}  className="bg-white text-black px-3 py-1 rounded-full text-sm">
                      Follow
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
          <div>
            {props.userInfo?.tweets?.map((tweet) => (
              <FeedCard key={tweet?.id} data={tweet as Tweet} />
            ))}
          </div>
        </div>
      </TwitterLayout>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<ServerProps> = async (
  context
) => {
  const id = context.query.id as string | undefined;
  if (!id) {
    return {
      notFound: true,
      props: {
        userInfo: undefined,
      },
    };
  }
  const userInfo = await graphqlClient.request(getUserByIdQuery, { id });

  if (!userInfo?.getUserById) {
    return { notFound: true };
  }

  return {
    props: {
      userInfo: userInfo.getUserById as User,
    },
  };
};
export default UserProfilePage;
