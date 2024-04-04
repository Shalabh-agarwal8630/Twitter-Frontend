import Image from "next/image";
import { BiImageAlt } from "react-icons/bi";

import FeedCard from "@/components/FeedCard";
import { useCallback, useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/user";
import { useCreateTweet, useGetAllTweets } from "@/hooks/tweet";
import { Tweet } from "@/gql/graphql";
import TwitterLayout from "@/components/Layout/TwitterLayout";
import { GetServerSideProps } from "next";
import { graphqlClient } from "@/clients/api";
import { getAllTweetsQuery, getSignedURLForTweetQuery } from "@/graphql/query/tweet";
import axios from "axios";
import toast from "react-hot-toast";

//This is an array of twittersidebarbutton
interface HomeProps{
  tweets?:Tweet[]
}

export default function Home(props:HomeProps) {
  const { user } = useCurrentUser();
  const {tweets=props.tweets as Tweet[] }= useGetAllTweets()
  const { mutateAsync } = useCreateTweet();

  const [content, setContent] = useState("");
  const [imageURL, setImageURL] = useState("");
 
  const handleInputChangeFile=useCallback((input:HTMLInputElement)=>{
    return async (event:Event)=>{
      event.preventDefault();
      const file:File |null |undefined=input.files?.item(0);
      if(!file) return;

      const {getSignedURLForTweet}=await graphqlClient.request(getSignedURLForTweetQuery,{
        imageName:file.name,
        imageType:file.type,
      })
      if(getSignedURLForTweet)
      {
        toast.loading("Uploading Image",{id:'2'})
        await axios.put(getSignedURLForTweet,file ,{
          headers:{
            "Content-Type":file.type
          }
        })
      }
      toast.success("Uploaded Image successfully",{id:'2'})
      const url=new URL(getSignedURLForTweet)
      const myFilePath=`${url.origin}${url.pathname}`
      setImageURL(myFilePath);

    };
  },[])

  const handleSelectImage = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    const handlerFn=handleInputChangeFile(input);
    input.addEventListener('change',handlerFn);
    input.click();

  }, [handleInputChangeFile]);

  const handleCreateTweet = useCallback(async () => {
    await mutateAsync({
      content,
      imageURL
    });
      // Clear the content of the textarea
  setContent("");
  setImageURL("")
  }, [content, mutateAsync  ,imageURL]);

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
                {
                  imageURL&& <Image src={imageURL} alt="Image-op" height={300} width={300}/>
                }
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
        {tweets?.map((tweet) =>
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
      tweets:allTweets.getAllTweets as Tweet[],
    }
  }
}