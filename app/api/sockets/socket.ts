import type { NextApiRequest, NextApiResponse } from "next";
import { Server as IOServer } from "socket.io";

type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: {
      io?: IOServer;
    };
  };
};

let count = 0;

export default function handler() {}
