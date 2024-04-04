import Image from "next/image";
import React from "react";
import { AiOutlineHeart } from "react-icons/ai";
import { BiMessageRounded, BiUpload } from "react-icons/bi";
import { FaRetweet } from "react-icons/fa";
import { Tweet } from "@/gql/graphql";
import Link from "next/link";

interface FeedCardProps {
  data: Tweet;
}

const FeedCard: React.FC<FeedCardProps> = (props) => {
  const { data } = props;
  console.log(data.author?.profileImageUrl);
  console.log(data.author?.firstName ," op ",data.author?.lastName);

  return (
    <div className="border border-gray-600 p-4 border-r-0 border-l-0 border-b-0 hover:bg-slate-900 transition-all cursor-pointer">
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-1">
          {data.author?.profileImageUrl && (
            <Image
              className="rounded-full"
              src={data.author.profileImageUrl}
              alt="user-image"
              height={50}
              width={50}
            />
          )}
        </div>
        <div className="col-span-11">
          <h5>
            <Link href={`/${data.author?.id}`}>
              {data.author?.firstName} {data.author?.lastName}{" "}
            </Link>
            
          </h5>
          <p>{data.content}</p>
          {data.imageURL && (
            <Image
              src={data.imageURL}
              alt="Image-op"
              width={400}
              height={400}
              className="rounded-xl"
            />
          )}

          <div className="flex justify-between mt-5 text-xl items-center p-2 w-[90%]">
            <div>
              <BiMessageRounded />
            </div>
            <div>
              <FaRetweet />
            </div>
            <div>
              <AiOutlineHeart />
            </div>
            <div>
              <BiUpload />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedCard;
