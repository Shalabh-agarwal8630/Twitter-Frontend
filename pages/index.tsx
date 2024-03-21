import Image from "next/image";
import { BiImageAlt } from "react-icons/bi";

import FeedCard from "@/components/FeedCard";
import { useCallback, useState } from "react";
import { useCurrentUser } from "@/hooks/user";
import { useCreateTweet, useGetAllTweets } from "@/hooks/tweet";
import { Tweet } from "@/gql/graphql";
import TwitterLayout from "@/components/Layout/TwitterLayout";
import { GetServerSideProps } from "next";
import { graphqlClient } from "@/clients/api";
import { getAllTweetsQuery } from "@/graphql/query/tweet";

//This is an array of twittersidebarbutton
interface HomeProps{
  tweets?:Tweet[]
}

export default function Home(props:HomeProps) {
  const { user } = useCurrentUser();

  const { mutate } = useCreateTweet();
  const [content, setContent] = useState("");
  const handleSelectImage = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();
  }, []);

  const handleCreateTweet = useCallback(() => {
    mutate({
      content,
    });
      // Clear the content of the textarea
  setContent("");
  }, [content, mutate]);

  return (
    <div>
      <TwitterLayout>
        <div>
          <div className="border border-gray-600 p-4 border-r-0 border-l-0 border-b-0 hover:bg-slate-900 transition-all cursor-pointer">
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-1">
                {user?.profileImageUrl && (
                  <Image
                    className="rounded-full"
                    src={user?.profileImageUrl}
                    alt="user-image"
                    height={50}
                    width={50}
                  />
                )}
              </div>

              <div className="col-span-11">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's happening?"
                  className=" w-full bg-transparent text-xl px-3 border-b border-slate-600"
                  rows={2}
                ></textarea>
                <div className="mt-2 flex justify-between items-center">
                  <BiImageAlt
                    onClick={handleSelectImage}
                    className="text-xl"
                  ></BiImageAlt>
                  <button
                    onClick={handleCreateTweet}
                    className="bg-[#1d9bf0] font-semibold py-2 px-4   rounded-full  text-lg  "
                  >
                    Tweet
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {props.tweets?.map((tweet) =>
          tweet ? <FeedCard key={tweet?.id} data={tweet as Tweet} /> : null
        )}
      </TwitterLayout>
    </div>
  );
}

export const getServerSideProps:GetServerSideProps<HomeProps>=async(context)=>{
  const allTweets=await graphqlClient.request(getAllTweetsQuery);
  return {
    props:{
      tweets:allTweets.getAllTweets as Tweet[]
    }
  }
}