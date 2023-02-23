import { useEffect, useState } from "react";
import useWebsocket, { ReadyState } from "react-use-websocket";
import {
  IconButton,
  InputAdornment,
  Paper,
  Snackbar,
  Stack,
  styled,
  TextField,
  Typography,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import Masonry from "@mui/lab/Masonry";
import { pink } from "@mui/material/colors";
import Moment from "react-moment";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: pink[50],
  padding: theme.spacing(3.0),
  textAlign: "center",
  color: theme.palette.text.secondary,
  boxShadow:
    "rgba(240, 46, 170, 0.4) -5px 5px, rgba(240, 46, 170, 0.3) -10px 10px, rgba(240, 46, 170, 0.2) -15px 15px, rgba(240, 46, 170, 0.1) -20px 20px, rgba(240, 46, 170, 0.05) -25px 25px;",
}));

interface Chat {
  id: string;
  create_date: string;
  message: string;
  sender: string;
}

interface Message {
  type: number;
  sender_username: string;
  body: string;
}

export default function Home() {
  const [message, setMessage] = useState<string>("");
  const [notification, setNotification] = useState<string | undefined>(
    undefined
  );
  const socketUrl = "wss://api.freejing.com/v1/ws";
  const { sendMessage, lastMessage, readyState } = useWebsocket(socketUrl);

  const [chatHistory, setChatHistory] = useState<Chat[]>([]);
  useEffect(() => {
    if (lastMessage !== null) {
      const message: Chat[] & Message = JSON.parse(lastMessage.data);
      if (message?.type) {
        setNotification(message.body);
      } else {
        setChatHistory(message);
      }
    }
  }, [lastMessage]);

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];

  const handleCloseSnackbar = () => setNotification(undefined);

  return (
    <>
      <Snackbar
        open={Boolean(notification)}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        action={
          <>
            <IconButton size="small" onClick={handleCloseSnackbar}>
              <CloseIcon color="success" />
            </IconButton>
          </>
        }
        message={notification}
      />
      <div className="relative flex flex-col max-h-[calc(100vh-136px)] h-full overflow-auto items-center p-8">
        <Masonry spacing={4} columns={{ xs: 1, sm: 2, lg: 4 }}>
          {chatHistory.map(({ id, create_date, message, sender }) => (
            <Item key={id}>
              <Stack spacing={1}>
                <div className="flex justify-end font-poppins text-xs">
                  <Moment fromNow>{create_date}</Moment>
                </div>
                <div className="font-montserrat text-2xl font-semibold">
                  {sender}
                </div>
                <div className="font-montserrat text-xl">{message}</div>
              </Stack>
            </Item>
          ))}
        </Masonry>
        <div className="fixed left-0 right-0 bottom-0 bg-pink-200 p-4 py-10">
          <div className="flex gap-x-3 max-w-[700px] mx-auto">
            <TextField
              fullWidth
              color="error"
              label="Say Something"
              variant="filled"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  sendMessage(message);
                  setMessage("");
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <SendIcon />
                  </InputAdornment>
                ),
              }}
              placeholder="Feel free to ask any questions!"
            />
          </div>
        </div>
      </div>
    </>
  );
}
