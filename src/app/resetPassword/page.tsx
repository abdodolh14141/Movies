"use client";

import axios from "axios";
import React from "react";
import { toast, Toaster } from "sonner";

const page = () => {
  const restPassEmail = async () => {
    try {
      const res = await axios.post("/restPass");
      if (res.status === 200) {
        toast.success("Success Rest Password");
      }
    } catch (error: any) {
      toast.error(error);
    }
  };
  return (
    <>
      <Toaster />
      <div className="w-full">
        <h1 className="text-center text-4xl m-20">Reset Password</h1>

        <div className="bg-white w-full max-w-7xl m-auto flex justify-start  rounded-lg shadow-md p-40">
          <form className="text-black" onSubmit={restPassEmail}>
            <label htmlFor="email" className="text-center text-2xl">
              Email :
            </label>
            <br />
            <input
              type="text"
              id="email"
              className="bg-black p-4 rounded-lg w-full"
              placeholder="Enter Email"
            />
            <button
              className="bg-black text-red-700 p-2 rounded-lg m-3 transform hover:scale-125"
              type="submit"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default page;
