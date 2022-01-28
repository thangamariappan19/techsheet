import { useState } from "react";
import { checkAuth } from "../Lib/CheckAuth";
import Alert from "./Alert";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../Firebase/Firebase";
import useSWR, { useSWRConfig } from "swr";

const fetcher = (...args) => fetch(...args).then((res) => res.json());

function Comments({ id }) {
  const [comment, setComment] = useState("");
  const [viewAlert, setViewAlert] = useState(false);

  const { mutate } = useSWRConfig();
  const { data, error } = useSWR(`/api/comments/${id}`, fetcher);

  const handelPost = async (e) => {
    e.preventDefault();
    setComment("");

    const user = checkAuth();

    if (!user) {
      setViewAlert(true);

      setTimeout(() => {
        setViewAlert(false);
      }, 2000);

      return;
    }

    if (comment && user) {
      const docData = {
        userName: user.name,
        userImage: user.photo,
        comment: comment,
        date: Timestamp.now(),
        userId: user.uid,
      };

      const ref = collection(db, "posts", id, "comments");
      const docRef = await addDoc(ref, docData);
      mutate(`/api/post/${id}`);
    }
  };

  return (
    <>
      
    </>
  );
}

export default Comments;
