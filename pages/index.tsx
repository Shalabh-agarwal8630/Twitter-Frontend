import Image from "next/image";
import { Inter } from "next/font/google";
import { BsBell, BsBookmark, BsEnvelope, BsTwitter } from "react-icons/bs";
import {
  BiHash,
  BiHomeCircle,
  BiImageAlt,
  BiMoney,
  BiUser,
} from "react-icons/bi";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import FeedCard from "@/components/FeedCard";
import { SlOptions } from "react-icons/sl";
import { useCallback, useState } from "react";
import { toast } from "react-hot-toast";
import { graphqlClient } from "@/clients/api";
import { verifyUserGoogleTokenQuery } from "@/graphql/query/user";
import { useCurrentUser } from "@/hooks/user";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import { useCreateTweet, useGetAllTweets } from "@/hooks/tweet";
import { Maybe, Tweet, User } from "@/gql/graphql";

interface TwitterSidebarButton {
  title: string;
  icon: React.ReactNode;
}
``;
//This is an array of twittersidebarbutton
const sidebarMenuItems: TwitterSidebarButton[] = [
  { title: "Home", icon: <BiHomeCircle /> },
  { title: "Explore", icon: <BiHash /> },
  { title: "Notification", icon: <BsBell /> },
  {
    title: "Messages",
    icon: <BsEnvelope />,
  },
  {
    title: "Bookmarks",
    icon: <BsBookmark />,
  },
  {
    title: "Twitter Blue",
    icon: <BiMoney />,
  },
  {
    title: "Profile",
    icon: <BiUser />,
  },
  {
    title: "More Options",
    icon: <SlOptions />,
  },
];

export default function Home() {
  const { user } = useCurrentUser();
  const { tweets = [] } = useGetAllTweets();
  const queryClient = useQueryClient();
  const{mutate}=useCreateTweet();
  const [content,setContent]=useState('');
  const handleSelectImage = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();
  }, []);

  const  handleCreateTweet=useCallback(()=>{
    mutate({
       content
    })
  },[content,mutate])


  const handleLoginWithGoogle = useCallback(
    async (cred: CredentialResponse) => {
      const googleToken = cred.credential;
      if (!googleToken) {
        return toast.error("Google Token Not Found!!");
      }
      console.log("Google Token:", googleToken);

      const { verifyGoogleToken } = await graphqlClient.request(
        verifyUserGoogleTokenQuery,
        {
          token: googleToken,
        }
      );
      toast.success("Verified Google Token Success");
      console.log(verifyGoogleToken);
      if (verifyGoogleToken) {
        window.localStorage.setItem("__Twitter__token", verifyGoogleToken);
      }
      await queryClient.invalidateQueries({
        predicate: (query) => {
          return query.queryKey.includes("current-user");
        },
      });
    },
    [queryClient]
  );

  return (
    <div>
      <div className="grid grid-cols-12  h-screen w-screen px-56">
        <div className="col-span-3  pt-1  ml-28 relative">
          <div className="text-2xl h-fit w-fit hover:bg-gray-800 rounded-full p-4 cursor-pointer transition-all  ">
            <BsTwitter />
          </div>
          <div className="mt-1 text-xl pr-4 ">
            <ul>
              {sidebarMenuItems.map((item, index) => (
                <li
                  key={index}
                  className="flex justify-start items-center gap-4 hover:bg-gray-800 rounded-full px-3 py-3 w-fit cursor-pointer mt-2"
                >
                  <span className="text-3xl">{item.icon}</span>
                  <span>{item.title}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 px-10">
              <button className="bg-[#1d9bf0] font-semibold py-2 px-4  rounded-full w-full text-lg  ">
                Tweet
              </button>
            </div>
          </div>
          {user && (
            <div className="absolute bottom-5 flex gap-5 items-center bg-slate-800 px-3 py-2 rounded-full">
              {user && user.profileImageUrl && (
                <Image
                  className="rounded-full"
                  src={user?.profileImageUrl}
                  alt="user-image"
                  height={50}
                  width={50}
                ></Image>
              )}
              <div>
                <h3 className="text-xl">
                  {" "}
                  {user.firstName} {user.lastName}
                </h3>
              </div>
            </div>
          )}
        </div>

        <div className="col-span-5 border-r-[1px] border-l-[1px]   border-gray-600 p-4">
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
                    <button onClick={handleCreateTweet} className="bg-[#1d9bf0] font-semibold py-2 px-4   rounded-full  text-lg  ">
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
        </div>
        <div className="col-span-3">
          {!user && (
            <div className=" p-5 bg-slate-700 rounded-lg">
              <h1 className="my-2 text-2xl"> New to Twitter?</h1>
              <GoogleLogin onSuccess={handleLoginWithGoogle} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
