import React, { useCallback, useState, useRef } from "react";
import { Input, InputGroup, Message, toaster, IconButton } from "rsuite";
import SendIcon from "@rsuite/icons/Send";
import { FaMicrophone, FaStop } from "react-icons/fa";
import PaperclipIcon from "@rsuite/icons/Attachment";
import { serverTimestamp, ref, push, update } from "firebase/database";
import { useParams } from "react-router";
import { useProfile } from "../../../context/profile.context";
import { database } from "../../../misc/firebase.config";
import axios from "axios";

function assembleMessage(profile, chatId) {
  return {
    roomId: chatId,
    author: {
      name: profile.name,
      uid: profile.uid,
      createdAt: profile.createdAt,
      ...(profile.avatar ? { avatar: profile.avatar } : {}),
    },
    createdAt: serverTimestamp(),
    likeCount: 0,
  };
}

const ChatBottom = () => {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

  const { chatId } = useParams();
  const { profile } = useProfile();

  // Handle input change
  const onInputChange = useCallback((value) => {
    setInput(value);
  }, []);

  // Send text message
  const onSendClick = async () => {
    if (input.trim() === "") return;

    const msgData = assembleMessage(profile, chatId);
    msgData.text = input.trim();

    const updates = {};
    const messageId = push(ref(database, "messages")).key;

    updates[`/messages/${messageId}`] = msgData;
    updates[`/rooms/${chatId}/lastMessage`] = { ...msgData, msgId: messageId };

    setIsLoading(true);
    try {
      await update(ref(database), updates);
      setInput("");
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      toaster.push(
        <Message type="error" closable duration={4000}>
          {error.message}
        </Message>
      );
    }
  };

  // Handle Enter key to send
  const onKeyDown = (e) => {
    if (e.keyCode === 13) {
      e.preventDefault();
      onSendClick();
    }
  };

  // File upload (images, PDFs, etc.) via Cloudinary
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setIsLoading(true);
    const updates = {};

    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "chat_upload"); // Your unsigned preset

        const response = await axios.post(
          "https://api.cloudinary.com/v1_1/dflxpuxf6/upload",
          formData
        );

        const fileData = {
          contentType: file.type,
          name: file.name,
          url: response.data.secure_url,
        };

        const msgData = assembleMessage(profile, chatId);
        msgData.file = fileData;

        const messageId = push(ref(database, "messages")).key;
        updates[`/messages/${messageId}`] = msgData;
      } catch (err) {
        toaster.push(
          <Message type="error" closable duration={4000}>
            {err.message}
          </Message>
        );
      }
    }

    const lastMsgId = Object.keys(updates).pop();
    if (lastMsgId) {
      updates[`/rooms/${chatId}/lastMessage`] = {
        ...updates[lastMsgId],
        msgId: lastMsgId,
      };
    }

    try {
      await update(ref(database), updates);
      toaster.push(<Message type="success">File uploaded successfully!</Message>);
    } catch (err) {
      toaster.push(
        <Message type="error" closable duration={4000}>
          {err.message}
        </Message>
      );
    }

    setIsLoading(false);
  };

  // Voice-to-text using browser speech recognition
  const handleMicClick = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    if (!("webkitSpeechRecognition" in window)) {
      toaster.push(<Message type="error">Speech recognition not supported!</Message>);
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => prev + " " + transcript);
    };

    recognition.onerror = () => {
      toaster.push(<Message type="error">Mic error. Try again.</Message>);
      setIsRecording(false);
    };

    recognition.onend = () => setIsRecording(false);

    recognition.start();
    recognitionRef.current = recognition;
    setIsRecording(true);
  };

  return (
    <div>
      <InputGroup>
        {/* 📎 File Upload */}
        <InputGroup.Button as="label" htmlFor="fileInput" disabled={isLoading}>
          <PaperclipIcon />
          <input
            id="fileInput"
            type="file"
            multiple
            onChange={handleFileUpload}
            style={{ display: "none" }}
          />
        </InputGroup.Button>

        {/* 🎤 Mic */}
        <IconButton
          icon={isRecording ? <FaStop /> : <FaMicrophone />}
          onClick={handleMicClick}
          color={isRecording ? "red" : "blue"}
          appearance="primary"
        />

        {/* 💬 Text Input */}
        <Input
          placeholder="Write a new message here..."
          value={input}
          onChange={onInputChange}
          onKeyDown={onKeyDown}
        />

        {/* 🚀 Send Button */}
        <InputGroup.Button
          color="blue"
          appearance="primary"
          onClick={onSendClick}
          disabled={isLoading}
        >
          <SendIcon />
        </InputGroup.Button>
      </InputGroup>
    </div>
  );
};

export default ChatBottom;
